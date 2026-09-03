"""Der Datenvertrag zwischen Registertabelle und Gerätebibliothek.

Die Entity-Plattformen lesen ausschließlich `coordinator.data[<schlüssel>]`.
Beim Umstieg auf `proxon-modbus` darf sich an diesen Schlüsseln nichts ändern —
sonst werden Entities still `unavailable`, ohne dass irgendetwas fehlschlägt.
Genau diese Klasse Fehler hat die Umstellung auf entry-id-basierte unique_ids
im August unbemerkt produziert.

Geprüft wird deshalb nicht nur, dass es zu jedem Schlüssel ein Feld gibt,
sondern dass es auf **dieselbe Registeradresse** zeigt. Ein verrutschter Port
fällt sonst erst an der echten Anlage auf.

Läuft ohne Home-Assistant-Installation: `const.py` ist rein, die Bibliothek
sowieso.
"""

from __future__ import annotations

import pytest

from conftest import _load

const = _load("const")

proxon_modbus = pytest.importorskip(
    "proxon_modbus", reason="pip install -e ../proxon-modbus"
)

# (Registertabelle, Klasse der Bibliothek, Schlüssel-Präfix)
QUELLEN = [
    (const.FWT_INPUT_REGISTERS, proxon_modbus.FwtInput, ""),
    (const.FWT_HOLDING_REGISTERS, proxon_modbus.FwtHolding, ""),
    (const.T300_INPUT_REGISTERS, proxon_modbus.T300Input, "t300_"),
    (const.T300_HOLDING_REGISTERS, proxon_modbus.T300Holding, "t300_"),
]

FAELLE = [
    (schluessel, register, komponente, praefix)
    for tabelle, komponente, praefix in QUELLEN
    for schluessel, register in tabelle.items()
]


@pytest.mark.parametrize(
    "schluessel,register,komponente,praefix",
    FAELLE,
    ids=[f[0] for f in FAELLE],
)
def test_jeder_schluessel_hat_ein_feld_auf_derselben_adresse(
    schluessel, register, komponente, praefix
):
    feldname = schluessel[len(praefix):] if praefix else schluessel
    felder = komponente.declared_fields

    assert feldname in felder, (
        f"{schluessel!r} fehlt in {komponente.__name__} "
        f"(erwartetes Feld {feldname!r})"
    )
    assert felder[feldname].address == register.address, (
        f"{schluessel!r}: Registeradresse verrutscht — "
        f"const.py {register.address}, Bibliothek {felder[feldname].address}"
    )


def test_keine_zusaetzlichen_felder_ohne_schluessel():
    """Umgekehrte Richtung: kein Feld ohne Gegenstück in der Registertabelle."""
    for tabelle, komponente, praefix in QUELLEN:
        erwartet = {
            (s[len(praefix):] if praefix else s) for s in tabelle
        }
        vorhanden = set(komponente.declared_fields)
        ueberzaehlig = vorhanden - erwartet
        assert not ueberzaehlig, (
            f"{komponente.__name__} deklariert Felder ohne Schlüssel in "
            f"const.py: {sorted(ueberzaehlig)}"
        )


def test_nbe_adressen_folgen_der_schrittweite():
    """Gerät n liegt bei 590 + n*3 bzw. 213/233/253 + n."""
    temp = proxon_modbus.NbeTemperature.declared_fields["temperatur"]
    assert temp.address == 590

    settings = proxon_modbus.NbeSettings.declared_fields
    assert settings["offset_k"].address == 213
    assert settings["mitteltemperatur"].address == 233
    assert settings["ptc_freigabe"].address == 253


def test_raumnamen_slots():
    """Acht Slots ab 620, je zehn Register."""
    name = proxon_modbus.RoomNameSlot.declared_fields["name"]
    assert name.address == 620
    assert name.count == proxon_modbus.nbe.NAME_REGS == 10
    assert proxon_modbus.NAME_SLOT_COUNT == 8


def test_freischaltregister_unveraendert():
    """438 = 55555 ist die Bedingung für 460 und 467-469."""
    assert proxon_modbus.UNLOCK_REGISTER == 438
    assert proxon_modbus.UNLOCK_VALUE == 55555
    assert const.FWT_HOLDING_REGISTERS["schreibrechte"].address == 438
