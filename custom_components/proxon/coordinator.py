"""DataUpdateCoordinator für Proxon FWT — auf Basis von modbus-connection.

Das Registerwissen liegt jetzt in der Gerätebibliothek `proxon-modbus`, der
Transport in `modbus_connection`; hier bleibt nur die Verbindung zu Home
Assistant.

**Der Datenvertrag bleibt unverändert.** `coordinator.data` trägt exakt
dieselben Schlüssel wie vorher (die Namen aus `const.py` plus die abgeleiteten
`nbe_*_N`, `filter_wechsel_faellig`, `geraetefilter_remaining_days`), damit
keine der neun Entity-Plattformen angefasst werden muss. `test_datenvertrag.py`
prüft das maschinell.

Was hier **weggefallen** ist, weil es pymodbus-Eigenheiten waren:

* der Logfilter `_SuppressModbusNoise` — tmodbus meldet Fremdframes nicht als
  Fehler des eigenen Requests;
* der Affenpatch auf `ModbusProtocol.datagram_received`, der einen
  `ModbusIOException` abfing, damit asyncio ihn nicht als fatal meldet;
* das Öffnen/Schließen einer eigenen Verbindung je Zyklus — die Verbindung
  gehört jetzt der `modbus`-Integration und wird geteilt;
* `_INTER_BLOCK_DELAY` und `_POST_CONNECT_DRAIN` als Handarbeit; beides sind
  jetzt Parameter der Verbindung (`message_spacing`, `connect_delay`).
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from modbus_connection import ModbusError, ModbusUnit
from proxon_modbus import ProxonDevice, ProxonUnreachable

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    FWT_HOLDING_REGISTERS,
    FWT_INPUT_REGISTERS,
    T300_HOLDING_REGISTERS,
    T300_INPUT_REGISTERS,
)
from .optimistic import OptimisticCache

_LOGGER = logging.getLogger(__name__)

# Nur eine ERROR-Meldung, wenn die Anlage länger als das hier nicht antwortet.
# Kurze Aussetzer sind auf diesem Bus normal.
_FAILURE_ERROR_THRESHOLD = timedelta(minutes=10)

# (Registertabelle aus const.py, Attribut auf ProxonDevice, Schlüssel-Präfix)
# Die T300-Felder heißen in der Bibliothek ohne Präfix, weil die Klasse den
# Namensraum schon aufspannt; in `coordinator.data` tragen sie ihn weiter.
_REGISTER_SOURCES: tuple[tuple[dict, str, str], ...] = (
    (FWT_INPUT_REGISTERS, "fwt_input", ""),
    (FWT_HOLDING_REGISTERS, "fwt_holding", ""),
    (T300_INPUT_REGISTERS, "t300_input", "t300_"),
    (T300_HOLDING_REGISTERS, "t300_holding", "t300_"),
)


class ProxonCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Liest die Anlage und stellt die dekodierten Werte bereit."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry_id: str,
        unit: ModbusUnit,
        host: str,
        port: int,
        slave: int,
        scan_interval: int,
        has_t300: bool = True,
    ) -> None:
        # Identität hängt an der entry_id, nicht am Host: die Adresse ändert
        # sich (neue DHCP-Lease, anderes VLAN), die entry_id nicht.
        self.entry_id = entry_id
        self.host = host
        self.port = port
        self.slave = slave
        self.has_t300 = has_t300

        self._unit = unit
        self.device = ProxonDevice(unit, has_t300=has_t300)

        # Zeitpunkt des ersten Zyklus, in dem gar nichts ankam.
        self._failure_start: datetime | None = None
        # Geschriebene, noch nicht durch einen Poll bestätigte Werte.
        self._optimistic = OptimisticCache(hold_seconds=2 * scan_interval + 30)

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan_interval),
        )

    # ── Lesen ────────────────────────────────────────────────────────────

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            failed = await self.device.async_update()
        except ProxonUnreachable as err:
            self._note_total_failure()
            raise UpdateFailed(
                f"Proxon unter {self.host}:{self.port} nicht erreichbar: {err}"
            ) from err
        except ModbusError as err:
            self._note_total_failure()
            raise UpdateFailed(f"Modbus-Fehler: {err}") from err

        if self._failure_start is not None:
            _LOGGER.info("Proxon wieder erreichbar")
            self._failure_start = None
        if failed:
            # Kein Drama: die betroffenen Baugruppen behalten ihre letzten
            # Werte, die Entities bleiben verfügbar.
            _LOGGER.debug("Baugruppen ohne frische Daten: %s", ", ".join(failed))

        return self._optimistic.apply(self._build_data())

    def _note_total_failure(self) -> None:
        if self._failure_start is None:
            self._failure_start = datetime.now()
            return
        elapsed = datetime.now() - self._failure_start
        if elapsed >= _FAILURE_ERROR_THRESHOLD:
            _LOGGER.error(
                "Proxon seit %d Minuten ohne Daten",
                int(elapsed.total_seconds() / 60),
            )

    def _build_data(self) -> dict[str, Any]:
        """Bibliotheksfelder auf die bisherigen `coordinator.data`-Schlüssel legen."""
        data: dict[str, Any] = {}

        for registers, attribute, prefix in _REGISTER_SOURCES:
            component = getattr(self.device, attribute)
            if component is None:      # T300 nicht verbaut
                for key in registers:
                    data[key] = None
                continue
            for key in registers:
                field = key[len(prefix):] if prefix else key
                # Fehlendes Feld -> None, wie in der pymodbus-Fassung. Betrifft
                # `schreibrechte` (Reg 438): liegt in keinem Leseblock und wurde
                # auch früher nie gelesen.
                data[key] = getattr(component, field, None)

        # Abgeleitete Werte
        data["filter_wechsel_faellig"] = self.device.fwt_input.filter_wechsel_faellig
        data["geraetefilter_remaining_days"] = (
            self.device.fwt_holding.geraetefilter_remaining_days
        )

        # NBE: die Plattformen greifen über den physischen Index zu.
        temperatures = self.device.nbe_temperatures.devices
        settings = self.device.nbe_settings.devices
        for n in range(len(temperatures)):
            data[f"nbe_temp_{n}"] = temperatures[n].temperatur
            data[f"nbe_offset_{n}"] = settings[n].offset_k
            data[f"nbe_mittel_{n}"] = settings[n].mitteltemperatur
            data[f"nbe_ptc_{n}"] = settings[n].ptc_freigabe

        return data

    # ── Schreiben ────────────────────────────────────────────────────────

    async def async_write(
        self, address: int, value: int, optimistic: dict[str, Any] | None = None,
    ) -> None:
        """Register schreiben und das Ergebnis sofort anzeigen.

        `optimistic` sind die dekodierten Werte, die die Entities zeigen sollen.
        Sie werden **vor** dem Modbus-Write gesetzt, weil Write plus
        bestätigender Poll zusammen mehrere Sekunden dauern — ohne das sieht ein
        Tap im Frontend aus, als hätte er nicht reagiert.

        Schlägt der Write fehl, wird die Vormerkung zurückgenommen und ein
        `HomeAssistantError` geworfen; ein stillschweigend geschluckter Write
        ließ die UI früher wortlos zurückspringen.
        """
        previous: dict[str, Any] = {}
        if optimistic and self.data is not None:
            previous = {key: self.data.get(key) for key in optimistic}
            self._optimistic.set(optimistic)
            self.async_set_updated_data({**self.data, **optimistic})

        if await self.write_register(address, value):
            return

        if optimistic:
            self._optimistic.drop(optimistic)
            if previous and self.data is not None:
                self.async_set_updated_data({**self.data, **previous})
        raise HomeAssistantError(
            f"Proxon: Schreiben auf Register {address} (Wert {value}) fehlgeschlagen"
        )

    async def write_register(self, address: int, value: int) -> bool:
        """Ein Holding-Register schreiben. True bei Erfolg.

        Entities rechnen den Rohwert selbst aus und übergeben die Adresse, wie
        bisher — deshalb geht der Write direkt an die Unit und nicht über die
        Feld-Kodierung der Bibliothek.
        """
        try:
            await self.device.async_unlock()
            await self._unit.write_register(address, value)
        except ModbusError as err:
            _LOGGER.error("Modbus-Fehler beim Schreiben auf %d: %s", address, err)
            return False
        return True

    async def async_read_room_names(self) -> list[str | None]:
        """Namens-Slots lesen (nur bei Bedarf, nicht in jedem Zyklus)."""
        await self.device.async_update_room_names()
        return [slot.name for slot in self.device.room_names.slots]
