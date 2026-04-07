"""Config flow for Proxon FWT integration."""
from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

import voluptuous as vol
from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException
from pymodbus.framer import FramerType

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SCAN_INTERVAL  # noqa: F401 (re-exported via entry data)
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.selector import NumberSelector, NumberSelectorConfig, NumberSelectorMode

from .const import CONF_FILTER_NOTIFICATION, CONF_ROOMS, CONF_SLAVE, DOMAIN, DEFAULT_PORT, DEFAULT_SLAVE, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

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


async def _discover_rooms(
    client: AsyncModbusTcpClient, slave: int
) -> list[dict]:
    """Discover all configured room name slots on the device.

    The Proxon stores each name in 10 consecutive holding registers starting at
    620 + (name_idx * 10).  Each register holds two packed Latin-1 bytes.
    A 0x00 byte terminates the string.

    Name table layout:
      name_idx 0 → reg 620 → HBDE primary (e.g. "Wohnen/Essen"), no NBE sensor
      name_idx 1 → reg 630 → NBE physical device 0 (offset reg 213, temp reg 590)
      name_idx 2 → reg 640 → NBE physical device 1 (offset reg 214, temp reg 593)
      …
      name_idx N → reg 620+N*10 → NBE physical device N-1

    Returns a list of room dicts with keys:
      name_idx    – position in name table (0 = HBDE, 1-7 = NBE)
      physical_idx – NBE physical device index (name_idx - 1), None for HBDE
      name        – room name string
    Only slots with non-empty, non-default names are included.
    Default placeholder names like "Raum 5" or "Raum 7" are skipped.
    """
    _DEFAULT_NAME = re.compile(r'^Raum\s*\d+$', re.IGNORECASE)
    try:
        await client.write_register(438, 55555, device_id=slave)
        await asyncio.sleep(0.2)
    except Exception:
        return []

    rooms: list[dict] = []
    for name_idx in range(8):   # 8 slots: 1 HBDE + 7 NBE
        name_addr = 620 + name_idx * 10
        try:
            result = await client.read_holding_registers(name_addr, count=10, device_id=slave)
            if result.isError() or len(result.registers) < 10:
                continue
            raw_chars: list[str] = []
            for reg_val in result.registers:
                hi = (reg_val >> 8) & 0xFF
                lo = reg_val & 0xFF
                raw_chars.append(chr(hi) if hi else "\x00")
                raw_chars.append(chr(lo) if lo else "\x00")
            name = "".join(raw_chars).split("\x00")[0].strip()
            if not name or _DEFAULT_NAME.match(name):
                continue
            rooms.append({
                "name_idx": name_idx,
                "physical_idx": None if name_idx == 0 else name_idx - 1,
                "name": name,
            })
        except Exception:
            continue
    return rooms


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
                    vol.Optional(CONF_SCAN_INTERVAL, default=current_interval): vol.All(
                        int, vol.Range(min=10, max=300)
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

            # Test connection
            try:
                client = AsyncModbusTcpClient(host, port=port, framer=FramerType.RTU)
                await client.connect()
                result = await client.read_input_registers(23, count=1, device_id=slave)
                if result.isError():
                    client.close()
                    errors["base"] = "cannot_connect"
                else:
                    rooms = await _discover_rooms(client, slave)
                    client.close()
                    await self.async_set_unique_id(f"proxon_{host}_{port}_{slave}")
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(
                        title=f"Proxon FWT ({host})",
                        data={
                            CONF_HOST: host,
                            CONF_PORT: port,
                            CONF_SLAVE: slave,
                            CONF_ROOMS: rooms,
                        },
                        options={
                            CONF_FILTER_NOTIFICATION: user_input.get(CONF_FILTER_NOTIFICATION, True),
                            CONF_SCAN_INTERVAL: user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                        },
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
                client = AsyncModbusTcpClient(host, port=port, framer=FramerType.RTU)
                await client.connect()
                result = await client.read_input_registers(23, count=1, device_id=slave)
                if result.isError():
                    client.close()
                    errors["base"] = "cannot_connect"
                else:
                    rooms = await _discover_rooms(client, slave)
                    client.close()
                    return self.async_update_reload_and_abort(
                        entry,
                        data={
                            CONF_HOST: host,
                            CONF_PORT: port,
                            CONF_SLAVE: slave,
                            CONF_ROOMS: rooms,
                        },
                    )
            except (ModbusException, OSError):
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected error during reconfigure")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HOST, default=entry.data.get(CONF_HOST, "")): str,
                    vol.Optional(CONF_PORT, default=entry.data.get(CONF_PORT, DEFAULT_PORT)): cv.port,
                    vol.Optional(CONF_SLAVE, default=entry.data.get(CONF_SLAVE, DEFAULT_SLAVE)): NumberSelector(
                        NumberSelectorConfig(min=1, max=247, mode=NumberSelectorMode.BOX)
                    ),
                }
            ),
            errors=errors,
        )
