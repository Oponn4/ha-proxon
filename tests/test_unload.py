"""Wächter auf den Unload-Pfad.

Am 20.09.2026 scheiterte der erste Reload der Integration mit
`AttributeError: 'ProxonCoordinator' object has no attribute '_close_client'`.
Der Aufruf stammte aus der Zeit vor dem Umstieg auf `modbus-connection`
(v0.6.0); seitdem gehört die Verbindung der `modbus`-Integration und es gibt
nichts zu schließen. Folge: Config-Entry in `failed_unload`, alle
Proxon-Entities `unavailable`, Erholung nur per HA-Neustart.

`__init__.py` importiert Home Assistant und ist in dieser Suite nicht ladbar
(siehe conftest.py) — geprüft wird deshalb der Quelltext. Grob, aber genau an
der Stelle, die nur beim Unload erreicht wird und darum jahrelang unbemerkt
falsch sein konnte.
"""
from __future__ import annotations

from pathlib import Path

QUELLE = (
    Path(__file__).resolve().parents[1]
    / "custom_components" / "proxon" / "__init__.py"
).read_text(encoding="utf-8")

UNLOAD = QUELLE.split("async def async_unload_entry")[1]


def test_kein_close_client_aufruf_mehr():
    """Geprüft wird die Aufrufzeile, nicht das Wort: im Docstring daneben steht
    `_close_client` weiterhin — als Erklärung, warum es dort nicht hingehört."""
    zeilen = [z.strip() for z in QUELLE.splitlines()]
    assert "coordinator._close_client()" not in zeilen


def test_unload_raeumt_hass_data_auf():
    """Ohne das bliebe der Coordinator nach dem Unload in hass.data stehen."""
    assert "hass.data[DOMAIN].pop(entry.entry_id" in UNLOAD


def test_pop_mit_default():
    """Nach einem halb gescheiterten Unload ist der Eintrag weg — ein KeyError
    würde denselben kaputten Zustand erneut herstellen."""
    assert "pop(entry.entry_id, None)" in UNLOAD


def test_unload_gibt_das_ergebnis_der_plattformen_zurueck():
    assert "return unload_ok" in UNLOAD
