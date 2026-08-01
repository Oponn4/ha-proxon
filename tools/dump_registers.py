#!/usr/bin/env python3
"""Registerabzug der echten Proxon-Anlage — ausschließlich lesend.

Liest exakt die Blöcke, die der Coordinator auch liest, und schreibt sie als
JSON raus. Das Ergebnis füttert den Simulator (`tools/proxon_sim.py`), damit
Integration und UI ohne die echte Anlage getestet werden können.

**Es wird nichts geschrieben.** Der Coordinator schickt beim Start einen
Unlock-Write auf Register 438 (55555), um die Servicebereiche 460 und 467–469
lesen zu dürfen. Dieses Skript verzichtet darauf: die Blöcke schlagen dann
möglicherweise fehl und landen als `null` im Dump. Der Simulator bekommt für
sie Ersatzwerte — das ist der Preis dafür, die Anlage nicht anzufassen.

Aufruf:
    python tools/dump_registers.py --host 10.42.20.2 --out proxon_dump.json
"""
from __future__ import annotations

import argparse
import asyncio
import json
from datetime import datetime

from pymodbus.client import AsyncModbusTcpClient
from pymodbus.framer import FramerType

# Identisch zu _FWT_READ_BLOCKS / _T300_READ_BLOCKS im Coordinator.
# Bewusst dupliziert: das Skript soll ohne HA-Kontext laufen.
READ_BLOCKS: list[tuple[int, int, str]] = [
    (0,    52, "input"),
    (154, 112, "input"),
    (590,  21, "input"),
    (16,    7, "holding"),
    (41,  103, "holding"),
    (187,   1, "holding"),
    (213,   7, "holding"),
    (233,   7, "holding"),
    (253,   7, "holding"),
    (460,   1, "holding"),   # braucht Unlock → hier erwartbar leer
    (467,   3, "holding"),   # braucht Unlock → hier erwartbar leer
    (613,   7, "holding"),
    (811,  90, "input"),     # T300
    (2000, 26, "holding"),   # T300
    (620, 100, "holding"),   # Raumnamen (10 Register je Raum)
]

INTER_BLOCK_DELAY = 0.15   # wie im Coordinator: Bus beruhigen
POST_CONNECT_DRAIN = 0.30  # Bridge flusht ihren Sendepuffer beim Connect


async def read_block(
    client: AsyncModbusTcpClient, start: int, count: int, fc: str, slave: int,
) -> list[int] | None:
    try:
        if fc == "input":
            result = await client.read_input_registers(start, count=count, device_id=slave)
        else:
            result = await client.read_holding_registers(start, count=count, device_id=slave)
    except Exception as err:  # noqa: BLE001 - Diagnose-Skript, jeder Fehler ist interessant
        print(f"  {fc}@{start}+{count}: Ausnahme {err}")
        return None
    if result.isError():
        print(f"  {fc}@{start}+{count}: Fehler {result}")
        return None
    return list(result.registers)


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="10.42.20.2")
    parser.add_argument("--port", type=int, default=502)
    parser.add_argument("--slave", type=int, default=41)
    parser.add_argument("--out", default="proxon_dump.json")
    args = parser.parse_args()

    client = AsyncModbusTcpClient(
        args.host, port=args.port, framer=FramerType.RTU, timeout=5,
    )
    await client.connect()
    if not client.connected:
        raise SystemExit(f"Keine Verbindung zu {args.host}:{args.port}")
    await asyncio.sleep(POST_CONNECT_DRAIN)

    print(f"Lese {len(READ_BLOCKS)} Blöcke von {args.host}:{args.port} (slave {args.slave}) …")
    registers: dict[str, dict[str, int]] = {"input": {}, "holding": {}}
    failed: list[str] = []

    for i, (start, count, fc) in enumerate(READ_BLOCKS):
        if i > 0:
            await asyncio.sleep(INTER_BLOCK_DELAY)
        values = await read_block(client, start, count, fc, args.slave)
        if values is None:
            failed.append(f"{fc}@{start}+{count}")
            continue
        for offset, value in enumerate(values):
            registers[fc][str(start + offset)] = value

    client.close()

    dump = {
        "source": f"{args.host}:{args.port}",
        "slave": args.slave,
        "created": datetime.now().isoformat(timespec="seconds"),
        "failed_blocks": failed,
        "registers": registers,
    }
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(dump, fh, indent=2, sort_keys=True)

    print(
        f"→ {args.out}: {len(registers['input'])} Input-, "
        f"{len(registers['holding'])} Holding-Register"
        + (f", fehlgeschlagen: {', '.join(failed)}" if failed else "")
    )


if __name__ == "__main__":
    asyncio.run(main())
