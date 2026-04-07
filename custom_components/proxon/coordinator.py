"""DataUpdateCoordinator for Proxon FWT."""
from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from typing import Any

from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException, ModbusIOException
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

# Suppress spurious pymodbus noise caused by the USR RS485-LAN adapter forwarding
# all internal RS485 bus traffic to our TCP connection.  These frames arrive without
# a matching pending request and pymodbus logs them at ERROR/WARNING level even
# though they are harmless – our stale-frame mitigations already handle them.
class _SuppressModbusNoise(logging.Filter):
    _NOISE = (
        "received pdu without a corresponding",
        "receive_data_chunk",
        # Repeated-warning suppression message from pymodbus
        "Repeating....",
        # Wrong slave-ID responses from other devices on the RS485 bus
        "request ask for id=",
        "request ask for transaction_id=",
        # RTU frame decode failure (bus noise byte e.g. 0x80 = exception flag)
        "Unable to decode frame",
    )

    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        if any(noise in msg for noise in self._NOISE):
            record.levelno = logging.DEBUG
            record.levelname = "DEBUG"
        return True


# Apply to both pymodbus and its child loggers (filters don't propagate downward).
for _modbus_logger in ("pymodbus", "pymodbus.logging", "pymodbus.client"):
    logging.getLogger(_modbus_logger).addFilter(_SuppressModbusNoise())

# Pymodbus 3.x raises ModbusIOException inside datagram_received() when it cannot
# decode an RTU frame (e.g. a raw 0x80 exception byte from another bus device).
# That exception propagates to asyncio which logs it as a fatal "protocol.data_received()
# call failed" error – even though it is harmless RS485 bus noise.
# Patching datagram_received to absorb these exceptions prevents the false alarm.
from pymodbus.transport import transport as _pymodbus_transport  # noqa: E402

_orig_datagram_received = _pymodbus_transport.ModbusProtocol.datagram_received


def _safe_datagram_received(self, data: bytes, addr: tuple | None) -> None:  # type: ignore[override]
    try:
        _orig_datagram_received(self, data, addr)
    except ModbusIOException as exc:
        _LOGGER.debug("RTU frame decode error (RS485 bus noise, ignored): %s", exc)


_pymodbus_transport.ModbusProtocol.datagram_received = _safe_datagram_received

# Bulk read blocks: (start_address, count, fc)
# Only ranges the Proxon device+adapter actually responds to.
# Large blocks with register gaps cause Modbus errors on this USR RS485-LAN adapter.
_READ_BLOCKS: list[tuple[int, int, str]] = [
    (0,    52, REG_INPUT),   # FWT input:    0–51
    (154, 112, REG_INPUT),   # FWT input:  154–265
    (590,  21, REG_INPUT),   # NBE input:  590–610  (7 physical devices × 3 regs)
    (811,  90, REG_INPUT),   # T300 input: 811–900
    (16,    7, "holding"),   # FWT holding:  16–22  (sollbetriebsart, luefterstufe)
    (41,  103, "holding"),   # FWT holding:  41–143
    (187,   1, "holding"),   # FWT holding: 187     (hbde_ptc_freigabe)
    (213,   7, "holding"),   # FWT holding: 213–219 (NBE offsets,        7 physical devices)
    (233,   7, "holding"),   # FWT holding: 233–239 (Mitteltemperaturen, 7 physical devices)
    (253,   7, "holding"),   # FWT holding: 253–259 (PTC Freigabe,       7 physical devices)
    (460,   1, "holding"),   # FWT holding: 460     (geraetefilter standzeit, requires unlock)
    (467,   3, "holding"),   # FWT holding: 467–469 (stundenzähler FWT/umluft/geraetefilter)
    (613,   7, "holding"),   # FWT holding: 613–619 (zeitprogramm_luft, nacht_temperatur, nachtabsenkung)
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
                _LOGGER.debug(
                    "Block read short: fc=%s start=%d expected=%d got=%d – retrying",
                    fc, start, count, len(result.registers),
                )
                # Short reads are typically stale RS485 frames from other bus devices.
                # Wait briefly to flush stale data, then retry once.
                await asyncio.sleep(0.3)
                if fc == REG_INPUT:
                    result = await client.read_input_registers(start, count=count, device_id=self.slave)
                else:
                    result = await client.read_holding_registers(start, count=count, device_id=self.slave)
                if result.isError() or len(result.registers) != count:
                    _LOGGER.warning(
                        "Block read short after retry: fc=%s start=%d expected=%d got=%d",
                        fc, start, count, 0 if result.isError() else len(result.registers),
                    )
                    return {start + i: result.registers[i] for i in range(len(result.registers))} if not result.isError() else {}
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

        # Derived: remaining filter days from Stunden Gerätefilter (469) + Standzeit Monate (460).
        # Accurate after reg 469 is reset to 0 on filter change (button.geraetefilter_reset).
        standzeit_monate = data.get("geraetefilter_standzeit_monate")
        laufzeit_h = data.get("geraetefilter_stunden")
        if standzeit_monate is not None and laufzeit_h is not None:
            remaining = ((standzeit_monate * 30 * 24) - laufzeit_h) / 24
            data["geraetefilter_remaining_days"] = round(max(0.0, remaining), 1)
        else:
            data["geraetefilter_remaining_days"] = None

        # Dynamic NBE room data for all 7 possible physical devices (0–6).
        # Keys: nbe_temp_N, nbe_offset_N, nbe_mittel_N
        # Populated regardless of which rooms are actually configured so that
        # climate/sensor/number platforms can simply look up by physical_idx.
        for n in range(7):
            raw_temp = raw.get((REG_INPUT, 590 + n * 3))
            raw_offset = raw.get(("holding", 213 + n))
            raw_mittel = raw.get(("holding", 233 + n))

            if raw_temp is not None and 100 <= raw_temp <= 400:
                data[f"nbe_temp_{n}"] = round(raw_temp / 10, 1)
            else:
                data[f"nbe_temp_{n}"] = None

            if raw_offset is not None:
                v = _to_signed16(raw_offset)
                data[f"nbe_offset_{n}"] = v if -10 <= v <= 10 else None
            else:
                data[f"nbe_offset_{n}"] = None

            if raw_mittel is not None:
                v = _to_signed16(raw_mittel)
                data[f"nbe_mittel_{n}"] = v if 10 <= v <= 35 else None
            else:
                data[f"nbe_mittel_{n}"] = None

            raw_ptc = raw.get(("holding", 253 + n))
            data[f"nbe_ptc_{n}"] = int(raw_ptc) if raw_ptc is not None else None

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
            # Unlock write access if not yet done (e.g. first write before first poll).
            if not self._write_access_unlocked:
                try:
                    unlock = await self._client.write_register(438, 55555, device_id=self.slave)
                    if not unlock.isError():
                        self._write_access_unlocked = True
                except Exception:
                    pass  # Best-effort; the actual write below will fail if device rejects it
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
