"""DataUpdateCoordinator for Proxon FWT."""
from __future__ import annotations

import asyncio
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
# Only ranges the Proxon device+adapter actually responds to.
# Large blocks with register gaps cause Modbus errors on this USR RS485-LAN adapter.
_READ_BLOCKS: list[tuple[int, int, str]] = [
    (0,    52, REG_INPUT),   # FWT input:    0–51
    (154, 112, REG_INPUT),   # FWT input:  154–265
    (590,  13, REG_INPUT),   # NBE input:  590–602
    (811,  90, REG_INPUT),   # T300 input: 811–900
    (16,    7, "holding"),   # FWT holding:  16–22  (sollbetriebsart, luefterstufe)
    (41,  103, "holding"),   # FWT holding:  41–143
    (187,   1, "holding"),   # FWT holding: 187     (hbde_ptc_freigabe)
    (213,   5, "holding"),   # FWT holding: 213–217 (NBE offsets)
    (460,   1, "holding"),   # FWT holding: 460     (geraetefilter standzeit, requires unlock)
    (467,   3, "holding"),   # FWT holding: 467–469 (stundenzähler FWT/umluft/geraetefilter)
    (2000, 26, "holding"),   # T300 holding: 2000–2025
]

# The USR TCP-RS485 bridge forwards ALL RS485 bus traffic (including Proxon-internal
# device communication) to any connected TCP client.  Without inter-request pauses,
# stale RTU frames from internal bus activity can be misinterpreted as responses to
# our requests, producing garbage values (e.g. 128 °C hot water).
#
# Mitigations:
#   _INTER_BLOCK_DELAY  – pause between consecutive block reads; gives the asyncio
#                         event loop time to receive+discard any stale frames before
#                         the next request is issued.
#   _POST_CONNECT_DRAIN – pause right after opening a new TCP connection; the bridge
#                         flushes its TCP send-buffer on connect, so waiting here lets
#                         pymodbus drain+discard that initial burst of stale frames.
#   Always reconnect    – close the TCP connection after every update cycle.  A fresh
#                         connection starts with a clean framer state; a long-lived
#                         connection accumulates stale-frame debt that grows over time.
_INTER_BLOCK_DELAY = 0.15   # seconds between block reads
_POST_CONNECT_DRAIN = 0.30  # seconds to wait after connect before first read
_MODBUS_TIMEOUT = 5         # seconds per request (pymodbus default is 3)


def _to_signed16(value: int) -> int:
    """Convert unsigned 16-bit int to signed."""
    if value >= 0x8000:
        value -= 0x10000
    return value


def _decode(reg: ModbusRegister, raw: int) -> float | int | None:
    """Apply sign conversion, offset, scaling – and reject out-of-range raws."""
    if reg.data_type == "int16":
        raw = _to_signed16(raw)
    # Reject values outside the documented raw range (catches stale-frame garbage).
    if reg.min_raw is not None and raw < reg.min_raw:
        return None
    if reg.max_raw is not None and raw > reg.max_raw:
        return None
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
        # Written once per HA session to unlock service register access (addr 438 = 55555).
        # Avoids repeated flash writes on the device; re-unlocks automatically after HA restart.
        self._write_access_unlocked = False

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan_interval),
        )

    async def _open_client(self) -> AsyncModbusTcpClient:
        """Open a fresh Modbus TCP connection and drain any initial stale frames."""
        client = AsyncModbusTcpClient(
            self.host,
            port=self.port,
            framer=FramerType.RTU,
            timeout=_MODBUS_TIMEOUT,
        )
        await client.connect()
        # Allow the asyncio event loop to process (and discard) any RTU frames
        # that the bridge queued before/during our connect.
        await asyncio.sleep(_POST_CONNECT_DRAIN)
        return client

    def _close_client(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None

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
                _LOGGER.warning(
                    "Block read error: fc=%s start=%d count=%d → %s",
                    fc, start, count, result,
                )
                return {}
            if len(result.registers) != count:
                _LOGGER.warning(
                    "Block read short: fc=%s start=%d expected=%d got=%d",
                    fc, start, count, len(result.registers),
                )
                # Accept partial response rather than discarding everything
            return {start + i: result.registers[i] for i in range(len(result.registers))}
        except Exception as exc:
            _LOGGER.warning(
                "Block read exception: fc=%s start=%d count=%d: %s",
                fc, start, count, exc,
            )
            return {}

    async def _async_update_data(self) -> dict[str, Any]:
        # Always use a fresh connection per cycle.
        # This keeps the framer state clean and limits the window in which stale
        # RS485 frames can contaminate our reads.
        self._close_client()
        try:
            self._client = await self._open_client()
        except Exception as err:
            raise UpdateFailed(f"Cannot connect to Proxon at {self.host}:{self.port}: {err}") from err

        # Unlock service register access (addr 438 = 55555 = full Modbus write/read rights).
        # Required to read filter stundenzähler (addr 460, 467-469).
        # Written once per HA session to avoid repeated flash writes on the device.
        if not self._write_access_unlocked:
            try:
                result = await self._client.write_register(438, 55555, device_id=self.slave)
                if not result.isError():
                    self._write_access_unlocked = True
                    _LOGGER.debug("Modbus write access unlocked (reg 438 = 55555)")
                else:
                    _LOGGER.warning("Failed to unlock Modbus write access: %s", result)
            except Exception as exc:
                _LOGGER.warning("Exception unlocking Modbus write access: %s", exc)

        # Read all blocks with inter-request pauses.
        raw: dict[tuple[str, int], int] = {}
        errors: list[str] = []

        for i, (start, count, fc) in enumerate(_READ_BLOCKS):
            if i > 0:
                await asyncio.sleep(_INTER_BLOCK_DELAY)
            block = await self._read_block(self._client, start, count, fc)
            if not block:
                errors.append(f"{fc}@{start}+{count}")
            for addr, val in block.items():
                raw[(fc, addr)] = val

        if errors:
            _LOGGER.debug("Block read failures this cycle: %s", ", ".join(errors))

        # Decode raw values into the data dict.
        # _decode() returns None for out-of-range raws (stale-frame guard).
        data: dict[str, Any] = {}
        for reg_dict, fc in [
            (FWT_INPUT_REGISTERS,   REG_INPUT),
            (FWT_HOLDING_REGISTERS, "holding"),
            (T300_INPUT_REGISTERS,  REG_INPUT),
            (T300_HOLDING_REGISTERS, "holding"),
        ]:
            for key, reg in reg_dict.items():
                raw_val = raw.get((fc, reg.address))
                data[key] = _decode(reg, raw_val) if raw_val is not None else None

        # Derived: filter change due from ErrorStatus1 (input 48) bit 1
        error_status1 = raw.get((REG_INPUT, 48))
        if error_status1 is not None:
            data["filter_wechsel_faellig"] = bool(error_status1 & 0x0002)
        else:
            data["filter_wechsel_faellig"] = None

        # Connection is deliberately NOT kept open; it will be reopened next cycle.
        self._close_client()

        return data

    async def write_register(self, address: int, value: int) -> bool:
        """Write a single holding register. Returns True on success."""
        # Use the existing connection if available, otherwise open a temporary one.
        close_after = self._client is None
        try:
            if self._client is None:
                self._client = await self._open_client()
            result = await self._client.write_register(
                address, value, device_id=self.slave
            )
            if result.isError():
                _LOGGER.error("Write error at address %d: %s", address, result)
                return False
            return True
        except ModbusException as err:
            _LOGGER.error("Modbus write exception at address %d: %s", address, err)
            return False
        finally:
            if close_after:
                self._close_client()
