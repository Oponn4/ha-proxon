"""Wiederholung bei Exception 0x03 (siehe schreiben.py).

Am 2026-10-08 nachgestellt: zwei Writes im Abstand von 0,15 s, der zweite wird
von der FWT abgelehnt, solange sie den ersten an die T300 weiterreicht.
"""
from __future__ import annotations

import asyncio

import pytest
from conftest import schreiben

schreiben_mit_wiederholung = schreiben.schreiben_mit_wiederholung


class Abgelehnt(Exception):
    """Steht für modbus_connection.IllegalDataValueError."""


class Getrennt(Exception):
    """Steht für jeden anderen Modbus-Fehler."""


class Anlage:
    """Lehnt die ersten `ablehnungen` Writes ab, protokolliert den Rest."""

    def __init__(self, ablehnungen: int, fehler: type[Exception] = Abgelehnt) -> None:
        self.ablehnungen = ablehnungen
        self.fehler = fehler
        self.versuche = 0
        self.register: dict[int, int] = {}

    async def write_register(self, address: int, value: int) -> None:
        self.versuche += 1
        if self.versuche <= self.ablehnungen:
            raise self.fehler("0x03")
        self.register[address] = value


class Uhr:
    def __init__(self) -> None:
        self.pausen: list[float] = []

    async def schlafen(self, sekunden: float) -> None:
        self.pausen.append(sekunden)


def _lauf(anlage: Anlage, uhr: Uhr) -> int:
    return asyncio.run(schreiben_mit_wiederholung(
        anlage.write_register, 2001, 1,
        wiederholen_bei=Abgelehnt, schlafen=uhr.schlafen,
    ))


def test_auf_anhieb_ohne_pause():
    anlage, uhr = Anlage(0), Uhr()
    assert _lauf(anlage, uhr) == 0
    assert anlage.register == {2001: 1}
    assert uhr.pausen == []


def test_eine_ablehnung_wird_wiederholt():
    """Der Fall vom 08.10.: zweiter Write des Paares, einmal abgelehnt."""
    anlage, uhr = Anlage(1), Uhr()
    assert _lauf(anlage, uhr) == 1
    assert anlage.register == {2001: 1}
    assert uhr.pausen == [0.5]


def test_wartezeiten_steigen():
    anlage, uhr = Anlage(3), Uhr()
    assert _lauf(anlage, uhr) == 3
    assert uhr.pausen == [0.5, 1.0, 2.0]


def test_dauerhafte_ablehnung_geht_nach_oben():
    """Ein wirklich ungültiger Wert scheitert weiter — nur später."""
    anlage, uhr = Anlage(99), Uhr()
    with pytest.raises(Abgelehnt):
        _lauf(anlage, uhr)
    assert anlage.versuche == 4
    assert anlage.register == {}


def test_andere_fehler_ohne_wiederholung():
    """Verbindungsfehler gehören nicht hierher, die behandelt der Aufrufer."""
    anlage, uhr = Anlage(1, fehler=Getrennt), Uhr()
    with pytest.raises(Getrennt):
        _lauf(anlage, uhr)
    assert anlage.versuche == 1
    assert uhr.pausen == []


def test_coordinator_nutzt_die_wiederholung():
    """Quelltextprüfung wie in test_unload.py: der Coordinator importiert HA."""
    from pathlib import Path

    quelle = (
        Path(__file__).resolve().parents[1]
        / "custom_components" / "proxon" / "coordinator.py"
    ).read_text(encoding="utf-8")
    schreibpfad = quelle.split("async def write_register")[1].split("async def ")[0]
    assert "schreiben_mit_wiederholung(" in schreibpfad
    assert "wiederholen_bei=IllegalDataValueError" in schreibpfad
    assert "await self._unit.write_register(address, value)" not in schreibpfad
