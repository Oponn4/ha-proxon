#!/usr/bin/env python3
"""Proxon-Simulator: spielt die Anlage über Modbus TCP nach (RTU-Framing).

Zweck: Integration und UI testen, ohne an der echten Wärmepumpe zu schreiben.
Gefüttert wird er mit einem Abzug der echten Register (`tools/dump_registers.py`).

Warum RTU-Framing über TCP: die Anlage hängt an einem USR RS485-LAN-Adapter,
der RTU-Frames durchreicht. Die Integration verbindet sich deshalb mit
`AsyncModbusTcpClient(framer=FramerType.RTU)` — der Simulator muss dieselbe
Sprache sprechen, sonst testet man am Zielsystem vorbei.

Die drei Schalter, die den Praxisfall nachstellen:

  --latency SEK      künstliche Antwortzeit pro Registerzugriff. Der Adapter
                     braucht real ~0,15 s pro Block; über 15 Blöcke ergibt das
                     den ~3-s-Poll, der die UI träge wirken ließ.
  --lazy ADDR:SEK    Register übernimmt den geschriebenen Wert erst nach SEK.
                     Genau das Fenster, für das der OptimisticCache gebaut ist:
                     ein Poll dazwischen liefert noch den alten Wert.
  --reject ADDR      Write auf dieses Register wird mit einer Modbus-Exception
                     beantwortet → prüft den HomeAssistantError-Pfad.
  --alles-lesbar     schaltet die Lückenprüfung ab (siehe unten).

Beispiel:
    python tools/proxon_sim.py --dump proxon_dump.json --latency 0.15 \
        --lazy 62:8 --reject 2001

## Lücken im Adressraum

Die Anlage beantwortet **nicht** jedes Register. Ein Leseblock, der über eine
Lücke hinweggeht, scheitert komplett und nimmt jedes Feld darin mit. Genau das
ist am 2026-09-05 auf prod passiert: die neue Gerätebibliothek plante
`(16,92)` statt `(16,7)`+`(41,103)`, und sämtliche FWT-Holding-Entities waren
tot — während dieser Simulator munter grün meldete, weil er brav jede Adresse
beantwortete.

Ein Simulator, der mehr kann als das Original, testet am Zielsystem vorbei.
Deshalb prüft er jetzt jeden Lesezugriff gegen `LESBAR_*` und antwortet
außerhalb mit ILLEGAL_ADDRESS. Zum Erkunden unbekannter Register lässt sich
das mit `--alles-lesbar` abschalten.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import time

from pymodbus.datastore import (
    ModbusDeviceContext,
    ModbusSequentialDataBlock,
    ModbusServerContext,
)
from pymodbus.datastore.store import ExcCodes
from pymodbus.framer import FramerType
from pymodbus.server import ModbusTcpServer

_LOGGER = logging.getLogger("proxon_sim")

# pymodbus rechnet serverseitig `address + 1` auf den Datablock (siehe
# ModbusDeviceContext.getValues). Ein Block, der bei Adresse 1 beginnt, bildet
# damit Listenindex == clientseitige Registeradresse ab.
BLOCK_START = 1

# Bereiche, die die Anlage tatsächlich beantwortet — (erste, letzte Adresse),
# beide einschließlich. Abgeleitet aus `_READ_BLOCKS` der Integration, die seit
# Jahren an der echten Anlage läuft. Alles außerhalb quittiert der Adapter
# nicht sinnvoll, deshalb tut es der Simulator auch nicht.
LESBAR_HOLDING = [
    (16, 22),      # Sollbetriebsart, Bypass-Menü, Lüfterstufe
    (41, 143),     # Schwellen, Zonen, Bypass-Parameter
    (187, 187),    # HBDE PTC
    (213, 219),    # NBE Offsets
    (233, 239),    # NBE Mitteltemperaturen
    (253, 259),    # NBE PTC-Freigaben
    (438, 438),    # Schreibrechte (nur schreibend benutzt)
    (460, 460),    # Filterstandzeit
    (467, 469),    # Stundenzähler
    (613, 619),    # Nachtabsenkung
    (620, 699),    # Raumnamen, 8 Slots à 10 Register
    (2000, 2025),  # T300
]
LESBAR_INPUT = [
    (0, 51),
    (154, 265),
    (590, 610),    # NBE Temperaturen
    (811, 900),    # T300
]


def _liegt_in(bereiche: list[tuple[int, int]], start: int, count: int) -> bool:
    """True, wenn der ganze Zugriff in **einem** Bereich liegt."""
    ende = start + count - 1
    return any(von <= start and ende <= bis for von, bis in bereiche)


class ProxonDataBlock(ModbusSequentialDataBlock):
    """Datablock mit Latenz, verzögerter Übernahme und Ablehnung."""

    def __init__(
        self,
        values: list[int],
        latency: float = 0.0,
        lazy: dict[int, float] | None = None,
        reject: set[int] | None = None,
        label: str = "",
        lesbar: list[tuple[int, int]] | None = None,
    ) -> None:
        super().__init__(BLOCK_START, values)
        self._latency = latency
        self._lazy = lazy or {}
        self._reject = reject or set()
        self._label = label
        # None = keine Prüfung (--alles-lesbar)
        self._lesbar = lesbar
        # addr → (wert, frühester Übernahmezeitpunkt)
        self._pending: dict[int, tuple[int, float]] = {}

    def _settle_pending(self) -> None:
        now = time.monotonic()
        for addr, (value, apply_at) in list(self._pending.items()):
            if now >= apply_at:
                super().setValues(addr + BLOCK_START, [value])
                del self._pending[addr]
                _LOGGER.info("%s: Register %d übernimmt jetzt %d", self._label, addr, value)

    def getValues(self, address, count=1):
        """Lesen — außerhalb der lesbaren Bereiche mit Exception statt Nullen.

        Der Datablock gibt hier direkt einen `ExcCodes` zurück; pymodbus macht
        daraus die Modbus-Antwort. (Ein `validate()` gibt es an dieser Klasse
        nicht — `setValues` unten benutzt für `--reject` denselben Weg.)

        Damit scheitert ein Block, der eine Lücke überspannt, genauso wie an
        der echten Anlage, statt still Nullen zu liefern und einen
        Planungsfehler bis auf prod durchzulassen.
        """
        start = address - BLOCK_START
        if self._lesbar is not None and not _liegt_in(self._lesbar, start, count):
            _LOGGER.warning(
                "%s: Lesen %d–%d abgelehnt — überspannt eine Lücke (lesbar: %s)",
                self._label, start, start + count - 1,
                ", ".join(f"{v}-{b}" for v, b in self._lesbar),
            )
            return ExcCodes.ILLEGAL_ADDRESS
        if self._latency:
            time.sleep(self._latency)
        self._settle_pending()
        return super().getValues(address, count)

    def setValues(self, address, values):
        if self._latency:
            time.sleep(self._latency)
        # address kommt bereits mit dem +1 des DeviceContext an
        addr = address - BLOCK_START
        if addr in self._reject:
            _LOGGER.warning("%s: Write auf %d abgelehnt (--reject)", self._label, addr)
            return ExcCodes.ILLEGAL_ADDRESS
        delay = self._lazy.get(addr)
        if delay:
            self._pending[addr] = (values[0], time.monotonic() + delay)
            _LOGGER.info(
                "%s: Write auf %d = %d wird erst in %.0f s wirksam (--lazy)",
                self._label, addr, values[0], delay,
            )
            return None
        _LOGGER.info("%s: Register %d = %s", self._label, addr, values)
        return super().setValues(address, values)


def _values_from_dump(registers: dict[str, int], size: int) -> list[int]:
    """Sparse Registerdump → dichte Liste, Index == Registeradresse."""
    values = [0] * size
    for addr, value in registers.items():
        idx = int(addr)
        if 0 <= idx < size:
            values[idx] = int(value)
    return values


def _parse_lazy(entries: list[str]) -> dict[int, float]:
    lazy: dict[int, float] = {}
    for entry in entries:
        addr, _, seconds = entry.partition(":")
        lazy[int(addr)] = float(seconds or 10)
    return lazy


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dump", required=True, help="JSON aus tools/dump_registers.py")
    parser.add_argument("--host", default="0.0.0.0")  # Testwerkzeug, hört im LAN
    parser.add_argument("--port", type=int, default=5020)
    parser.add_argument("--slave", type=int, default=41)
    parser.add_argument("--latency", type=float, default=0.15,
                        help="Sekunden pro Registerzugriff (0 = so schnell wie möglich)")
    parser.add_argument("--lazy", action="append", default=[], metavar="ADDR:SEK",
                        help="Holding-Register übernimmt Writes verzögert")
    parser.add_argument("--reject", action="append", type=int, default=[], metavar="ADDR",
                        help="Writes auf dieses Holding-Register ablehnen")
    parser.add_argument("--alles-lesbar", action="store_true", dest="alles_lesbar",
                        help="Lückenprüfung abschalten (zum Erkunden unbekannter Register)")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")

    with open(args.dump, encoding="utf-8") as fh:
        dump = json.load(fh)

    holding = ProxonDataBlock(
        _values_from_dump(dump["registers"]["holding"], 2100),
        latency=args.latency,
        lazy=_parse_lazy(args.lazy),
        reject=set(args.reject),
        label="holding",
        lesbar=None if args.alles_lesbar else LESBAR_HOLDING,
    )
    inputs = ProxonDataBlock(
        _values_from_dump(dump["registers"]["input"], 950),
        latency=args.latency,
        label="input",
        lesbar=None if args.alles_lesbar else LESBAR_INPUT,
    )

    context = ModbusServerContext(
        devices={args.slave: ModbusDeviceContext(hr=holding, ir=inputs)}, single=False,
    )
    server = ModbusTcpServer(
        context, framer=FramerType.RTU, address=(args.host, args.port),
    )

    _LOGGER.info(
        "Proxon-Simulator auf %s:%d (slave %d), Dump vom %s, Latenz %.2fs%s%s",
        args.host, args.port, args.slave, dump.get("created", "?"), args.latency,
        f", lazy {args.lazy}" if args.lazy else "",
        f", reject {args.reject}" if args.reject else "",
    )
    if args.alles_lesbar:
        _LOGGER.warning(
            "Lückenprüfung AUS — der Simulator beantwortet jede Adresse und "
            "kann Planungsfehler in den Leseblöcken nicht mehr zeigen."
        )
    await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
