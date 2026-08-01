"""Optimistische Zwischenwerte für geschriebene Register.

Warum es das gibt: alle Entities lesen ihren Zustand aus `coordinator.data`,
und das wird ausschließlich vom Poll gefüllt. Zwischen Tap und sichtbarer
Änderung lagen deshalb Sekunden — der Modbus-Write (neue TCP-Verbindung, ggf.
Unlock) plus ein kompletter Poll über 15 Blöcke mit Zwangspausen. Das Frontend
zeigt den Toggle so lange in der alten Stellung: „Tap tut nichts, springt
irgendwann um".

Der Cache hält den geschriebenen Wert fest, bis entweder der Poll ihn bestätigt
oder das Zeitfenster abläuft. Ohne das Zeitfenster würde ein vom Gerät
verworfener Write dauerhaft eine Lüge anzeigen; ohne den Cache würde ein Poll,
der kurz nach dem Write noch den alten Registerinhalt liest, die Anzeige wieder
zurückspringen lassen.

Bewusst frei von Home-Assistant- und pymodbus-Importen: so ist die Logik ohne
HA-Installation testbar.
"""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any


@dataclass
class _Pending:
    value: Any
    expires_at: float


class OptimisticCache:
    """Geschriebene Werte, die der Poll noch nicht bestätigt hat.

    `clock` liefert eine monotone Zeit in Sekunden (Default: time.monotonic).
    """

    def __init__(self, hold_seconds: float, clock: Callable[[], float] | None = None) -> None:
        if clock is None:
            from time import monotonic

            clock = monotonic
        self._hold = hold_seconds
        self._clock = clock
        self._pending: dict[str, _Pending] = {}

    def __len__(self) -> int:
        return len(self._pending)

    def __contains__(self, key: str) -> bool:
        return key in self._pending

    def set(self, values: dict[str, Any]) -> None:
        """Geschriebene Werte vormerken."""
        deadline = self._clock() + self._hold
        for key, value in values.items():
            self._pending[key] = _Pending(value=value, expires_at=deadline)

    def drop(self, keys: list[str] | dict[str, Any]) -> None:
        """Vormerkung verwerfen — z.B. wenn der Write fehlgeschlagen ist."""
        for key in keys:
            self._pending.pop(key, None)

    def apply(self, data: dict[str, Any]) -> dict[str, Any]:
        """Poll-Ergebnis überschreiben, solange die Vormerkung gilt.

        Räumt dabei auf: bestätigte Werte (Poll == vorgemerkt) und abgelaufene
        Fenster fliegen raus. Ein Wert, den das Gerät nie übernimmt, verschwindet
        damit nach `hold_seconds` von selbst und die Anzeige sagt wieder die
        Wahrheit.
        """
        if not self._pending:
            return data
        now = self._clock()
        for key, pending in list(self._pending.items()):
            if now >= pending.expires_at:
                del self._pending[key]
                continue
            if key in data and data[key] == pending.value:
                del self._pending[key]
                continue
            data[key] = pending.value
        return data
