"""DataUpdateCoordinator for Proxon FWT."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    FWT_INPUT_REGISTERS,
    FWT_HOLDING_REGISTERS,
    T300_INPUT_REGISTERS,
    T300_HOLDING_REGISTERS,
    ModbusRegister,
    REG_INPUT,
)

_LOGGER = logging.getLogger(__name__)


def _to_signed16(value: int) -> int:
    """Convert unsigned 16-bit int to signed."""
    if value >= 0x8000:
        value -= 0x10000
    return value


def _decode(reg: ModbusRegister, raw: int) -> float | int:
    """Apply sign conversion, offset and scaling."""
    if reg.data_type == "int16":
        raw = _to_signed16(raw)
    val = raw + reg.offset
    if reg.scale == 1:
        return val
    return round(val / reg.scale, 2)


class ProxonCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls all Proxon registers and stores decoded values."""

    def __init__(
        self,
        hass: HomeAssistant,
        host: str,
        port: int,
        slave: int,
        scan_interval: int,
    ) -> None:
        self.host = host
        self.port = port
        self.slave = slave
        self._client: AsyncModbusTcpClient | None = None

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan_interval),
        )

    async def _get_client(self) -> AsyncModbusTcpClient:
        if self._client is None or not self._client.connected:
            self._client = AsyncModbusTcpClient(self.host, port=self.port)
            await self._client.connect()
        return self._client

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            client = await self._get_client()
            data: dict[str, Any] = {}

            # Read input registers
            for key, reg in FWT_INPUT_REGISTERS.items():
                result = await client.read_input_registers(
                    reg.address, count=1, slave=self.slave
                )
                if result.isError():
                    _LOGGER.warning("Error reading input register %s (addr %d)", key, reg.address)
                    data[key] = None
                else:
                    data[key] = _decode(reg, result.registers[0])

            # Read holding registers (FWT)
            for key, reg in FWT_HOLDING_REGISTERS.items():
                result = await client.read_holding_registers(
                    reg.address, count=1, slave=self.slave
                )
                if result.isError():
                    _LOGGER.warning("Error reading holding register %s (addr %d)", key, reg.address)
                    data[key] = None
                else:
                    data[key] = _decode(reg, result.registers[0])

            # Read T300 input registers
            for key, reg in T300_INPUT_REGISTERS.items():
                result = await client.read_input_registers(
                    reg.address, count=1, slave=self.slave
                )
                if result.isError():
                    _LOGGER.warning("Error reading T300 input register %s (addr %d)", key, reg.address)
                    data[key] = None
                else:
                    data[key] = _decode(reg, result.registers[0])

            # Read T300 holding registers
            for key, reg in T300_HOLDING_REGISTERS.items():
                result = await client.read_holding_registers(
                    reg.address, count=1, slave=self.slave
                )
                if result.isError():
                    _LOGGER.warning("Error reading T300 holding register %s (addr %d)", key, reg.address)
                    data[key] = None
                else:
                    data[key] = _decode(reg, result.registers[0])

            return data

        except ModbusException as err:
            raise UpdateFailed(f"Modbus error: {err}") from err
        except Exception as err:
            # Close client on unexpected errors so next update reconnects
            if self._client:
                self._client.close()
                self._client = None
            raise UpdateFailed(f"Error communicating with Proxon: {err}") from err

    async def write_register(self, address: int, value: int) -> bool:
        """Write a single holding register. Returns True on success."""
        try:
            client = await self._get_client()
            result = await client.write_register(address, value, slave=self.slave)
            if result.isError():
                _LOGGER.error("Write error at address %d: %s", address, result)
                return False
            return True
        except ModbusException as err:
            _LOGGER.error("Modbus write exception at address %d: %s", address, err)
            return False
