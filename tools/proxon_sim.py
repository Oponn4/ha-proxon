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

Beispiel:
    python tools/proxon_sim.py --dump proxon_dump.json --latency 0.15 \
        --lazy 62:8 --reject 2001
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


class ProxonDataBlock(ModbusSequentialDataBlock):
    """Datablock mit Latenz, verzögerter Übernahme und Ablehnung."""

    def __init__(
        self,
        values: list[int],
        latency: float = 0.0,
        lazy: dict[int, float] | None = None,
        reject: set[int] | None = None,
        label: str = "",
    ) -> None:
        super().__init__(BLOCK_START, values)
        self._latency = latency
        self._lazy = lazy or {}
        self._reject = reject or set()
        self._label = label
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
    )
    inputs = ProxonDataBlock(
        _values_from_dump(dump["registers"]["input"], 950),
        latency=args.latency,
        label="input",
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
    await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
