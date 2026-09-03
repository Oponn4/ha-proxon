"""Config flow for Proxon FWT integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from modbus_connection import ModbusError, ModbusTcpParams
from proxon_modbus import (
    UNLOCK_REGISTER,
    UNLOCK_VALUE,
    RoomNames,
    is_configured_room,
    physical_index,
)

from homeassistant.components.modbus import async_get_temporary_unit
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SCAN_INTERVAL  # noqa: F401 (re-exported via entry data)
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.selector import NumberSelector, NumberSelectorConfig, NumberSelectorMode

from .const import CONF_FILTER_NOTIFICATION, CONF_HAS_T300, CONF_ROOMS, CONF_SLAVE, DOMAIN, DEFAULT_PORT, DEFAULT_SLAVE, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

STEP_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_HOST): str,
        vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
        vol.Optional(CONF_SLAVE, default=DEFAULT_SLAVE): NumberSelector(NumberSelectorConfig(min=1, max=247, mode=NumberSelectorMode.BOX)),
        vol.Optional(CONF_HAS_T300, default=True): bool,
        vol.Required(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): vol.All(
            int, vol.Range(min=10, max=120)
        ),
        vol.Optional(CONF_FILTER_NOTIFICATION, default=True): bool,
    }
)


def _modbus_params(host: str, port: int) -> ModbusTcpParams:
    """Verbindungsdaten der Anlage. RTU-Framing über TCP, wegen der USR-Bridge."""
    return ModbusTcpParams(host=host, port=port, framer="rtu")


async def _probe_and_discover(
    hass: HomeAssistant, host: str, port: int, slave: int
) -> list[dict]:
    """Verbindung prüfen und belegte Raum-Slots auslesen.

    Läuft über eine **temporäre** Unit: im Config Flow gibt es noch keinen
    Config Entry, an dem eine Verbindung hängen könnte. Hält bereits ein
    anderer Entry die Verbindung, wird sie mitbenutzt und bleibt danach offen;
    eine hier geöffnete wird beim Verlassen geschlossen.

    Wirft `ModbusError`/`HomeAssistantError`, wenn die Anlage nicht antwortet.
    Die Raumnamen sind dagegen bewusst unkritisch: sie brauchen die
    Freischaltung (Reg 438), und wenn die scheitert, ist das kein Grund, die
    Einrichtung abzubrechen — dann gibt es eben keine benannten Räume.

    Rückgabe je Raum:
      name_idx     – Position in der Namenstabelle (0 = HBDE, 1–7 = NBE)
      physical_idx – physisches NBE-Gerät (name_idx − 1), None für HBDE
      name         – Raumname
    Werkseinstellungen („Raum 5") und leere Slots fallen raus.
    """
    async with async_get_temporary_unit(
        hass, _modbus_params(host, port), slave
    ) as unit:
        # Betriebsart (Input 23) als Lebenszeichen — ein Register, das die
        # Anlage ohne Freischaltung beantwortet.
        await unit.read_input_registers(23, 1)

        try:
            await unit.write_register(UNLOCK_REGISTER, UNLOCK_VALUE)
            names = RoomNames(unit)
            await names.async_update()
        except ModbusError:
            _LOGGER.debug("Raumnamen nicht lesbar; fahre ohne fort", exc_info=True)
            return []

        return [
            {
                "name_idx": idx,
                "physical_idx": physical_index(idx),
                "name": slot.name,
            }
            for idx, slot in enumerate(names.slots)
            if is_configured_room(slot.name)
        ]


class ProxonOptionsFlow(OptionsFlow):
    """Handle options for Proxon FWT."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        current_filter = self.config_entry.options.get(CONF_FILTER_NOTIFICATION, True)
        current_interval = self.config_entry.options.get(
            CONF_SCAN_INTERVAL,
            self.config_entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_FILTER_NOTIFICATION, default=current_filter): bool,
                    vol.Required(CONF_SCAN_INTERVAL, default=current_interval): vol.All(
                        int, vol.Range(min=10, max=120)
                    ),
                }
            ),
        )


class ProxonConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Proxon FWT."""

    VERSION = 1

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry) -> ProxonOptionsFlow:
        return ProxonOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input[CONF_HOST]
            port = user_input[CONF_PORT]
            slave = int(user_input[CONF_SLAVE])

            try:
                rooms = await _probe_and_discover(self.hass, host, port, slave)
            except (ModbusError, HomeAssistantError, OSError):
                _LOGGER.debug("Proxon nicht erreichbar", exc_info=True)
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected error during setup")
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(f"proxon_{host}_{port}_{slave}")
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"Proxon FWT ({host})",
                    data={
                        CONF_HOST: host,
                        CONF_PORT: port,
                        CONF_SLAVE: slave,
                        CONF_HAS_T300: user_input.get(CONF_HAS_T300, True),
                        CONF_ROOMS: rooms,
                    },
                    options={
                        CONF_FILTER_NOTIFICATION: user_input.get(CONF_FILTER_NOTIFICATION, True),
                        CONF_SCAN_INTERVAL: user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_SCHEMA,
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Allow changing connection parameters and re-discovering rooms."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input[CONF_HOST]
            port = user_input[CONF_PORT]
            slave = int(user_input[CONF_SLAVE])
            try:
                rooms = await _probe_and_discover(self.hass, host, port, slave)
            except (ModbusError, HomeAssistantError, OSError):
                _LOGGER.debug("Proxon nicht erreichbar", exc_info=True)
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected error during reconfigure")
                errors["base"] = "unknown"
            else:
                return self.async_update_reload_and_abort(
                    entry,
                    data={
                        CONF_HOST: host,
                        CONF_PORT: port,
                        CONF_SLAVE: slave,
                        CONF_HAS_T300: user_input.get(CONF_HAS_T300, entry.data.get(CONF_HAS_T300, True)),
                        CONF_ROOMS: rooms,
                    },
                )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HOST, default=entry.data.get(CONF_HOST, "")): str,
                    vol.Optional(CONF_PORT, default=entry.data.get(CONF_PORT, DEFAULT_PORT)): cv.port,
                    vol.Optional(CONF_SLAVE, default=entry.data.get(CONF_SLAVE, DEFAULT_SLAVE)): NumberSelector(
                        NumberSelectorConfig(min=1, max=247, mode=NumberSelectorMode.BOX)
                    ),
                    vol.Optional(CONF_HAS_T300, default=entry.data.get(CONF_HAS_T300, True)): bool,
                }
            ),
            errors=errors,
        )
