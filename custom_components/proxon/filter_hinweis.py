"""Filterwechsel-Hinweis: Vorwarnung vor der Fälligkeit (v0.6.5).

Bis v0.6.4 kam der Hinweis erst, wenn die Anlage selbst „Filtertausch fällig"
meldete (Fehlerstatus 1, Bit 1). Zu spät, um in Ruhe einen Filter zu
besorgen (Christian, 2026-10-14). Jetzt meldet sich die Integration schon
`vorwarnung_tage` vorher, aus den Resttagen (Standzeit Reg 460 gegen
Laufzeit Reg 469). Fällig bleibt fällig, auch wenn die Resttage etwas
anderes sagen: das Bit der Anlage ist die Wahrheit.

Bewusst frei von Home-Assistant-Importen, damit ohne HA testbar.
"""
from __future__ import annotations

from datetime import date, timedelta

VORWARNUNG_TAGE = 7.0


def filter_zustand(
    *,
    faellig: bool | None,
    rest_tage: float | None,
    vorwarnung_tage: float = VORWARNUNG_TAGE,
) -> str | None:
    """"faellig", "bald", "ok" — oder None, wenn nichts sicher lesbar ist.

    None heißt: Hinweis so lassen, wie er ist (kurzer Lesefehler soll weder
    einen Hinweis erzeugen noch einen bestehenden wegräumen).
    """
    if faellig is True:
        return "faellig"
    if rest_tage is not None and rest_tage <= vorwarnung_tage:
        return "bald"
    if faellig is False:
        return "ok"
    return None


def vorwarnung_text(rest_tage: float, heute: date) -> str:
    tage = max(0, round(rest_tage))
    stichtag = (heute + timedelta(days=tage)).strftime("%d.%m.%Y")
    wann = "heute" if tage == 0 else f"in {tage} Tag{'en' if tage != 1 else ''}"
    return (
        f"Der Gerätefilter der Proxon FWT ist {wann} fällig (etwa {stichtag}).\n\n"
        "Jetzt einen Ersatzfilter besorgen. Nach der Fälligkeit schaltet sich "
        "das Gerät ab, wenn der Filter nicht innerhalb von 3 Wochen getauscht wird.\n\n"
        "Nach dem Tausch: Quittierung am Bedienteil + Button "
        "**Gerätefilter zurücksetzen** in Home Assistant drücken."
    )
