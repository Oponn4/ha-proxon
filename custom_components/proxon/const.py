"""Constants for the Proxon FWT integration."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

DOMAIN = "proxon"
DEFAULT_PORT = 502
DEFAULT_SLAVE = 41
DEFAULT_SCAN_INTERVAL = 30

# Modbus register types
REG_INPUT = "input"      # 3x – read only (FC4)
REG_HOLDING = "holding"  # 4x – read/write (FC3/FC6)

# Write permission levels from the Proxon Excel
# 0 = read only, 1 = R/W (Einige), 2 = R/W (Ja)
WRITE_NONE = 0
WRITE_SOME = 1
WRITE_FULL = 2


@dataclass
class ModbusRegister:
    """Describes a single Modbus register."""
    address: int
    reg_type: str       # REG_INPUT or REG_HOLDING
    name: str
    unit: str
    scale: float        # divide raw value by this to get real value
    data_type: str      # "int16" or "uint16"
    writable: int = WRITE_NONE   # write permission level
    min_raw: int | None = None
    max_raw: int | None = None
    offset: int = 0     # added to raw before scaling: real = (raw + offset) / scale


# ─────────────────────────────────────────────
# Input Registers (3x, read-only)
# ─────────────────────────────────────────────
FWT_INPUT_REGISTERS: dict[str, ModbusRegister] = {
    # Operating state
    "betriebsart": ModbusRegister(23, REG_INPUT, "Aktuelle Betriebsart", "", 1, "int16"),

    # Temperatures – raw = real°C * 100; range -30°C to +60°C → raw 0–6000
    "t1_zuluft": ModbusRegister(195, REG_INPUT, "T1 Zuluft", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t3_frischluft": ModbusRegister(198, REG_INPUT, "T3 Frischluft", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t4_fortluft": ModbusRegister(197, REG_INPUT, "T4 Fortluft", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t5_vorverdampfer": ModbusRegister(175, REG_INPUT, "T5 VorVerdampfer", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t6_verdampfer": ModbusRegister(176, REG_INPUT, "T6 Verdampfer", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t7_abluft": ModbusRegister(196, REG_INPUT, "T7 Abluft", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t13_kompressor": ModbusRegister(180, REG_INPUT, "T13 Kompressor", "°C", 100, "uint16", min_raw=0, max_raw=15000),
    "t21_zone1": ModbusRegister(263, REG_INPUT, "T2.1 Zonentemperatur 1 (EG)", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "t22_zone2": ModbusRegister(264, REG_INPUT, "T2.2 Zonentemperatur 2 (OG)", "°C", 100, "uint16", min_raw=0, max_raw=6000),
    "soll_zone1": ModbusRegister(265, REG_INPUT, "Soll Zonentemperatur 1 (EG)", "°C", 100, "uint16", min_raw=1000, max_raw=3000),
    "soll_zone2": ModbusRegister(251, REG_INPUT, "Soll Zonentemperatur 2 (OG)", "°C", 100, "uint16", min_raw=1000, max_raw=3000),
    "temp_hbde": ModbusRegister(41, REG_INPUT, "Temperatur HBDE", "°C", 100, "uint16", min_raw=0, max_raw=4000),
    "temp_hnbe": ModbusRegister(40, REG_INPUT, "Temperatur HNBE", "°C", 100, "uint16", min_raw=0, max_raw=4000),

    # Compressor
    "kompressor_status": ModbusRegister(162, REG_INPUT, "Status Kompressor", "", 1, "int16"),
    "kompressor_leistung": ModbusRegister(171, REG_INPUT, "Leistung Kompressor", "%", 100, "int16"),
    "kompressor_drehzahl": ModbusRegister(190, REG_INPUT, "Drehzahl Kompressor", "rpm", 1, "int16"),

    # Ventilation
    "stufe_zuluft": ModbusRegister(154, REG_INPUT, "Ventilator Stufe Zuluft", "", 1, "int16"),
    "drehzahl_zuluft": ModbusRegister(0, REG_INPUT, "Drehzahl Zuluft", "rpm", 1, "int16"),
    "stufe_abluft": ModbusRegister(211, REG_INPUT, "Ventilator Stufe Abluft", "", 1, "int16"),
    "drehzahl_abluft": ModbusRegister(1, REG_INPUT, "Drehzahl Abluft", "rpm", 1, "int16"),

    # Power
    "power_pcb": ModbusRegister(19, REG_INPUT, "Leistung PCB", "W", 10, "int16"),
    "power_fu": ModbusRegister(20, REG_INPUT, "Leistung FU", "W", 10, "int16"),
    "power_total": ModbusRegister(25, REG_INPUT, "Leistung Gesamt", "W", 10, "int16"),

    # COP / JAZ
    "jaz_komp_1h": ModbusRegister(28, REG_INPUT, "JAZ Kompressor (1h)", "", 100, "int16"),
    "jaz_komp_24h": ModbusRegister(29, REG_INPUT, "JAZ Kompressor (24h)", "", 100, "int16"),
    "jaz_total_1h": ModbusRegister(33, REG_INPUT, "JAZ Gesamt (1h)", "", 100, "int16"),
    "jaz_total_24h": ModbusRegister(34, REG_INPUT, "JAZ Gesamt (24h)", "", 100, "int16"),

    # Humidity / CO2
    "co2_sensor1": ModbusRegister(21, REG_INPUT, "CO2 Sensor 1", "ppm", 1, "int16"),
    "rf_sensor1": ModbusRegister(22, REG_INPUT, "Relative Feuchte Sensor 1", "%", 1, "int16"),

    # Air volume
    "luftmenge_m3h": ModbusRegister(26, REG_INPUT, "Luftmenge", "m³/h", 10, "int16"),

    # Valve states
    "bypass_zustand": ModbusRegister(222, REG_INPUT, "Bypass Zustand", "", 1, "int16"),
    "schieber_position": ModbusRegister(159, REG_INPUT, "Schieber Position", "", 1, "int16"),
    "magnetventil": ModbusRegister(221, REG_INPUT, "Magnetventil", "", 1, "int16"),

    # Room temperatures via NBE sensors (scale 0.1 → divide by 10, valid 10–40°C)
    "temp_klavierzimmer": ModbusRegister(590, REG_INPUT, "Temperatur Klavierzimmer", "°C", 10, "uint16", min_raw=100, max_raw=400),
    "temp_flur": ModbusRegister(593, REG_INPUT, "Temperatur Flur", "°C", 10, "uint16", min_raw=100, max_raw=400),
    "temp_schlafzimmer": ModbusRegister(596, REG_INPUT, "Temperatur Schlafzimmer", "°C", 10, "uint16", min_raw=100, max_raw=400),
    "temp_office": ModbusRegister(602, REG_INPUT, "Temperatur Office", "°C", 10, "uint16", min_raw=100, max_raw=400),

    # Errors
    "stoerung": ModbusRegister(47, REG_INPUT, "Störung", "", 1, "int16"),
    "error_status1": ModbusRegister(48, REG_INPUT, "Fehlerstatus 1", "", 1, "int16"),
    "error_status2": ModbusRegister(49, REG_INPUT, "Fehlerstatus 2", "", 1, "int16"),
    "error_status3": ModbusRegister(50, REG_INPUT, "Fehlerstatus 3", "", 1, "int16"),
    "error_status4": ModbusRegister(51, REG_INPUT, "Fehlerstatus 4", "", 1, "int16"),
}

# ─────────────────────────────────────────────
# Holding Registers (4x, read + optional write)
# ─────────────────────────────────────────────
FWT_HOLDING_REGISTERS: dict[str, ModbusRegister] = {
    # Operating mode (write level 1)
    "sollbetriebsart": ModbusRegister(
        16, REG_HOLDING, "Soll Betriebsart", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=9,
    ),
    # Fan level (write level 1)
    "luefterstufe": ModbusRegister(
        22, REG_HOLDING, "Lüfterstufe", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=1, max_raw=4,
    ),
    # Cooling enable (write level 1)
    "kuehlung_freigabe": ModbusRegister(
        62, REG_HOLDING, "Kühlung Freigabe", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1,
    ),
    # Target temperatures (write level 1)
    "soll_temp_zone1": ModbusRegister(
        70, REG_HOLDING, "Soll Temperatur Zone 1 (EG)", "°C", 100, "int16",
        writable=WRITE_SOME, min_raw=1000, max_raw=3000,
    ),
    "soll_temp_zone2": ModbusRegister(
        75, REG_HOLDING, "Soll Temperatur Zone 2 (OG)", "°C", 100, "int16",
        writable=WRITE_SOME, min_raw=1000, max_raw=3000,
    ),
    # Intensive ventilation (write level 1)
    "intensivlueftung": ModbusRegister(
        133, REG_HOLDING, "Intensivlüftung", "min", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1440,
    ),
    # Thresholds (read-only at level 0 / 1)
    "wp_einschaltschwelle": ModbusRegister(42, REG_HOLDING, "WP Einschaltschwelle", "°C", 100, "int16"),
    "wp_ausschaltschwelle": ModbusRegister(143, REG_HOLDING, "WP Ausschaltschwelle", "°C", 100, "int16"),
    "wp_kuehlschwelle": ModbusRegister(41, REG_HOLDING, "WP Kühlschwelle", "°C", 100, "int16"),
    # Write permissions register (read current level)
    "schreibrechte": ModbusRegister(438, REG_HOLDING, "Schreibrechte", "", 1, "uint16"),
    # NBE offsets (write level 1)
    "nbe_offset_haupt": ModbusRegister(
        213, REG_HOLDING, "NBE Offset Hauptbedienteil (Büro)", "°C", 1, "int16",
        writable=WRITE_SOME, min_raw=-3, max_raw=3,
    ),
    "nbe_offset_1": ModbusRegister(
        214, REG_HOLDING, "NBE 1 Offset (Diele)", "°C", 1, "int16",
        writable=WRITE_SOME, min_raw=-3, max_raw=3,
    ),
    "nbe_offset_2": ModbusRegister(
        215, REG_HOLDING, "NBE 2 Offset (Schlafen)", "°C", 1, "int16",
        writable=WRITE_SOME, min_raw=-3, max_raw=3,
    ),
    "nbe_offset_4": ModbusRegister(
        217, REG_HOLDING, "NBE 4 Offset (Kreativ)", "°C", 1, "int16",
        writable=WRITE_SOME, min_raw=-3, max_raw=3,
    ),
    # Actual heat pump operating mode (read-only holding)
    "betriebsart_wp": ModbusRegister(69, REG_HOLDING, "Betriebsart Wärmepumpe", "", 1, "uint16"),

    # NBE average zone temperatures (no scale = raw integer °C)
    "mitteltemp_klavierzimmer": ModbusRegister(233, REG_HOLDING, "Mitteltemperatur Klavierzimmer", "°C", 1, "int16"),
    "mitteltemp_flur": ModbusRegister(234, REG_HOLDING, "Mitteltemperatur Flur", "°C", 1, "int16"),
    "mitteltemp_schlafzimmer": ModbusRegister(235, REG_HOLDING, "Mitteltemperatur Schlafzimmer", "°C", 1, "int16"),
    "mitteltemp_office": ModbusRegister(237, REG_HOLDING, "Mitteltemperatur Office", "°C", 1, "int16"),

    # HBDE PTC (write level 1)
    "hbde_ptc_freigabe": ModbusRegister(
        187, REG_HOLDING, "HBDE PTC Freigabe (Wohnzimmer)", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1,
    ),
}

# Operating mode mapping
BETRIEBSART_MAP: dict[int, str] = {
    0: "Aus",
    1: "Sommerbetrieb",
    2: "Winterbetrieb",
    3: "Komfortbetrieb",
    4: "Ofenmodus",
    9: "Test",
}
BETRIEBSART_REVERSE: dict[str, int] = {v: k for k, v in BETRIEBSART_MAP.items()}

# ─────────────────────────────────────────────
# T300 Warmwasser-Wärmepumpe
# Same RS485 bus + Slave ID 41 as FWT
# Temperature formula: real = (raw - 1000) / 10
# ─────────────────────────────────────────────
T300_INPUT_REGISTERS: dict[str, ModbusRegister] = {
    # Temperatures (offset=-1000, scale=10)
    # raw range: 500–2000 → -50°C to +100°C; stale-frame guard via min_raw/max_raw
    "t300_t5_vorverdampfer": ModbusRegister(811, REG_INPUT, "T300 T5 VorVerdampfer", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_t6_verdampfer": ModbusRegister(812, REG_INPUT, "T300 T6 Verdampfer", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_t20_behaelter_unten": ModbusRegister(813, REG_INPUT, "T300 T20 Behälter Unten", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_t21_behaelter_mitte": ModbusRegister(814, REG_INPUT, "T300 T21 Behälter Mitte", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_t13_kompressor": ModbusRegister(815, REG_INPUT, "T300 T13 Kompressor", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2500),
    "t300_t11_sauggas": ModbusRegister(816, REG_INPUT, "T300 T11 Sauggas nach Verdampfer", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_t9_extern": ModbusRegister(817, REG_INPUT, "T300 T9 Extern Fühler", "°C", 10, "uint16", offset=-1000, min_raw=500, max_raw=2000),
    "t300_behaelter_avg": ModbusRegister(882, REG_INPUT, "T300 Behälter Durchschnitt", "°C", 100, "uint16", min_raw=1000, max_raw=10000),
    "t300_solltemperatur_akt": ModbusRegister(879, REG_INPUT, "T300 Aktueller Sollwert", "°C", 10, "uint16", min_raw=200, max_raw=700),

    # Relay states
    "t300_r2_kompressor": ModbusRegister(824, REG_INPUT, "T300 R2 Kompressor", "", 1, "uint16"),
    "t300_r3_solar": ModbusRegister(825, REG_INPUT, "T300 R3 Solar", "", 1, "uint16"),
    "t300_r4_eheiz": ModbusRegister(826, REG_INPUT, "T300 R4 E-Heiz", "", 1, "uint16"),
    "t300_r5_ventilator": ModbusRegister(827, REG_INPUT, "T300 R5 Ventilator", "", 1, "uint16"),
    "t300_r6_abtau": ModbusRegister(828, REG_INPUT, "T300 R6 Abtau", "", 1, "uint16"),

    # Fan
    "t300_ventilator_pct": ModbusRegister(838, REG_INPUT, "T300 Ventilator Geschwindigkeit", "%", 1, "uint16"),
    "t300_ventilator_rpm": ModbusRegister(862, REG_INPUT, "T300 Ventilator RPM", "rpm", 1, "uint16"),

    # PV
    "t300_pv_eheiz": ModbusRegister(899, REG_INPUT, "T300 PV E-Heiz aktiv", "", 1, "uint16"),
    "t300_pv_wp": ModbusRegister(900, REG_INPUT, "T300 PV WP aktiv", "", 1, "uint16"),

    # Errors
    "t300_fehlerliste": ModbusRegister(861, REG_INPUT, "T300 Fehlerliste", "", 1, "uint16"),
}

T300_HOLDING_REGISTERS: dict[str, ModbusRegister] = {
    # Betriebsart 0=AUS, 1=Bedarf, 2=LF1 (Legionella Force 1), 3=LF2
    "t300_betriebsart": ModbusRegister(
        2002, REG_HOLDING, "T300 Betriebsart", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=3,
    ),
    # Solltemperatur (normal water temp)
    "t300_solltemperatur": ModbusRegister(
        2000, REG_HOLDING, "T300 Solltemperatur", "°C", 10, "uint16",
        writable=WRITE_SOME, min_raw=200, max_raw=550,
    ),
    # E-Heizstab (boost heater)
    "t300_eheiz_freigabe": ModbusRegister(
        2001, REG_HOLDING, "T300 E-Heiz Freigabe", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1,
    ),
    # Boost temperature
    "t300_temp_eheiz": ModbusRegister(
        2003, REG_HOLDING, "T300 Temperatur E-Heiz", "°C", 10, "uint16",
        writable=WRITE_SOME, min_raw=200, max_raw=700,
    ),
    # Legionella function
    "t300_legionella": ModbusRegister(
        2025, REG_HOLDING, "T300 Legionellafunktion", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1,
    ),
    # PV function
    "t300_pv_funktion": ModbusRegister(
        2010, REG_HOLDING, "T300 PV Funktion", "", 1, "uint16",
        writable=WRITE_SOME, min_raw=0, max_raw=1,
    ),
}

T300_BETRIEBSART_MAP: dict[int, str] = {
    0: "Aus",
    1: "Bedarf",
    2: "Legionella Force 1",
    3: "Legionella Force 2",
}
T300_BETRIEBSART_REVERSE: dict[str, int] = {v: k for k, v in T300_BETRIEBSART_MAP.items()}
