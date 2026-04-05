"""DataUpdateCoordinator for Proxon FWT."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException
from pymodbus.framer import FramerType

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

# Bulk read blocks: (start_address, count, fc)
# Groups consecutive register ranges into single requests (max 125 per request).
# Derived from the register addresses in const.py.
# NOTE: Only include ranges that the Proxon device/adapter actually responds to.
# Large blocks with gaps cause Modbus errors on this RS485-LAN adapter.
_READ_BLOCKS: list[tuple[int, int, str]] = [
    (0,    52, REG_INPUT),   # FWT input:    0–51
    (154, 112, REG_INPUT),   # FWT input:  154–265
    (590,  13, REG_INPUT),   # NBE input:  590–602
    (811,  90, REG_INPUT),   # T300 input: 811–900
    (16,    7, "holding"),   # FWT holding:  16–22  (sollbetriebsart, luefterstufe)
    (41,  103, "holding"),   # FWT holding:  41–143
    (187,   1, "holding"),   # FWT holding: 187     (hbde_ptc_freigabe)
    (213,   5, "holding"),   # FWT holding: 213–217 (NBE offsets)
    (2000, 26, "holding"),   # T300 holding: 2000–2025
]


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
            self._client = AsyncModbusTcpClient(self.host, port=self.port, framer=FramerType.RTU)
            await self._client.connect()
        return self._client

    async def _read_block(
        self,
        client: AsyncModbusTcpClient,
        start: int,
        count: int,
        fc: str,
    ) -> dict[int, int]:
        """Read a contiguous block of registers. Returns {address: raw_value}."""
        try:
            if fc == REG_INPUT:
                result = await client.read_input_registers(
                    start, count=count, device_id=self.slave
                )
            else:
                result = await client.read_holding_registers(
                    start, count=count, device_id=self.slave
                )
            if result.isError():
                _LOGGER.warning("Block read error: fc=%s start=%d count=%d", fc, start, count)
                return {}
            return {start + i: result.registers[i] for i in range(len(result.registers))}
        except Exception:
            _LOGGER.warning("Block read exception: fc=%s start=%d count=%d", fc, start, count)
            return {}

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            client = await self._get_client()
        except Exception as err:
            raise UpdateFailed(f"Cannot connect to Proxon: {err}") from err

        # Read all blocks; collect raw values keyed by (fc, address)
        raw: dict[tuple[str, int], int] = {}
        had_error = False

        for start, count, fc in _READ_BLOCKS:
            block = await self._read_block(client, start, count, fc)
            if not block:
                had_error = True
            for addr, val in block.items():
                raw[(fc, addr)] = val

        # Decode into data dict
        data: dict[str, Any] = {}
        for reg_dict, fc in [
            (FWT_INPUT_REGISTERS,  REG_INPUT),
            (FWT_HOLDING_REGISTERS, "holding"),
            (T300_INPUT_REGISTERS,  REG_INPUT),
            (T300_HOLDING_REGISTERS, "holding"),
        ]:
            for key, reg in reg_dict.items():
                raw_val = raw.get((fc, reg.address))
                data[key] = _decode(reg, raw_val) if raw_val is not None else None

        # Reconnect next cycle if any block failed (clears TCP stream state).
        # The RS485-LAN adapter forwards all bus traffic; a failed block indicates
        # stale RTU frames confused the framer – reconnecting restores sync.
        if had_error:
            try:
                client.close()
            except Exception:
                pass
            self._client = None

        return data

    async def write_register(self, address: int, value: int) -> bool:
        """Write a single holding register. Returns True on success."""
        try:
            client = await self._get_client()
            result = await client.write_register(address, value, device_id=self.slave)
            if result.isError():
                _LOGGER.error("Write error at address %d: %s", address, result)
                return False
            return True
        except ModbusException as err:
            _LOGGER.error("Modbus write exception at address %d: %s", address, err)
            return False
