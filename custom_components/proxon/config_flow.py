"""Config flow for Proxon FWT integration."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import voluptuous as vol
from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException
from pymodbus.framer import FramerType

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SCAN_INTERVAL
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.selector import NumberSelector, NumberSelectorConfig, NumberSelectorMode

from .const import CONF_FILTER_NOTIFICATION, CONF_ROOM_NAMES, DOMAIN, DEFAULT_PORT, DEFAULT_SLAVE, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

CONF_SLAVE = "slave"

STEP_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_HOST): str,
        vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
        vol.Optional(CONF_SLAVE, default=DEFAULT_SLAVE): NumberSelector(NumberSelectorConfig(min=1, max=247, mode=NumberSelectorMode.BOX)),
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): vol.All(
            int, vol.Range(min=10, max=300)
        ),
        vol.Optional(CONF_FILTER_NOTIFICATION, default=True): bool,
    }
)


async def _read_nbe_names(
    client: AsyncModbusTcpClient, slave: int
) -> dict[str, str]:
    """Read NBE room names from holding registers 620+.

    The Proxon stores each name as 10 consecutive holding registers starting at
    620 + (nbe_index * 10).  Each register holds two packed ASCII/Latin-1 bytes
    (high byte = first char, low byte = second char).  A 0x00 byte terminates.

    Returns a dict of {str(nbe_index): name}, e.g. {"0": "Klavierzimmer"}.
    Missing or empty names are omitted so callers fall back to their defaults.
    """
    try:
        # Unlock service registers so reg 620+ is readable
        await client.write_register(438, 55555, device_id=slave)
        await asyncio.sleep(0.2)
    except Exception:
        return {}

    # (nbe_index, first_name_register)
    nbe_map = [(0, 620), (1, 630), (2, 640), (4, 680)]
    names: dict[str, str] = {}
    for nbe_idx, reg_start in nbe_map:
        try:
            result = await client.read_holding_registers(
                reg_start, count=10, device_id=slave
            )
            if result.isError() or len(result.registers) < 10:
                continue
            # Unpack two Latin-1 chars per register, stop at first null byte
            raw_chars: list[str] = []
            for reg_val in result.registers:
                hi = (reg_val >> 8) & 0xFF
                lo = reg_val & 0xFF
                raw_chars.append(chr(hi) if hi else "\x00")
                raw_chars.append(chr(lo) if lo else "\x00")
            name = "".join(raw_chars).split("\x00")[0].strip()
            if name:
                names[str(nbe_idx)] = name
        except Exception:
            continue
    return names


class ProxonOptionsFlow(OptionsFlow):
    """Handle options for Proxon FWT."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        current = self.config_entry.options.get(CONF_FILTER_NOTIFICATION, True)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Optional(CONF_FILTER_NOTIFICATION, default=current): bool}
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

            # Test connection
            try:
                client = AsyncModbusTcpClient(host, port=port, framer=FramerType.RTU)
                await client.connect()
                result = await client.read_input_registers(23, count=1, device_id=slave)
                if result.isError():
                    client.close()
                    errors["base"] = "cannot_connect"
                else:
                    room_names = await _read_nbe_names(client, slave)
                    client.close()
                    await self.async_set_unique_id(f"proxon_{host}_{port}_{slave}")
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(
                        title=f"Proxon FWT ({host})",
                        data={**user_input, CONF_SLAVE: slave, CONF_ROOM_NAMES: room_names},
                        options={CONF_FILTER_NOTIFICATION: user_input.get(CONF_FILTER_NOTIFICATION, True)},
                    )
            except (ModbusException, OSError):
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected error during setup")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_SCHEMA,
            errors=errors,
        )
