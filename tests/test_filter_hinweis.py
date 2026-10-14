"""Filterwechsel: Vorwarnung 7 Tage vorher (v0.6.5, siehe filter_hinweis.py)."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from conftest import filter_hinweis

zustand = filter_hinweis.filter_zustand
text = filter_hinweis.vorwarnung_text


class TestZustand:
    def test_weit_weg(self):
        assert zustand(faellig=False, rest_tage=89.6) == "ok"

    def test_genau_sieben_tage_vorher(self):
        assert zustand(faellig=False, rest_tage=7.0) == "bald"

    def test_kurz_davor(self):
        assert zustand(faellig=False, rest_tage=0.4) == "bald"

    def test_acht_tage_noch_ruhig(self):
        assert zustand(faellig=False, rest_tage=8.0) == "ok"

    def test_bit_der_anlage_schlaegt_resttage(self):
        """Die Anlage meldet fällig, auch wenn die Rechnung noch Tage sähe."""
        assert zustand(faellig=True, rest_tage=12.0) == "faellig"
        assert zustand(faellig=True, rest_tage=None) == "faellig"

    def test_lesefehler_laesst_alles_wie_es_ist(self):
        assert zustand(faellig=None, rest_tage=None) is None

    def test_vorwarnung_auch_wenn_das_bit_gerade_fehlt(self):
        assert zustand(faellig=None, rest_tage=3.0) == "bald"


class TestText:
    def test_tage_und_datum(self):
        t = text(6.6, date(2026, 10, 14))
        assert "in 7 Tagen fällig" in t and "21.10.2026" in t

    def test_ein_tag(self):
        assert "in 1 Tag fällig" in text(1.2, date(2026, 10, 14))

    def test_heute(self):
        assert "heute fällig" in text(0.2, date(2026, 10, 14))


def test_integration_nutzt_den_zustand():
    quelle = (
        Path(__file__).resolve().parents[1] / "custom_components" / "proxon" / "__init__.py"
    ).read_text(encoding="utf-8")
    hinweis = quelle.split("def _setup_filter_notification")[1]
    assert "filter_zustand(" in hinweis
    assert 'zustand == "bald"' in hinweis
    assert 'zustand == "ok" or not notify_enabled' in hinweis
