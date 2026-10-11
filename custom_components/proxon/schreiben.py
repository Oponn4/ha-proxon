"""Schreiben mit Wiederholung, wenn die Anlage noch beschäftigt ist.

Warum es das gibt: die T300-Register (2000 ff.) beantwortet die FWT als Slave 41
stellvertretend. Kommt ein zweiter Schreibbefehl, während sie den ersten noch an
die T300 weiterreicht, lehnt sie ihn mit Modbus-Exception 0x03 (Illegal Data
Value) ab — auch wenn der Wert gültig ist und sogar schon im Register steht.

Gemessen am 2026-10-08: Wattson schreibt Sollwert (2000) und Heizstab-Freigabe
(2001) im selben Tick, die Integration serialisiert sie mit 0,15 s Abstand. Von
sechs solchen Paaren seit dem 05.09. scheiterten drei, von rund 50 einzelnen
Writes keiner. Zehn Paare mit unveränderten Werten (52 °C / aus): sieben
Ablehnungen, immer beim jeweils zweiten Write, mal 2000, mal 2001.

Ein Write auf ein Holding-Register ist idempotent, die Wiederholung also
gefahrlos. Ein wirklich ungültiger Wert scheitert nach den Wartezeiten genauso
wie vorher, nur später.

Bewusst frei von Home-Assistant- und Modbus-Importen: die Ausnahmeklasse kommt
als Parameter, so ist die Logik ohne HA-Installation testbar.
"""
from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable, Sequence

_LOGGER = logging.getLogger(__name__)

# Wartezeiten vor der 1., 2. und 3. Wiederholung (zusammen 3,5 s).
WARTEZEITEN: tuple[float, ...] = (0.5, 1.0, 2.0)


async def schreiben_mit_wiederholung(
    schreiben: Callable[[int, int], Awaitable[None]],
    address: int,
    value: int,
    *,
    wiederholen_bei: type[BaseException] | tuple[type[BaseException], ...],
    wartezeiten: Sequence[float] = WARTEZEITEN,
    schlafen: Callable[[float], Awaitable[None]] = asyncio.sleep,
) -> int:
    """`schreiben(address, value)` ausführen, bei `wiederholen_bei` erneut.

    Gibt die Zahl der nötigen Wiederholungen zurück (0 = auf Anhieb).
    Andere Fehler und der letzte Fehlschlag gehen unverändert an den Aufrufer.
    """
    for versuch, pause in enumerate([*wartezeiten, None]):
        try:
            await schreiben(address, value)
        except wiederholen_bei as err:
            if pause is None:
                raise
            _LOGGER.debug(
                "Register %d abgelehnt (%s), neuer Versuch in %.1f s",
                address, err, pause,
            )
            await schlafen(pause)
            continue
        if versuch:
            _LOGGER.info(
                "Register %d nach %d Wiederholung(en) übernommen", address, versuch
            )
        return versuch
    raise AssertionError("unerreichbar")  # pragma: no cover
