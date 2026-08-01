"""Tests für den optimistischen Schreib-Cache.

Hintergrund: alle Entities lesen aus `coordinator.data`, und das füllt nur der
Poll. Ein Tap auf `switch.proxon_fwt_kuhlung` musste deshalb erst den
Modbus-Write (neue TCP-Verbindung, ggf. Unlock — bis ~1,5 s) und dann einen
kompletten Poll über 15 Blöcke mit Zwangspausen (~3 s, gemessen an den 63-s-
Abständen des Abluft-Sensors bei 60 s Intervall) abwarten, bevor sich im
Frontend etwas bewegte.

Der Cache zeigt den geschriebenen Wert sofort und hält ihn, bis der Poll ihn
bestätigt oder das Fenster abläuft. Die beiden Fallen dabei:
  - ein Poll, der VOR dem Write gestartet ist, liefert den alten Registerinhalt
    → darf die Anzeige nicht zurückspringen lassen
  - ein Wert, den das Gerät gar nicht übernimmt, darf nicht dauerhaft eine Lüge
    anzeigen → Zeitfenster
"""
from __future__ import annotations

import pytest
from conftest import optimistic as optimistic_mod

OptimisticCache = optimistic_mod.OptimisticCache

HOLD = 150.0  # 2 × 60 s Poll + 30 s Slack, wie im Coordinator


class Clock:
    def __init__(self) -> None:
        self.t = 1000.0

    def __call__(self) -> float:
        return self.t

    def advance(self, seconds: float) -> float:
        self.t += seconds
        return self.t


@pytest.fixture
def clock():
    return Clock()


@pytest.fixture
def cache(clock):
    return OptimisticCache(hold_seconds=HOLD, clock=clock)


def test_pending_value_wins_over_stale_poll(cache):
    """Kernfall: Poll war schon unterwegs und liefert noch die alte Stellung."""
    cache.set({"kuehlung_freigabe": 1})

    data = cache.apply({"kuehlung_freigabe": 0, "t07_abluft": 26.4})

    assert data["kuehlung_freigabe"] == 1
    assert data["t07_abluft"] == 26.4


def test_confirming_poll_clears_pending(cache, clock):
    cache.set({"kuehlung_freigabe": 1})
    clock.advance(5)

    assert cache.apply({"kuehlung_freigabe": 1})["kuehlung_freigabe"] == 1
    assert "kuehlung_freigabe" not in cache

    # Ab jetzt gewinnt wieder das Gerät — auch wenn es von selbst abschaltet
    assert cache.apply({"kuehlung_freigabe": 0})["kuehlung_freigabe"] == 0


def test_pending_expires_when_device_never_takes_it(cache, clock):
    """Vom Gerät verworfener Write darf nicht dauerhaft eine Lüge anzeigen."""
    cache.set({"kuehlung_freigabe": 1})

    clock.advance(HOLD - 1)
    assert cache.apply({"kuehlung_freigabe": 0})["kuehlung_freigabe"] == 1

    clock.advance(2)
    assert cache.apply({"kuehlung_freigabe": 0})["kuehlung_freigabe"] == 0
    assert len(cache) == 0


def test_drop_removes_pending_immediately(cache):
    """Fehlgeschlagener Write: Vormerkung sofort zurücknehmen."""
    cache.set({"kuehlung_freigabe": 1})
    cache.drop({"kuehlung_freigabe": 1})

    assert cache.apply({"kuehlung_freigabe": 0})["kuehlung_freigabe"] == 0


def test_second_write_extends_window(cache, clock):
    cache.set({"luefterstufe": 2})
    clock.advance(HOLD - 10)
    cache.set({"luefterstufe": 3})
    clock.advance(20)  # nach dem ersten Fenster, im zweiten

    assert cache.apply({"luefterstufe": 1})["luefterstufe"] == 3


def test_keys_are_independent(cache, clock):
    cache.set({"luefterstufe": 3})
    clock.advance(10)
    cache.set({"sollbetriebsart": 0})

    data = cache.apply({"luefterstufe": 3, "sollbetriebsart": 3})

    assert data["luefterstufe"] == 3        # bestätigt → aufgeräumt
    assert data["sollbetriebsart"] == 0     # noch offen → hält
    assert "luefterstufe" not in cache
    assert "sollbetriebsart" in cache


def test_missing_key_in_poll_still_shows_pending(cache):
    """Block-Read gescheitert, Key fehlt im Poll → Vormerkung bleibt sichtbar."""
    cache.set({"t300_eheiz_freigabe": 1})

    assert cache.apply({})["t300_eheiz_freigabe"] == 1


def test_float_setpoint_roundtrip(cache):
    cache.set({"soll_temp_zone1": 21.5})

    assert cache.apply({"soll_temp_zone1": 21.0})["soll_temp_zone1"] == 21.5
    assert cache.apply({"soll_temp_zone1": 21.5})["soll_temp_zone1"] == 21.5
    assert len(cache) == 0


def test_empty_cache_returns_poll_untouched(cache):
    data = {"t07_abluft": 26.4}

    assert cache.apply(data) is data


def test_none_from_poll_does_not_confirm(cache, clock):
    """Stale-Frame-Guard liefert None — das ist keine Bestätigung."""
    cache.set({"kuehlung_freigabe": 1})
    clock.advance(5)

    assert cache.apply({"kuehlung_freigabe": None})["kuehlung_freigabe"] == 1
    assert "kuehlung_freigabe" in cache
