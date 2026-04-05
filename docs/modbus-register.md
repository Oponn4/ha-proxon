# Proxon FWT 2.0 – Modbus Register

Vollständige Register-Referenz für die HA Custom Integration.
**Adressierung**: 0-basiert (PDU-Adresse = Excel-Nummer), identisch mit const.py.

**Quellen**: Modbus-Liste-FWT2.0-ver1-Christian, Modbus-Liste-FWT2.0-ver2-T300, ModbusPanel.ini (IBT ELT Ver12/Ver14)

---

## Implementierungsübersicht (HA Integration)

### Input Register – in const.py implementiert

| Addr | Key | Einheit | Bemerkung |
|-----:|-----|---------|-----------|
| 0 | drehzahl_zuluft | rpm | |
| 1 | drehzahl_abluft | rpm | |
| 19 | power_pcb | W | |
| 20 | power_fu | W | |
| 21 | co2_sensor1 | ppm | |
| 22 | rf_sensor1 | % | |
| 23 | betriebsart | — | |
| 25 | power_total | W | |
| 26 | luftmenge_m3h | m³/h | |
| 28 | jaz_komp_1h | — | ⚠️ immer 0, siehe unten |
| 29 | jaz_komp_24h | — | ⚠️ immer 0, siehe unten |
| 33 | jaz_total_1h | — | ⚠️ immer 0, siehe unten |
| 34 | jaz_total_24h | — | ⚠️ immer 0, siehe unten |
| 40 | temp_hnbe | °C | |
| 41 | temp_hbde | °C | |
| 47 | stoerung | — | |
| 48 | error_status1 | Bit | Bit1=Filtertausch fällig |
| 49–51 | error_status2–4 | Bit | |
| 154 | stufe_zuluft | — | |
| 162 | kompressor_status | — | |
| 171 | kompressor_leistung | % | |
| 175 | t5_vorverdampfer | °C | |
| 176 | t6_verdampfer | °C | |
| 180 | t13_kompressor | °C | |
| 190 | kompressor_drehzahl | rpm | |
| 195–198 | t1/t3/t4/t7 | °C | Temperaturen |
| 211 | stufe_abluft | — | |
| 221 | magnetventil | — | |
| 222 | bypass_zustand | — | |
| 263–265 | t21/t22/soll_zone1 | °C | |
| 590–602 | temp_klavierzimmer/flur/schlafen/office | °C | NBE-Sensoren |
| 811–900 | T300 (Warmwasser-WP) | — | Eigener Block |

### Holding Register – in const.py implementiert

| Addr | Key | Einheit | Bemerkung |
|-----:|-----|---------|-----------|
| 16 | sollbetriebsart | — | R/W |
| 22 | luefterstufe | — | R/W |
| 41 | wp_kuehlschwelle | °C | |
| 42 | wp_einschaltschwelle | °C | |
| 62 | kuehlung_freigabe | — | R/W |
| 69 | betriebsart_wp | — | |
| 70 | soll_temp_zone1 | °C | R/W |
| 75 | soll_temp_zone2 | °C | R/W |
| 133 | intensivlueftung | min | R/W |
| 143 | wp_ausschaltschwelle | °C | |
| 187 | hbde_ptc_freigabe | — | R/W |
| 213–217 | nbe_offset_* | °C | R/W, Raum-Offsets |
| 233–237 | mitteltemp_* | °C | NBE-Mitteltemperaturen |
| 438 | schreibrechte | — | Write unlock: 55555 |
| 448 | passwort | — | Service: 906 |
| 460 | geraetefilter_standzeit_monate | Monate | R/W |
| 467 | fwt_betriebsstunden | h | Zähler |
| 469 | geraetefilter_stunden | h | Reset nach Filtertausch |
| 2000–2025 | T300 Holding | — | Warmwasser-WP Sollwerte |

---

## Bekannte Probleme & Untersuchungen

### JAZ-Sensoren immer 0

**Betroffene Register**: 27–36 (Input, JAZ Komp und JAZ Total für 1min/1h/24h/365d)

**Messung (2026-04-05, Firmware 73.73)**:
- Reg 27 (JAZ Komp 1min): 0
- Reg 28 (JAZ Komp 1h): 0
- Reg 29 (JAZ Komp 24h): 0
- Reg 30 (JAZ Komp 365d): 0
- **Reg 31 (JAZ Komp Days): 7637** ← Zähler läuft!
- Reg 32–35 (JAZ Total alle Perioden): 0
- Reg 36 (JAZ Total Days): 0

**Analyse**: Der Days-Zähler (Reg 31 = 7637) läuft, was bedeutet, dass die JAZ-Infrastruktur im Gerät aktiv ist. Die eigentliche JAZ-Berechnung gibt aber 0 zurück. Mögliche Ursachen:
- Die FWT benötigt für die JAZ-Berechnung einen Wärmemengenzähler (nicht installiert)
- Oder die Wärmeauskopplung wird über Kältemitteldaten berechnet und ist in dieser Firmware-Konfiguration deaktiviert
- "Reset COP val" (Holding Reg 810 = 1) könnte die Werte zurückgesetzt haben

**Konsequenz**: JAZ-Sensoren sind in der Integration standardmäßig deaktiviert (`entity_registry_enabled_default = False`).

### ErrorStatus1 Bit-Mapping (Input Reg 48)

| Bit | Wert | Bedeutung |
|-----|-----:|-----------|
| 0 | 1 | — (unbekannt) |
| **1** | **2** | **Filtertausch fällig** |
| 2 | 4 | — |
| ... | ... | weitere Fehler |

Gerät-eigener Wert am 2026-04-05: `error_status1 = 2` → Bit 1 gesetzt → Filtertausch fällig ✓

---

## Raumnamen-Register (Holding, FC3, Unlock erforderlich)

Holding-Register 620–859 enthalten die NBE-Raumnamen als **Packed ASCII** (2 Zeichen pro uint16-Register, 10 Register à 20 Zeichen pro NBE-Name). Zum Lesen muss der Write-Unlock aktiv sein (Reg 438 = 55555).

**Quellen**: `ModbusPanel.ini` Blöcke R12 und R13:
- `R12=41;3;620;120` → NBE 0–11 Namen (Haupt-NBE + NBE 1–11)
- `R13=41;3;740;90` → NBE 12–20 Namen

| Addr | Register | Beschreibung |
|-----:|----------|--------------|
| 620 | NBE0nameCh1Ch2 | Haupt-NBE Name Zeichen 1–2 |
| 621 | NBE0nameCh3Ch4 | Haupt-NBE Name Zeichen 3–4 |
| ... | ... | je 10 Register pro NBE = 20 Zeichen |
| 630 | NBE1nameCh1Ch2 | NBE 1 Name Zeichen 1–2 |
| 640 | NBE2nameCh1Ch2 | NBE 2 Name |
| ... | ... | |
| 740 | NBE12nameCh1Ch2 | NBE 12 Name |

**Dekodierung**: Jedes uint16 enthält 2 ASCII-Zeichen: `high_byte = raw >> 8`, `low_byte = raw & 0xFF`

---

## Holding Register (FC3 lesen / FC6 schreiben)

| Addr | Parameter | Gruppe | R/W | Typ | Format | Einheit | Min | Max | Kommentar |
|-----:|-----------|--------|:---:|-----|:------:|---------|----:|----:|-----------|
| 0 | Maximal Drehzahl Ventilator (Fehler) | C10:Lüftung | R/W | uint16 | *1 | rpm | 0 | 10000 |  |
| 1 | Ventilator Fehler zeitverzögerung in betrieb | C11:Lüftung | R/W | uint16 | *1 | Sekunden | 0 | 1800 |  |
| 2 | Zuluft Einstellung Stufe 1 | C01:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 3 | Zuluft Einstellung Stufe 2 | C02:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 4 | Zuluft Einstellung Stufe 3 | C03:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 5 | Zuluft Einstellung Stufe 4 | C04:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 6 | Abluft Einstellung Stufe 1 | C05:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 7 | Abluft Einstellung Stufe 2 | C06:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 8 | Abluft Einstellung Stufe 3 | C07:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 9 | Abluft Einstellung Stufe 4 | C08:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 10 | Mindest Drehzahl Ventilator (Fehler) | C09:Lüftung | R/W | uint16 | *1 | rpm | 0 | 5000 |  |
| 11 | Ventilator Minimum Luftmenge | C13:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 12 | Ventilator Maximum Luftmenge | C14:Lüftung | R/W | uint16 | *100 | % | 0 | 10000 |  |
| 13 | Reduktion Zuluftmenge bei Abtau | E06:Abtau | R/W | uint16 | *1 | % | 0 | 100 |  |
| 14 | RF Regelung hoch Kondensatortemperatur, Lüfterstufe 3 | J07:RH/CO2 | R/W | int16 | *100 | °C | 2500 | 5500 |  |
| 15 | RF Regelung niedriger Kondensatortemperatur, Lüfterstufe 2 | J08:RH/CO2 | R/W | int16 | *100 | °C | 2500 | 5500 |  |
| 16 | Betriebsart (0=Aus, 1=EcoSommer, 2=EcoWinter, 9=Test) | A01:Haupt Menu | R/W | uint16 | *1 |  | 0 | 9 |  |
| 17 | Geräte Modell (0=FWT, 1=P) | A03:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 18 | Geräte typ (0=Nur Heizen, 1=Heizen und Küühlen) | A04:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 19 | Minimum Frischlufttemperatur (Bypass AUS) | G01:Bypass | R/W | int16 | *100 | °C | 800 | 2000 |  |
| 20 | Schieber Berechnung Intervall | H06:Schieber | R/W | uint16 | *1 | Sekunden | 30 | 3600 |  |
| 21 | Bypass (0=Geregelt, 1=Geschlossen, 2=Geöffnet) | T05:Test | R/W | uint16 | *1 |  | 0 | 2 |  |
| 22 | Lüfter stufe in ECOSommer, ECOWinter, Test (1=LS1, 2=LS2, 3=LS3, 4=LS4) | A02:Haupt Menu | R/W | uint16 | *1 |  | 1 | 4 |  |
| 23 | Schieber laufzeit Total | H01:Schieber | R/W | uint16 | *10 | Sekunden | 10 | 120 |  |
| 24 | Schieber laufzeit Posision 1 | H02:Schieber | R/W | uint16 | *10 | Sekunden | 10 | 120 |  |
| 25 | Schieber laufzeit Posision 2 | H03:Schieber | R/W | uint16 | *10 | Sekunden | 10 | 120 |  |
| 26 | Schieber laufzeit Posision 3 | H04:Schieber | R/W | uint16 | *10 | Sekunden | 10 | 120 |  |
| 27 | Schieber laufzeit Posision 4 | H05:Schieber | R/W | uint16 | *10 | Sekunden | 10 | 120 |  |
| 28 | Schieber (0=Geregelt, 1=Pos1...4=Pos4, 5=Pos0) | T06:Test | R/W | uint16 | *1 |  | 0 | 5 |  |
| 29 | Schieber Richtung | H07:Schieber | R/W | uint16 | *1 |  | 0 | 1 |  |
| 30 | Schonzeit Kompressor (Aus-An Kompressor) | B01:Wärmepumpe | R/W | uint16 | *1 | Sekunden | 0 | 3600 |  |
| 31 | Mindestlaufzeit Kompressor | B02:Wärmepumpe | R/W | uint16 | *1 | Sekunden | 0 | 3600 |  |
| 32 | Max Kondensator Temperatur Lüfterstufe 3 (shaltet zu stufe 4) | B03:Wärmepumpe | R/W | int16 | *100 | °C | 4500 | 5200 |  |
| 33 | Max Kondensator Temperatur Lüfterstufe 4 (wird der Kompressorleistung reduzirt) | B04:Wärmepumpe | R/W | int16 | *100 | °C | 4500 | 6000 |  |
| 34 | Maximal Temperatur Kompressor (T13) (wird der Kompressorleistung reduzirt) | B05:Wärmepumpe | R/W | int16 | *100 | °C | 8000 | 14000 |  |
| 35 | Abtau Fehler Dauer Max | E07:Abtau | R/W | uint16 | *1 | Minuten | 30 | 120 |  |
| 36 | Abtau AUS bei Temperatur (T6) | E03:Abtau | R/W | int16 | *100 | °C | 500 | 1000 |  |
| 37 | Kompressor Leistung bei Abtau | E05:Abtau | R/W | uint16 | *100 | % | 5000 | 10000 |  |
| 38 | CO2/RF Montiert | J01:RH/CO2 | R/W | uint16 | *1 | Binär | 0 | 31 | Bit4:CO2/RF 5 Bit3:CO2/RF 4 Bit2:CO2/RF 3 Bit1:CO2/RF 2 Bit0:CO2/RF 1 |
| 40 | Druckausgleich Kompressor (HD-ND) | B06:Wärmepumpe | R/W | uint16 | *1 | Sekunden | 0 | 180 |  |
| 41 | Wärmepumpe kühlung schwelle | A07:Haupt Menu | R/W | int16 | *100 | °C | 300 | 600 |  |
| 42 | Wärmepumpe einschalt schwelle | A05:Haupt Menu | R/W | int16 | *100 | °C | 0 | 300 |  |
| 43 | Kompressor Maximaleleistung Heizen | B08:Wärmepumpe | R/W | uint16 | *100 | % | 5000 | 10000 |  |
| 44 | Kompressor Minimumleistung | B07:Wärmepumpe | R/W | uint16 | *100 | % | 2500 | 5000 |  |
| 45 | Maximale Kondensatortemperatur bei Kühlung | B10:Wärmepumpe | R/W | int16 | *100 | °C | 4500 | 5500 |  |
| 46 | Minimumaussentemperatur Freigabe Kühlung | B11:Wärmepumpe | R/W | int16 | *100 | °C | 500 | 2000 |  |
| 47 | SuperHeatKpDamping | K22:E-Ventile | R/W | uint16 | *100 |  | 0 | 100 |  |
| 48 | Kompressor immer im betrieb unabhängig von heizbedarf bei niedrigern aussenlufttemperatur (AUL) | B12:Wärmepumpe | R/W | int16 | *100 | °C | -1500 | 500 |  |
| 49 | SuperHeatStabilityFaktor | K12:E-Ventile | R/W | uint16 | *100 | °C | 0 | 200 |  |
| 50 | AnlaufZeit Abtau bei Minimum Leistung | E08:Abtau | R/W | uint16 | *1 | Sekunden | 0 | 120 |  |
| 51 | SuperHeatStabilityWindow | K13:E-Ventile | R/W | uint16 | *1 |  | 0 | 1000 |  |
| 52 | Kompressor Maximaleleistung Kühlen | B09:Wärmepumpe | R/W | uint16 | *100 | % | 5000 | 10000 |  |
| 53 | AbtauSperrzeit | E09:Abtau | R/W | uint16 | *1 | Minuten | 5 | 40 |  |
| 54 | Pid Delta Sauggas Kondensator Kp | K05:E-Ventile | R/W | uint16 | *1 |  | 0 | 10000 |  |
| 55 | Pid Delta Sauggas Kondensator Ti | K06:E-Ventile | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 56 | Pid Delta Sauggas Kondensator Td | K07:E-Ventile | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 57 | Pid Delta Sauggas Kondensator H | K08:E-Ventile | R/W | uint16 | *10 | Sekunden | 1 | 200 |  |
| 58 | Pid Delta Sauggas Verdampfer Kp | K01:E-Ventile | R/W | uint16 | *1 |  | 0 | 10000 |  |
| 59 | Pid Delta Sauggas Verdampfer Ti | K02:E-Ventile | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 60 | Pid Delta Sauggas Verdampfer Td | K03:E-Ventile | R/W | uint16 | *1 |  | 0 | 100 |  |
| 61 | Pid Delta Sauggas Verdampfer H | K04:E-Ventile | R/W | uint16 | *10 | Sekunden | 1 | 200 |  |
| 62 | Küühlung freigabe | A08:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 63 | Vorwärme Aus Differens bei typ 1 | F03:Vorwärme | R/W | int16 | *100 | °C | 50 | 200 |  |
| 64 | Pid Vorwärme Kp | F05:Vorwärme | R/W | uint16 | *1 |  | 0 | 10000 |  |
| 65 | Pid E-ventil Vorwärme Ti | F06:Vorwärme | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 66 | Pid E-ventil Vorwärme Td | F07:Vorwärme | R/W | uint16 | *1 |  | 0 | 100 |  |
| 67 | Pid E-ventil Vorwärme H | F08:Vorwärme | R/W | uint16 | *10 | Sekunden | 1 | 200 |  |
| 68 | Minimum Temperatur nach VorWärme (T8) (sicherheit) | F09:Vorwärme | R/W | int16 | *100 | °C | -2500 | 0 |  |
| 69 | Wärmepumpe Betriebsart (0=Aus, 1=Heizbedarf, 2=Küühlbedarf, 3=Ventilation) | T01:Test | R/W | uint16 | *1 |  | 0 | 3 |  |
| 70 | Soll Temperatur Zone 1 (EG) | A09:Haupt Menu | R/W | int16 | *100 | °C | 1000 | 3000 |  |
| 71 | Kompressor Leistung | T02:Test | R/W | uint16 | *1 | rpm | 100 | 10000 |  |
| 72 | Abtau (0=Geregelt, 1=Abtau Gesperrt) | T03:Test | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 73 | Abtau AN Druck Schwelle bei 20% luftleistung | E01:Abtau | R/W | uint16 | *100 | Pa | 0 | 5000 |  |
| 74 | Abtau AN Druck Schwelle bei 80% luftleistung | E02:Abtau | R/W | uint16 | *100 | Pa | 0 | 5000 |  |
| 75 | Soll Temperatur Zone 2 (OG) (Bei keine HNBE) | A10:Haupt Menu | R/W | int16 | *100 | °C | 1000 | 3000 |  |
| 77 | Maximum Aussentemperatur (T9) | I02:Erdwärmetauscher | R/W | int16 | *100 | °C | 1500 | 3000 |  |
| 78 | Minimum Aussentemperatur (T9) | I01:Erdwärmetauscher | R/W | int16 | *100 | °C | 0 | 1500 |  |
| 79 | Aussentemperatur Differens (T9) | I03:Erdwärmetauscher | R/W | int16 | *100 | °C | 100 | 600 |  |
| 80 | Erdwärmetauscher (0=Geregelt, 1=Geschlossen, 2=Geöffnet) | T07:Test | R/W | uint16 | *1 |  | 0 | 2 |  |
| 81 | Pid Temperatur Zuluft Kp | D01:Raumerwärming | R/W | uint16 | *1 |  | 0 | 10000 |  |
| 82 | Pid Temperatur Zuluft Ti | D02:Raumerwärming | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 83 | Pid Temperatur Zuluft Td | D03:Raumerwärming | R/W | uint16 | *1 |  | 0 | 100 |  |
| 84 | Pid Temperatur Zuluft H | D04:Raumerwärming | R/W | uint16 | *1 | Sekunden | 1 | 200 |  |
| 85 | Pid Temperatur Zone1 (EG) Kp | D07:Raumerwärming | R/W | uint16 | *1 |  | 0 | 10000 |  |
| 86 | Pid Temperatur Zone1 (EG) Ti | D08:Raumerwärming | R/W | uint16 | *1 |  | 0 | 30000 |  |
| 87 | Pid Temperatur Zone1 (EG) Td | D09:Raumerwärming | R/W | uint16 | *1 |  | 0 | 100 |  |
| 88 | Pid Temperatur Zone1 (EG) H | D10:Raumerwärming | R/W | uint16 | *1 | Sekunden | 1 | 200 |  |
| 93 | Mininum Zuluft Temperatur | D05:Raumerwärming | R/W | int16 | *100 | °C | 0 | 3000 |  |
| 94 | Laufzeit der Kompressor bei Mindestleistung (Keine heiz/kühl bedarf) | B13:Wärmepumpe | R/W | uint16 | *1 | Sekunden | 0 | 1200 |  |
| 95 | Leistungsrampe (Leistungsbegrenzung ober Grenze) | B15:Wärmepumpe | R/W | int16 | *100 | % | 3000 | 10000 |  |
| 96 | Leistungsrampe (Leistungsbegrenzung unter Grenze) | B14:Wärmepumpe | R/W | int16 | *100 | % | 3000 | 10000 |  |
| 97 | Frischlufttemperatur ober Grenze | B17:Wärmepumpe | R/W | int16 | *100 | °C | -500 | 1700 |  |
| 98 | Frischlufttemperatur unter Grenze | B16:Wärmepumpe | R/W | int16 | *100 | °C | -500 | 1700 |  |
| 99 | Vorwärme Temperatur bei typ 0 (T8) | F04:Vorwärme | R/W | int16 | *100 | °C | -2500 | 5000 |  |
| 100 | Vorwärme Typ (0=E-ventil, 1=An/Aus Ventil) | F01:Vorwärme | R/W | uint16 | *1 |  | 0 | 1 |  |
| 101 | Vorwärme (0=Geregelt, 1=Vorwärme Gesperrt) | T04:Test | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 102 | Bypasstemperatur Hysterese | G02:Bypass | R/W | int16 | *100 | °C | 0 | 1000 |  |
| 103 | Maximum Zuluft Temperatur | D06:Raumerwärming | R/W | int16 | *100 | °C | 0 | 6000 |  |
| 104 | Ventilator Fehler zeitverzögerung bei anlauf | C12:Lüftung | R/W | uint16 | *1 | Sekunden | 0 | 1800 |  |
| 105 | Rf Simuliert | T08:Test | R/W | uint16 | *1 | % | 0 | 100 |  |
| 106 | Abtau AUS unser Druck % | E04:Abtau | R/W | uint16 | *1 | % | 20 | 100 |  |
| 107 | Bypass laufzeit (AN/AUS) | G03:Bypass | R/W | uint16 | *1 | Sekunden | 10 | 20 |  |
| 108 | EndlineTest1 | T14:Test | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 109 | EndlineTest2 | T15:Test | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 110 | E-ventil Max Schritt pro Takt | K23:E-Ventile | R/W | uint16 | *1 |  | 1 | 240 |  |
| 111 | Deaktivieren Sicherheit im Testmodus (Wert = 1234) | T16:Test | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 113 | Niederdruck Fehler Schwelle | B18:Wärmepumpe | R/W | uint16 | *1000 | bar | 50 | 500 |  |
| 114 | Vorwärme Ein bei typ 1 | F02:Vorwärme | R/W | int16 | *100 | °C | -2500 | 5000 |  |
| 115 | Zone 1 (EG) Temperatursensor (0=Haupt Touch Bedienteil, 1=T2.1 auf neben Platine T41) | A11:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 116 | Zone 2 (OG) Temperatursensor (0=Haupt Neben Bedienteil, 1=T2.2 auf neben Platine T42) | A12:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 117 | CO2 Schwelle (bei hoch CO2, Lüfterstufe 4) | J09:RH/CO2 | R/W | uint16 | *1 | ppm | 400 | 1500 |  |
| 118 | Relativ Feuchtigkeit (bei niedrich RF/CO2, Lüfterstufe 2) | J10:RH/CO2 | R/W | uint16 | *1 | % | 0 | 100 |  |
| 119 | Mindest Überhitzung bei niedrigen Leistung | K14:E-Ventile | R/W | int16 | *100 | °C | 100 | 2000 |  |
| 120 | Maximale Überhitzung bei niedrigen Leistung | K15:E-Ventile | R/W | int16 | *100 | °C | 100 | 2000 |  |
| 121 | Mindest Überhitzung bei hoher Leistung | K16:E-Ventile | R/W | int16 | *100 | °C | 100 | 2000 |  |
| 122 | Maximale Überhitzung bei hoher Leistung | K17:E-Ventile | R/W | int16 | *100 | °C | 100 | 2000 |  |
| 123 | FU Strom bei niedriger Leistung | K18:E-Ventile | R/W | int16 | *100 | Ampere | 100 | 1000 |  |
| 124 | FU Strom bei hoher Leistung | K19:E-Ventile | R/W | int16 | *100 | Ampere | 100 | 1000 |  |
| 125 | Regel Freigabe Zeit Nach Abtau | K20:E-Ventile | R/W | uint16 | *1 | Sekunden | 0 | 1200 |  |
| 126 | Überhitzung Erhöhen Nach Abtau | K21:E-Ventile | R/W | int16 | *100 | °C | 0 | 600 |  |
| 127 | UpdataFuMaxRpm | B19:Wärmepumpe | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 128 | FuMaxRpm | B20:Wärmepumpe | R/W | uint16 | *1 | ppm | 2500 | 10000 |  |
| 129 | E-ventil Start Öffnung | K9:E-Ventile | R/W | uint16 | *1 |  | 0 | 240 |  |
| 130 | E-ventil Start Öffnung Zeit | K10:E-Ventile | R/W | uint16 | *1 | Sekunden | 0 | 300 |  |
| 131 | Überhitzung Schritt bei instabilen | K11:E-Ventile | R/W | int16 | *100 | °C | 0 | 1000 |  |
| 132 | CO2 simuliert | T09:Test | R/W | uint16 | *1 | ppm | 0 | 32000 |  |
| 133 | Intensivluftung | C15:Lüftung | R/W | uint16 | *1 | Minuten | 0 | 1440 |  |
| 134 | Wärmepumpe ausschalt schwelle | A06:Haupt Menu | R/W | int16 | *100 | °C | 0 | 300 |  |
| 187 | HBDE (Hauptbedienelement) PTC Freigeben / Wohnzimmer | L044:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 | Stand nicht in der Anleitung > Trial and Error gefunden :D |
| 210 | NBE verbunden (bit 0 = NBE1 .. Bit 15 =NBE16) | L001:PTC | R/W | uint16 | *1 | Binär | 0 | 65535 | Bit15:NBE16 Bit14:NBE15 Bit13:NBE14 Bit12:NBE13 Bit11:NBE12 Bit10:NBE11 Bit9:NBE10 Bit8:NBE9 Bit7:NBE8 Bit6:NBE7 Bit5:NBE6 Bit4:NBE5 Bit3:NBE4 Bit2:NBE3 Bit1:NBE2 Bit0:NBE1 |
| 211 | NBE verbunden (bit 0 = NB17, Bit 1 =NBE18, Bit 2 =NBE19, Bit 3 =HNBE) | L002:PTC | R/W | uint16 | *1 | Binär | 0 | 15 | Bit3:HNBE Bit2:NBE19 Bit1:NBE18 Bit0:NBE17 |
| 212 | Heizmodul 1+2 verbunden (bit 0 = Heizmodul1, bit 1 = Heizmodul2) | L003:PTC | R/W | uint16 | *1 | Binär | 0 | 3 | Bit1:HMODUL2 Bit0:HMODUL1 |
| 213 | Haupt NBE Offsettemperatur (Büro) | L004:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 214 | NBE 1 Offsettemperatur (Diele) | L005:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 215 | NBE 2 Offsettemperatur (Schlafen) | L006:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 216 | NBE 3 Offsettemperatur —— | L007:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 217 | NBE 4 Offsettemperatur (Kreativ) | L008:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 218 | NBE 5 Offsettemperatur | L009:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 219 | NBE 6 Offsettemperatur | L010:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 220 | NBE 7 Offsettemperatur | L011:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 221 | NBE 8 Offsettemperatur | L012:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 222 | NBE 9 Offsettemperatur | L013:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 223 | NBE 10 Offsettemperatur | L014:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 224 | NBE 11 Offsettemperatur | L015:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 225 | NBE 12 Offsettemperatur | L016:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 226 | NBE 13 Offsettemperatur | L017:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 227 | NBE 14 Offsettemperatur | L018:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 228 | NBE 15 Offsettemperatur | L019:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 229 | NBE 16 Offsettemperatur | L020:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 230 | NBE 17 Offsettemperatur | L021:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 231 | NBE 18 Offsettemperatur | L022:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 232 | NBE 19 Offsettemperatur | L023:PTC | R/W | int16 | *1 | °C | -3 | 3 |  |
| 233 | Haupt NBE Mitteltemperatur (Büro) | L024:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 234 | NBE 1 Mitteltemperatur (Diele) | L025:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 235 | NBE 2 Mitteltemperatur (Schlafen) | L026:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 236 | NBE 3 Mitteltemperatur —— | L027:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 237 | NBE 4 Mitteltemperatur (Kreativ) | L028:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 238 | NBE 5 Mitteltemperatur | L029:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 239 | NBE 6 Mitteltemperatur | L030:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 240 | NBE 7 Mitteltemperatur | L031:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 241 | NBE 8 Mitteltemperatur | L032:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 242 | NBE 9 Mitteltemperatur | L033:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 243 | NBE 10 Mitteltemperatur | L034:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 244 | NBE 11 Mitteltemperatur | L035:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 245 | NBE 12 Mitteltemperatur | L036:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 246 | NBE 13 Mitteltemperatur | L037:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 247 | NBE 14 Mitteltemperatur | L038:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 248 | NBE 15 Mitteltemperatur | L039:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 249 | NBE 16 Mitteltemperatur | L040:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 250 | NBE 17 Mitteltemperatur | L041:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 251 | NBE 18 Mitteltemperatur | L042:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 252 | NBE 19 Mitteltemperatur | L043:PTC | R/W | int16 | *1 | °C | 0 | 50 |  |
| 253 | Haupt NBE PTC freigeben / Büro | L044:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 254 | NBE 1 PTC freigeben / Diele | L045:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 255 | NBE 2 PTC freigeben / Schlafen | L046:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 256 | NBE 3 PTC freigeben | L047:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 257 | NBE 4 PTC freigeben  / Kreativ | L048:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 258 | NBE 5 PTC freigeben | L049:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 259 | NBE 6 PTC freigeben | L050:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 260 | NBE 7 PTC freigeben | L051:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 261 | NBE 8 PTC freigeben | L052:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 262 | NBE 9 PTC freigeben | L053:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 263 | NBE 10 PTC freigeben | L054:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 264 | NBE 11 PTC freigeben | L055:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 265 | NBE 12 PTC freigeben | L056:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 266 | NBE 13 PTC freigeben | L057:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 267 | NBE 14 PTC freigeben | L058:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 268 | NBE 15 PTC freigeben | L059:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 269 | NBE 16 PTC freigeben | L060:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 270 | NBE 17 PTC freigeben | L061:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 271 | NBE 18 PTC freigeben | L062:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 272 | NBE 19 PTC freigeben | L063:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 273 | Haupt NBE Taste gesperrt | L064:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 274 | NBE 1 Taste gesperrt | L065:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 275 | NBE 2 Taste gesperrt | L066:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 276 | NBE 3 Taste gesperrt | L067:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 277 | NBE 4 Taste gesperrt | L068:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 278 | NBE 5 Taste gesperrt | L069:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 279 | NBE 6 Taste gesperrt | L070:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 280 | NBE 7 Taste gesperrt | L071:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 281 | NBE 8 Taste gesperrt | L072:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 282 | NBE 9 Taste gesperrt | L073:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 283 | NBE 10 Taste gesperrt | L074:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 284 | NBE 11 Taste gesperrt | L075:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 285 | NBE 12 Taste gesperrt | L076:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 286 | NBE 13 Taste gesperrt | L077:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 287 | NBE 14 Taste gesperrt | L078:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 288 | NBE 15 Taste gesperrt | L079:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 289 | NBE 16 Taste gesperrt | L080:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 290 | NBE 17 Taste gesperrt | L081:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 291 | NBE 18 Taste gesperrt | L082:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 292 | NBE 19 Taste gesperrt | L083:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 293 | Heizmodule 1 Relais 1 Konfiguration | L084:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 294 | Heizmodule 1 Relais 2 Konfiguration | L085:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 295 | Heizmodule 1 Relais 3 Konfiguration | L086:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 296 | Heizmodule 1 Relais 4 Konfiguration | L087:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 297 | Heizmodule 1 Relais 5 Konfiguration | L088:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 298 | Heizmodule 1 Relais 6 Konfiguration | L089:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 299 | Heizmodule 1 Relais 7 Konfiguration | L090:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 300 | Heizmodule 1 Relais 8 Konfiguration | L091:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 301 | Heizmodule 1 Relais 9 Konfiguration | L092:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 302 | Heizmodule 1 Relais 10 Konfiguration | L093:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 303 | Heizmodule 2 Relais 1 Konfiguration | L094:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 304 | Heizmodule 2 Relais 2 Konfiguration | L095:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 305 | Heizmodule 2 Relais 3 Konfiguration | L096:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 306 | Heizmodule 2 Relais 4 Konfiguration | L097:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 307 | Heizmodule 2 Relais 5 Konfiguration | L098:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 308 | Heizmodule 2 Relais 6 Konfiguration | L099:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 309 | Heizmodule 2 Relais 7 Konfiguration | L100:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 310 | Heizmodule 2 Relais 8 Konfiguration | L101:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 311 | Heizmodule 2 Relais 9 Konfiguration | L102:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 312 | Heizmodule 2 Relais 10 Konfiguration | L103:PTC | R/W | uint16 | *1 |  | 0 | 25 |  |
| 313 | Heizmodule 1 E1 Eingang Konfiguration | L104:PTC | R/W | uint16 | *1 |  | 0 | 2 |  |
| 314 | Heizmodule 1 E2 Eingang Konfiguration | L105:PTC | R/W | uint16 | *1 |  | 0 | 2 |  |
| 315 | Heizmodule 2 E1 Eingang Konfiguration | L106:PTC | R/W | uint16 | *1 |  | 0 | 2 |  |
| 316 | Heizmodule 2 E2 Eingang Konfiguration | L107:PTC | R/W | uint16 | *1 |  | 0 | 2 |  |
| 317 | PTC einschalt schwelle | L108:PTC | R/W | int16 | *10 | °C | 0 | 500 |  |
| 318 | PTC ausschalt schwelle | L109:PTC | R/W | int16 | *10 | °C | 0 | 500 |  |
| 319 | Umluft einschalt schwelle | L110:PTC | R/W | int16 | *10 | °C | 0 | 500 |  |
| 320 | Umluft ausschalt schwelle | L111:PTC | R/W | int16 | *10 | °C | 0 | 500 |  |
| 321 | Heizmodul 1 Selbsttest | T10:Test | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 322 | Heizmodul 2 Selbsttest | T11:Test | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 323 | Heizmodul 1 Relaistest | T12:Test | R/W | uint16 | *1 | Binär | 0 | 1023 | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 324 | Heizmodul 2 Relaistest | T13:Test | R/W | uint16 | *1 | Binär | 0 | 1023 | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 325 | GlobalPTCfreigeben | L112:PTC | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 326 | NBE/HNBE/HBDE - PTC an ohne WP modus 1-16 | L113:PTC | R/W | uint16 | *1 | Binär | 0 | 65535 | Bit15:NBE16 Bit14:NBE15 Bit13:NBE14 Bit12:NBE13 Bit11:NBE12 Bit10:NBE11 Bit9:NBE10 Bit8:NBE9 Bit7:NBE8 Bit6:NBE7 Bit5:NBE6 Bit4:NBE5 Bit3:NBE4 Bit2:NBE3 Bit1:NBE2 Bit0:NBE1 |
| 327 | NBE/HNBE/HBDE - PTC an ohne WP modus 17-21 | L114:PTC | R/W | uint16 | *1 | Binär | 0 | 31 | Bit4:HBDE Bit3:HNBE Bit2:NBE19 Bit1:NBE18 Bit0:NBE17 |
| 394 | CO2/RF Sensor 1 Raum | J02:RH/CO2 | R/W | uint16 | *1 |  | 0 | 21 |  |
| 395 | CO2/RF Sensor 2 Raum | J03:RH/CO2 | R/W | uint16 | *1 |  | 0 | 21 |  |
| 396 | CO2/RF Sensor 3 Raum | J04:RH/CO2 | R/W | uint16 | *1 |  | 0 | 21 |  |
| 397 | CO2/RF Sensor 4 Raum | J05:RH/CO2 | R/W | uint16 | *1 |  | 0 | 21 |  |
| 398 | Air m3/h K faktor | C16:Lüftung | R/W | uint16 | *1000 |  | 0 | 65000 |  |
| 399 | Reset Controller | V02:Service | R/W | uint16 | *1 |  | 0 | 1 |  |
| 400 | Reset COP val | V03:Service | R/W | uint16 | *1 |  | 0 | 1 |  |
| 401 | Sprache | Q1:Bedieneinheit | R/W | uint16 | *1 |  | 0 | 1 |  |
| 402 | Hauptbedienschirm-Timeout | Q2:Bedieneinheit | R/W | uint16 | *1 | Minuten | 1 | 600 |  |
| 404 | Zum Hauptschirm Timeout | Q6:Bedieneinheit | R/W | uint16 | *1 | Sekunden | 10 | 600 |  |
| 405 | CommTWWEnable | A13:Haupt Menu | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 422 | Modbuss Adresse | V12:Service | R/W | uint16 | *1 |  | 1 | 247 |  |
| 423 | Modbus Baudrate (0=9600 , 1 = 19200) | V13:Service | R/W | uint16 | *1 |  | 0 | 1 |  |
| 424 | Modbus Paritet (0 = NONE, 1 = EVEN, 2 = ODD) | V14:Service | R/W | uint16 | *1 |  | 0 | 2 |  |
| 438 | Modbus schreiben erlaubt (0=Nein, 1=Einige,  2=Ja) | V11:Service | R/W | uint16 | *1 |  | 0 | 55555 | Auf 55555 setzen für volle schreibrechte |
| 448 | Password | V10:Service | R/W | uint16 | *1 |  | 0 | 9999 |  |
| 449 | Sollwert-Sicherung wiederherstellen (1=Speichern, 2=Laden,3=Werkseinstellung) | V04:Service | R/W | uint16 | *1 |  | 0 | 3 |  |
| 450 | Sommerzeit Aktivieren | P1:Datum & Uhrzeit | R/W | uint16 | *1 |  | 0 | 1 |  |
| 451 | Minuten | P2:Datum & Uhrzeit | R/W | uint16 | *1 |  | 0 | 59 |  |
| 452 | Stunden | P3:Datum & Uhrzeit | R/W | uint16 | *1 |  | 0 | 23 |  |
| 453 | Tag | P4:Datum & Uhrzeit | R/W | uint16 | *1 |  | 1 | 7 |  |
| 454 | Datum | P5:Datum & Uhrzeit | R/W | uint16 | *1 |  | 1 | 31 |  |
| 455 | Monat | P6:Datum & Uhrzeit | R/W | uint16 | *1 |  | 1 | 12 |  |
| 456 | Jahr | P7:Datum & Uhrzeit | R/W | uint16 | *1 |  | 0 | 99 |  |
| 457 | Event log löschen | V01:Service | R/W | uint16 | *1 |  | 0 | 1 |  |
| 458 | T2.1-Offset (HBDE) | Q3:Bedieneinheit | R/W | int16 | *100 |  | -500 | 500 |  |
| 459 | T2.1 intern zu extern Compensation (HBDE) | Q4:Bedieneinheit | R/W | int16 | *10 |  | 0 | 150 |  |
| 460 | Gerätefilter standzeit | V05:Service | R/W | uint16 | *1 | Monate | 3 | 8 |  |
| 461 | Umluftfilter standzeit | V06:Service | R/W | uint16 | *1 | Stunde | 50 | 900 |  |
| 462 | Umluftfilter vorhanden | V07:Service | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 463 | GatewayReturnTimeout | Q5:Bedieneinheit | R/W | uint16 | *1 | Sekunden | 5 | 120 |  |
| 464 | Störung zurücksetzen | V08:Service | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 465 | Geräte Neustart | V09:Service | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 466 | CO2/RF Sensor 5 Raum | J06:RH/CO2 | R/W | uint16 | *1 |  | 0 | 21 |  |
| 467 | Stunden FWT AN | S01:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 468 | Stunden Umluftfilter | S02:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 469 | Stunden Gerätefilter | S03:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 470 | Stunden Vorwärme AN | S04:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 471 | Stunden Umluft AN | S05:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 472 | Stunden FU AN | S06:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 473 | Stunden Kompressor Kühlen | S07:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 474 | Stunden Kompressor Heizen | S08:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 475 | Stunden Abtau AN | S09:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 476 | Stunden Ventilatoren Stufe 1 | S10:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 477 | Stunden Ventilatoren Stufe2 | S11:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 478 | Stunden Ventilatoren Stufe 3 | S12:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 479 | Stunden Ventilatoren Stufe 4 | S13:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 487 | Stunden PTC Heizmodul 1 Relais 1 An | S14:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 488 | Stunden PTC Heizmodul 1 Relais 2 An | S15:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 489 | Stunden PTC Heizmodul 1 Relais 3 An | S16:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 490 | Stunden PTC Heizmodul 1 Relais 4 An | S17:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 491 | Stunden PTC Heizmodul 1 Relais 5 An | S18:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 492 | Stunden PTC Heizmodul 1 Relais 6 An | S19:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 493 | Stunden PTC Heizmodul 1 Relais 7 An | S20:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 494 | Stunden PTC Heizmodul 1 Relais 8 An | S21:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 495 | Stunden PTC Heizmodul 1 Relais 9 An | S22:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 496 | Stunden PTC Heizmodul 1 Relais 10 An | S23:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 497 | Stunden PTC Heizmodul 2 Relais 1 An | S24:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 498 | Stunden PTC Heizmodul 2 Relais 2 An | S25:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 499 | Stunden PTC Heizmodul 2 Relais 3 An | S26:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 500 | Stunden PTC Heizmodul 2 Relais 4 An | S27:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 501 | Stunden PTC Heizmodul 2 Relais 5 An | S28:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 502 | Stunden PTC Heizmodul 2 Relais 6 An | S29:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 503 | Stunden PTC Heizmodul 2 Relais 7 An | S30:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 504 | Stunden PTC Heizmodul 2 Relais 8 An | S31:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 505 | Stunden PTC Heizmodul 2 Relais 9 An | S32:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 506 | Stunden PTC Heizmodul 2 Relais 10 An | S33:Stundenzähler | R/W | uint16 | *1 |  | 0 | 65535 |  |
| 507 | Zeitprogramm für alle Tage übernehmen (1=Montag, 2=Dienstag,,,, 7=Sonntag) | ZL002:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 7 |  |
| 508 | Montag #1 Zeit Stunden An | ZL003:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 509 | Montag #1 Zeit Minuten An | ZL004:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 510 | Montag #1 Zeit Stunden Aus | ZL005:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 511 | Montag #1 Zeit Minuten Aus | ZL006:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 512 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL007:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 513 | Montag #2 Zeit Stunden An | ZL008:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 514 | Montag #2 Zeit Minuten An | ZL009:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 515 | Montag #2 Zeit Stunden Aus | ZL010:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 516 | Montag #2 Zeit Minuten Aus | ZL011:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 517 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL012:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 518 | Montag #3 Zeit Stunden An | ZL013:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 519 | Montag #3Zeit Minuten An | ZL014:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 520 | Montag #3 Zeit Stunden Aus | ZL015:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 521 | Montag #3 Zeit Minuten Aus | ZL016:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 522 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL017:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 523 | Dienstag #1 Zeit Stunden An | ZL018:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 524 | Dienstag #1 Zeit Minuten An | ZL019:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 525 | Dienstag #1 Zeit Stunden Aus | ZL020:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 526 | Dienstag #1 Zeit Minuten Aus | ZL021:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 527 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL022:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 528 | Dienstag #2 Zeit Stunden An | ZL023:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 529 | Dienstag #2 Zeit Minuten An | ZL024:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 530 | Dienstag #2 Zeit Stunden Aus | ZL025:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 531 | Dienstag #2 Zeit Minuten Aus | ZL026:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 532 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL027:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 533 | Dienstag #3 Zeit Stunden An | ZL028:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 534 | Dienstag #3Zeit Minuten An | ZL029:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 535 | Dienstag #3 Zeit Stunden Aus | ZL030:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 536 | Dienstag #3 Zeit Minuten Aus | ZL031:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 537 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL032:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 538 | Mittwoch #1 Zeit Stunden An | ZL033:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 539 | Mittwoch #1 Zeit Minuten An | ZL034:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 540 | Mittwoch #1 Zeit Stunden Aus | ZL035:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 541 | Mittwoch #1 Zeit Minuten Aus | ZL036:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 542 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL037:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 543 | Mittwoch #2 Zeit Stunden An | ZL038:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 544 | Mittwoch #2 Zeit Minuten An | ZL039:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 545 | Mittwoch #2 Zeit Stunden Aus | ZL040:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 546 | Mittwoch #2 Zeit Minuten Aus | ZL041:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 547 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL042:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 548 | Mittwoch #3 Zeit Stunden An | ZL043:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 549 | Mittwoch #3Zeit Minuten An | ZL044:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 550 | Mittwoch #3 Zeit Stunden Aus | ZL045:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 551 | Mittwoch #3 Zeit Minuten Aus | ZL046:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 552 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL047:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 553 | Donnerstag #1 Zeit Stunden An | ZL048:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 554 | Donnerstag #1 Zeit Minuten An | ZL049:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 555 | Donnerstag #1 Zeit Stunden Aus | ZL050:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 556 | Donnerstag #1 Zeit Minuten Aus | ZL051:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 557 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL052:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 558 | Donnerstag #2 Zeit Stunden An | ZL053:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 559 | Donnerstag #2 Zeit Minuten An | ZL054:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 560 | Donnerstag #2 Zeit Stunden Aus | ZL055:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 561 | Donnerstag #2 Zeit Minuten Aus | ZL056:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 562 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL057:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 563 | Donnerstag #3 Zeit Stunden An | ZL058:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 564 | Donnerstag #3Zeit Minuten An | ZL059:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 565 | Donnerstag #3 Zeit Stunden Aus | ZL060:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 566 | Donnerstag #3 Zeit Minuten Aus | ZL061:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 567 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL062:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 568 | Freitag #1 Zeit Stunden An | ZL063:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 569 | Freitag #1 Zeit Minuten An | ZL064:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 570 | Freitag #1 Zeit Stunden Aus | ZL065:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 571 | Freitag #1 Zeit Minuten Aus | ZL066:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 572 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL067:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 573 | Freitag #2 Zeit Stunden An | ZL068:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 574 | Freitag #2 Zeit Minuten An | ZL069:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 575 | Freitag #2 Zeit Stunden Aus | ZL070:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 576 | Freitag #2 Zeit Minuten Aus | ZL071:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 577 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL072:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 578 | Freitag #3 Zeit Stunden An | ZL073:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 579 | Freitag #3Zeit Minuten An | ZL074:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 580 | Freitag #3 Zeit Stunden Aus | ZL075:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 581 | Freitag #3 Zeit Minuten Aus | ZL076:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 582 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL077:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 583 | Samstag #1 Zeit Stunden An | ZL078:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 584 | Samstag #1 Zeit Minuten An | ZL079:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 585 | Samstag #1 Zeit Stunden Aus | ZL080:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 586 | Samstag #1 Zeit Minuten Aus | ZL081:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 587 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL082:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 588 | Samstag #2 Zeit Stunden An | ZL083:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 589 | Samstag #2 Zeit Minuten An | ZL084:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 590 | Samstag #2 Zeit Stunden Aus | ZL085:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 591 | Samstag #2 Zeit Minuten Aus | ZL086:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 592 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL087:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 593 | Samstag #3 Zeit Stunden An | ZL088:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 594 | Samstag #3Zeit Minuten An | ZL089:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 595 | Samstag #3 Zeit Stunden Aus | ZL090:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 596 | Samstag #3 Zeit Minuten Aus | ZL091:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 597 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL092:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 598 | Sonntag #1 Zeit Stunden An | ZL093:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 599 | Sonntag #1 Zeit Minuten An | ZL094:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 600 | Sonntag #1 Zeit Stunden Aus | ZL095:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 601 | Sonntag #1 Zeit Minuten Aus | ZL096:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 602 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL097:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 603 | Sonntag #2 Zeit Stunden An | ZL098:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 604 | Sonntag #2 Zeit Minuten An | ZL099:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 605 | Sonntag #2 Zeit Stunden Aus | ZL100:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 606 | Sonntag #2 Zeit Minuten Aus | ZL101:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 607 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL102:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 608 | Sonntag #3 Zeit Stunden An | ZL103:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 609 | Sonntag #3Zeit Minuten An | ZL104:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 610 | Sonntag #3 Zeit Stunden Aus | ZL105:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 23 |  |
| 611 | Sonntag #3 Zeit Minuten Aus | ZL106:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 59 |  |
| 612 | Luftmenge (0=Keine aktion ,1=Stufe 1, 2=Stufe 2, 3=Stufe 3, 4=Stufe 4) | ZL107:Zeitprogramm Luftmenge | R/W | uint16 | *1 |  | 0 | 4 |  |
| 613 | Zeitprogramm An/Aus | ZL001:Zeitprogramm Luftmenge | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 614 | Nachtabsenkung Zeit Studen An | ZN2:Zeitprogramm Nachtabsenkung | R/W | uint16 | *1 |  | 0 | 23 |  |
| 615 | Nachtabsenkung Zeit Minuten An | ZN3:Zeitprogramm Nachtabsenkung | R/W | uint16 | *1 |  | 0 | 59 |  |
| 616 | Nachtabsenkung Zeit Studen Aus | ZN4:Zeitprogramm Nachtabsenkung | R/W | uint16 | *1 |  | 0 | 23 |  |
| 617 | Nachtabsenkung Zeit Minuten Aus | ZN5:Zeitprogramm Nachtabsenkung | R/W | uint16 | *1 |  | 0 | 59 |  |
| 618 | Nachttemperatur | ZN6:Zeitprogramm Nachtabsenkung | R/W | int16 | *100 | °C | 1000 | 3000 |  |
| 619 | Nachtabsenkung An/Aus | ZN1:Zeitprogramm Nachtabsenkung | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |

### T300 Holding Register (Adressen 2000+)

| Addr | Parameter | Gruppe | R/W | Typ | Format | Einheit | Min | Max | Kommentar |
|-----:|-----------|--------|:---:|-----|:------:|---------|----:|----:|-----------|
| 2000 | Normal Wassertemperatur | B:Haubt Menü | R/W | uint16 | *10 | °C | 200 | 550 |  |
| 2001 | E-heiz AUS-AN (0-1) | C:Haubt Menü | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 2002 | Betriebsart (0=AUS 1=Bedarf 2=LF1 3=LF2 | A:Haubt Menü | R/W | uint16 | *1 |  | 0 | 3 |  |
| 2003 | Temperatur E-Heiz | D-01:Einstellung Menü | R/W | uint16 | *10 | °C | 200 | 700 |  |
| 2006 | Sprache | D-02:Einstellung Menü | R/W | uint16 | *1 |  | 0 | 0 |  |
| 2008 | Sommerzeit 0=deaktivirt  1=aktivirt | C-07:Zeit/Datum Menü | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 2009 | PauseSchirmZeit 0=Aus | D-03:Einstellung Menü | R/W | uint16 | *1 | AUS/AN | 0 | 240 |  |
| 2010 | PV funktio | D-05:Einstellung Menü | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 2025 | Legionellafunktio | D-04:Einstellung Menü | R/W | uint16 | *1 | AUS/AN | 0 | 1 |  |
| 2150 | Stunde | C-01:Zeit/Datum Menü | R/W | uint16 | *1 | Stunde | 0 | 23 |  |
| 2151 | Minute | C-02:Zeit/Datum Menü | R/W | uint16 | *1 | Minuten | 0 | 59 |  |
| 2152 | Wochentag | C-03:Zeit/Datum Menü | R/W | uint16 | *1 |  | 1 | 7 |  |
| 2153 | Tag | C-04:Zeit/Datum Menü | R/W | uint16 | *1 |  | 1 | 31 |  |
| 2154 | Monat | C-05:Zeit/Datum Menü | R/W | uint16 | *1 | Monate | 1 | 12 |  |
| 2155 | Jahr | C-06:Zeit/Datum Menü | R/W | uint16 | *1 |  | 0 | 99 |  |

---

## Input Register (FC4, read-only)

| Addr | Parameter | Typ | Format | Einheit | Kommentar |
|-----:|-----------|-----|:------:|---------|-----------|
| 0 | Akt.Drehzahl ZuLuftventilator | int16 | *1 | rpm |  |
| 1 | Akt.Drehzahl AbLuftventilator | int16 | *1 | rpm |  |
| 2 | Akt. CO2-Wert von Sensor 5 | int16 | *1 | ppm |  |
| 3 | PTC Kühlen Freigabe | int16 | *1 |  |  |
| 4 | Nacht Temp Bei Zeitprogramm | uint16 | *100 | °C |  |
| 5 | FirmwareVersionHaupptPlatine | int16 | *10 |  |  |
| 6 | Akt. CO2-Wert von Sensor 4 | int16 | *1 | ppm |  |
| 7 | Akt. RF-Wert von Sensor 4 | int16 | *1 | % |  |
| 8 | RelaisStatusHauptPlatine | int16 | *1 | Binär |  |
| 9 | Akt. RF-Wert von Sensor 5 | int16 | *1 | % |  |
| 10 | ES997Stufe | int16 | *1 |  |  |
| 11 | SollZone2 | uint16 | *100 |  |  |
| 12 | ADSusaetTemp | int16 | *1 |  |  |
| 13 | ADAusenTemp | int16 | *1 |  |  |
| 14 | ClockHour | int16 | *1 |  |  |
| 15 | ClockMin | int16 | *1 |  |  |
| 16 | ClockDay | int16 | *1 |  |  |
| 17 | ClockDate | int16 | *1 |  |  |
| 18 | ClockMonth | int16 | *1 |  |  |
| 19 | PowerPCB | int16 | *10 |  |  |
| 20 | PowerFU | int16 | *10 |  |  |
| 21 | Akt. CO2-Wert von Sensor 1 | int16 | *1 | ppm |  |
| 22 | Akt. RF-Wert von Sensor 1 | int16 | *1 | % |  |
| 23 | Akt. Betriebsart | int16 | *1 |  |  |
| 24 | P18 Druckventilator | int16 | *10 | Pa |  |
| 25 | Power Total | int16 | *10 |  |  |
| 26 | Air m3/h | int16 | *10 |  |  |
| 27 | JAZ KOMP 1min | int16 | *100 |  |  |
| 28 | JAZ KOMP  1 stunde | int16 | *100 |  |  |
| 29 | JAZ KOMP  24 stunde | int16 | *100 |  |  |
| 30 | JAZ KOMP  365 tage | int16 | *100 |  |  |
| 31 | JAZ KOMP  days | int16 | *1 |  |  |
| 32 | JAZ Total 1min | int16 | *100 |  |  |
| 33 | JAZ Total  1 stunde | int16 | *100 |  |  |
| 34 | JAZ Total  24 stunde | int16 | *100 |  |  |
| 35 | JAZ Total  365 tage | int16 | *100 |  |  |
| 36 | JAZ Total  days | int16 | *1 |  |  |
| 37 | HP_NMT_State | int16 | *1 |  |  |
| 38 | StufeBeiZeitPrg | int16 | *1 |  |  |
| 39 | UmluftAktive | int16 | *1 |  |  |
| 40 | Temperatur an HNBE | uint16 | *100 | °C |  |
| 41 | Temperatur an HBDE | uint16 | *100 | °C |  |
| 42 | TempHBDEintern | uint16 | *100 |  |  |
| 43 | Akt. CO2-Wert von Sensor 2 | int16 | *1 | ppm |  |
| 44 | Akt. RF-Wert von Sensor 2 | int16 | *1 | % |  |
| 45 | Akt. CO2-Wert von Sensor 3 | int16 | *1 | ppm |  |
| 46 | Akt. RF-Wert von Sensor 3 | int16 | *1 | % |  |
| 47 | Stoerung | int16 | *1 |  |  |
| 48 | ErrorStatus1 | int16 | *1 |  |  |
| 49 | ErrorStatus2 | int16 | *1 |  |  |
| 50 | ErrorStatus3 | int16 | *1 |  |  |
| 51 | ErrorStatus4 | int16 | *1 |  |  |
| 150 | FirmwareVersionNebenPlatine | int16 | *10 |  |  |
| 151 | WpRelaisStatus | int16 | *1 | Binär |  |
| 152 | StatusVentilatoren | int16 | *1 |  |  |
| 153 | VentilatorFehlerRestZeit | int16 | *1 | Sekunden |  |
| 154 | Akt.Ventilator Stufe Zuluft | int16 | *1 |  |  |
| 155 | Akt.Ventilator Spannung ZuLuft | int16 | *100 | Volt |  |
| 156 | Akt.Ventilator Spannung AbLuft | int16 | *100 | Volt |  |
| 157 | ErrorFlagsNebenPlatine | int16 | *1 | Binär |  |
| 158 | BypassRestHaltezeit | int16 | *1 | Sekunden |  |
| 159 | Schieber Position | int16 | *1 |  |  |
| 160 | SchieberRestHaltezeit | int16 | *10 | Sekunden |  |
| 161 | SchieberVerfahrauftrag | int16 | *10 | Sekunden |  |
| 162 | Status Kompressor | int16 | *1 |  |  |
| 163 | WpTimerSchonzeit | int16 | *1 | Sekunden |  |
| 164 | WpTimerMindestlaufzeit | int16 | *1 | Sekunden |  |
| 165 | WpAbtauTimer | int16 | *1 | Minuten |  |
| 166 | WpTimerAbtauNachlauf | int16 | *1 | Sekunden |  |
| 167 | P19 Druckdiff. Abtau | int16 | *100 | Pa |  |
| 168 | WpTimerEntlastung | int16 | *1 | Sekunden |  |
| 169 | WpMinAbtauIntervallTimer | int16 | *100 | Minuten |  |
| 170 | FU_ErrorCode | int16 | *1 |  |  |
| 171 | Akt.Leistung: Kompressor | int16 | *100 | % |  |
| 172 | FU_ErrorCode2 | int16 | *1 |  |  |
| 173 | Delta Sauggas Kondensator Temp | uint16 | *100 | °C |  |
| 174 | FU_FatalFOFerror | int16 | *1 |  |  |
| 175 | T5 VorVerdampfer | uint16 | *100 | °C |  |
| 176 | T6 Verdampfer | uint16 | *100 | °C |  |
| 177 | T8 Nach Vorwärme | uint16 | *100 | °C |  |
| 178 | T12 Vor Kondensator | uint16 | *100 | °C |  |
| 179 | T10 Kondensator | uint16 | *100 | °C |  |
| 180 | T13 Kompressor | uint16 | *100 | °C |  |
| 181 | T9 T_AUL_vor_EWT | uint16 | *100 | °C |  |
| 182 | WpAbtauSchwelleCounter | int16 | *1 | Sekunden |  |
| 183 | LsControlFU_Status | int16 | *1 |  |  |
| 184 | LsControlFUErrorInput | int16 | *1 | AUS/AN |  |
| 185 | FuResetTimeCounter | int16 | *1 | Sekunden |  |
| 186 | FuFehlerVerz | int16 | *1 | Sekunden |  |
| 187 | FuErrorCounter | int16 | *1 |  |  |
| 188 | LsControlHighTime | int16 | *100 | Sekunden |  |
| 189 | LsControlPulsbreite | int16 | *100 | Sekunden |  |
| 190 | Akt.Drehzahl: Kompressor | int16 | *1 | ppm |  |
| 191 | TempZusatz1 | uint16 | *100 | °C |  |
| 192 | ZuluftSollZone1 | uint16 | *100 | °C |  |
| 193 | TempZusatz2 | uint16 | *100 | °C |  |
| 194 | ZuluftSollZone2 | uint16 | *100 | °C |  |
| 195 | T1 Zuluft | uint16 | *100 | °C |  |
| 196 | T7 Abluft | uint16 | *100 | °C |  |
| 197 | T4 Fortluft | uint16 | *100 | °C |  |
| 198 | T3 Frischluft | uint16 | *100 | °C |  |
| 199 | TcAnforderungLuft | int16 | *100 | % |  |
| 200 | ConWpStopTimer | int16 | *1 | Sekunden |  |
| 201 | Akt. Max.Leistung Kompressor | int16 | *100 | % |  |
| 202 | Delta Sauggas Verdampfer Temp | uint16 | *100 | °C |  |
| 203 | E-Ventil Kühlung Position | int16 | *1 |  |  |
| 204 | E-Ventil Heizung Position | int16 | *1 |  |  |
| 205 | E-Ventil Vorwärme Position | int16 | *1 |  |  |
| 206 | P14 ND. Verdampfer | int16 | *1000 | bar |  |
| 207 | T14 Sauggas nach Kondensator | uint16 | *100 | °C |  |
| 208 | T11 Sauggas nach Verdampfer | uint16 | *100 | °C |  |
| 209 | AbtauDruck | int16 | *100 | Pa |  |
| 210 | EinAusStatus | int16 | *1 | Binär |  |
| 211 | Akt.Ventilator Stufe Abluft | int16 | *1 |  |  |
| 212 | SchieberBerechnungRestZeit | int16 | *1 | Sekunden |  |
| 213 | FU_ModbusErrorCnt | int16 | *1 |  |  |
| 214 | WpTimerAuslauf | int16 | *1 | Sekunden |  |
| 215 | RestWpZusatzAbtauVerzZeit | int16 | *1 | Sekunden |  |
| 216 | Verdampfertemperatur (Druck) | uint16 | *100 | °C |  |
| 217 | FuInitTimeCounter | int16 | *100 | Sekunden |  |
| 218 | WpMaxR407_DruckZuTemp | uint16 | *100 | °C |  |
| 219 | StufeCtrlBy | int16 | *1 |  |  |
| 220 | Erdwärme Zustand | int16 | *1 | AUS/AN |  |
| 221 | Zustand Magnetventil AUS/AN | int16 | *1 | AUS/AN |  |
| 222 | Zustand Bypass | int16 | *1 | AUS/AN |  |
| 223 | Zustand 4-Wegeventil Heizen/Kühlen | int16 | *1 | AUS/AN |  |
| 224 | VorwärmeVentilZustand | int16 | *1 | AUS/AN |  |
| 225 | FuLeistungModbus | int16 | *1 | % |  |
| 226 | FU_PIC_ControllerVersion | int16 | *1 |  |  |
| 227 | FU_PIC_ControllerSubVersion | int16 | *1 |  |  |
| 228 | FU_ModbusVersion | int16 | *1 |  |  |
| 229 | FU_ModbusSubVersion | int16 | *1 |  |  |
| 230 | FU_IR_MCEsoftwareVersion | int16 | *1 |  |  |
| 231 | FU_IR_LSCsoftwareVersion | int16 | *1 |  |  |
| 232 | FU_IR_LSCsoftwareSubVersion | int16 | *1 |  |  |
| 233 | FU_TemperaturePowermodule | uint16 | *1 | °C |  |
| 234 | FU_TemperatureCabinet | uint16 | *1 | °C |  |
| 235 | NoPacketReceived | int16 | *1 |  |  |
| 236 | LockoutReceive | int16 | *1 |  |  |
| 237 | PacketError | int16 | *1 |  |  |
| 238 | RegLuftStufeZuluft | int16 | *1 |  |  |
| 239 | RegLuftStufeAbluft | int16 | *1 |  |  |
| 240 | StepStatePreH | int16 | *1 |  |  |
| 241 | Akt_WP_Betriebsart | int16 | *1 |  |  |
| 242 | StepSetpointPosPreH | int16 | *1 |  |  |
| 243 | StepStateCool | int16 | *1 |  |  |
| 244 | Soll Überhitzung | uint16 | *100 | °C |  |
| 245 | StepSetpointPosCool | int16 | *1 |  |  |
| 246 | Debug3 | int16 | *1 |  |  |
| 247 | StepSetpointPosHeat | int16 | *1 |  |  |
| 248 | StepStateHeat | int16 | *1 |  |  |
| 249 | Delta Soll T8 - Akt.T8 | uint16 | *100 | °C |  |
| 250 | FU_MotorCurrent | uint16 | *100 | Ampere |  |
| 251 | SollZonenTemperatur2 | uint16 | *100 | °C |  |
| 252 | Akt. Min. Überhitzung | uint16 | *100 | °C |  |
| 253 | Akt. Max. Überhitzung | uint16 | *100 | °C |  |
| 254 | FU Motor Strom | int16 | *100 | Ampere |  |
| 255 | Regel Freigabe Restzeit Nach Abtau | int16 | *1 | Sekunden |  |
| 256 | NachAbtauLeistungRestoreValue | int16 | *100 | % |  |
| 257 | NachAbtauSuperheatRestoreValue | uint16 | *100 | °C |  |
| 258 | FuMaxRpmUpdatatet_fl | int16 | *1 | AUS/AN |  |
| 259 | FuMaxRpmSet | int16 | *1 | ppm |  |
| 260 | NachAbtauMaxSuperHeat | uint16 | *100 | °C |  |
| 261 | EventilStartPosTimeLeft | int16 | *1 |  |  |
| 262 | CurrentES997Betriebsart | int16 | *1 |  |  |
| 263 | T2.1 ZonenTemperatur1 | uint16 | *100 | °C |  |
| 264 | T2.2 ZonenTemperatur2 | uint16 | *100 | °C |  |
| 265 | SollZonenTemperatur1 | uint16 | *100 | °C |  |
| 266 | ModbusSlaveNoGoodData100msCnt | int16 | *1 |  |  |
| 267 | FUmodbusErrorRestartCnt | int16 | *1 |  |  |
| 268 | FUmodbusError1secCnt | int16 | *1 |  |  |
| 269 | AdcAbtauPressure | int16 | *1 |  |  |
| 450 | Adc5voltRef | int16 | *1 |  |  |
| 451 | AdcR407CPressure | int16 | *1 |  |  |
| 452 | AdcPT1000T32 | int16 | *1 |  |  |
| 453 | AdcPT1000T30 | int16 | *1 |  |  |
| 454 | AdcNtcT1 | int16 | *1 |  |  |
| 455 | AdcNtcT7 | int16 | *1 |  |  |
| 456 | AdcNtcT10 | int16 | *1 |  |  |
| 457 | AdcNtcT12 | int16 | *1 |  |  |
| 458 | AdcNtcT13 | int16 | *1 |  |  |
| 459 | AdcNtcT41 | int16 | *1 |  |  |
| 460 | AdcNtcT3 | int16 | *1 |  |  |
| 461 | AdcNtcT4 | int16 | *1 |  |  |
| 462 | AdcNtcT5 | int16 | *1 |  |  |
| 463 | AdcNtcT6 | int16 | *1 |  |  |
| 464 | AdcNtcT8 | int16 | *1 |  |  |
| 465 | AdcNtcT42 | int16 | *1 |  |  |
| 570 | Heizmodul 1 Selbsttest-Ergebnis | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 571 | Heizmodul 1 Status | int16 | *1 |  |  |
| 572 | Heizmodul 1 Inputs | int16 | *1 | Binär | Bit1:E2 Bit0:E1 |
| 573 | Heizmodul 1 Temperatur | int16 | *1 | °C |  |
| 574 | Heizmodul 1 Relais Status | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 575 | Heizmodul 1 RelaysUsedStatus | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 576 | Heizmodul 1 RelayTestStatus | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 577 | Heizmodul 1 Adress | int16 | *1 |  |  |
| 578 | Heizmodul 1 Model | int16 | *1 |  |  |
| 579 | Heizmodul 2 Selbsttest-Ergebnis | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 580 | Heizmodul 2 Status | int16 | *1 |  |  |
| 581 | Heizmodul 2 Inputs | int16 | *1 | Binär | Bit1:E2 Bit0:E1 |
| 582 | Heizmodul 2 Temperatur | int16 | *1 | °C |  |
| 583 | Heizmodul 2 Relais Status | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 584 | Heizmodul 2 RelaysUsedStatus | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 585 | Heizmodul 2 RelayTestStatus | int16 | *1 | Binär | Bit9:R10 Bit8:R9 Bit7:R8 Bit6:R7 Bit5:R6 Bit4:R5 Bit3:R4 Bit2:R3 Bit1:R2 Bit0:R1 |
| 586 | Heizmodul 2 Adress | int16 | *1 |  |  |
| 587 | Heizmodul 2 Model | int16 | *1 |  |  |
| 588 | HNBE Status | int16 | *1 |  |  |
| 589 | HNBE LEDsetpointlevel | int16 | *1 |  |  |
| 590 | Temperatur Haupt Nebenbedienteil | int16 | *10 | °C |  |
| 591 | NBE1 Status | int16 | *1 |  |  |
| 592 | NBE1 LEDsetpointlevel | int16 | *1 |  |  |
| 593 | Temperatur Nebenbedienteil 1 | int16 | *10 | °C |  |
| 594 | NBE2 Status | int16 | *1 |  |  |
| 595 | NBE2 LEDsetpointlevel | int16 | *1 |  |  |
| 596 | Temperatur Nebenbedienteil 2 | int16 | *10 | °C |  |
| 597 | NBE3 Status | int16 | *1 |  |  |
| 598 | NBE3 LEDsetpointlevel | int16 | *1 |  |  |
| 599 | Temperatur Nebenbedienteil 3 | int16 | *10 | °C |  |
| 600 | NBE4 Status | int16 | *1 |  |  |
| 601 | NBE4 LEDsetpointlevel | int16 | *1 |  |  |
| 602 | Temperatur Nebenbedienteil 4 | int16 | *10 | °C |  |
| 603 | NBE5 Status | int16 | *1 |  |  |
| 604 | NBE5 LEDsetpointlevel | int16 | *1 |  |  |
| 605 | Temperatur Nebenbedienteil 5 | int16 | *10 | °C |  |
| 606 | NBE6 Status | int16 | *1 |  |  |
| 607 | NBE6 LEDsetpointlevel | int16 | *1 |  |  |
| 608 | Temperatur Nebenbedienteil 6 | int16 | *10 | °C |  |
| 609 | NBE7 Status | int16 | *1 |  |  |
| 610 | NBE7 LEDsetpointlevel | int16 | *1 |  |  |
| 611 | Temperatur Nebenbedienteil 7 | int16 | *10 | °C |  |
| 612 | NBE8 Status | int16 | *1 |  |  |
| 613 | NBE8 LEDsetpointlevel | int16 | *1 |  |  |
| 614 | Temperatur Nebenbedienteil 8 | int16 | *10 | °C |  |
| 615 | NBE9 Status | int16 | *1 |  |  |
| 616 | NBE9 LEDsetpointlevel | int16 | *1 |  |  |
| 617 | Temperatur Nebenbedienteil 9 | int16 | *10 | °C |  |
| 618 | NBE10 Status | int16 | *1 |  |  |
| 619 | NBE10 LEDsetpointlevel | int16 | *1 |  |  |
| 620 | Temperatur Nebenbedienteil 10 | int16 | *10 | °C |  |
| 621 | NBE11 Status | int16 | *1 |  |  |
| 622 | NBE11 LEDsetpointlevel | int16 | *1 |  |  |
| 623 | Temperatur Nebenbedienteil 11 | int16 | *10 | °C |  |
| 624 | NBE12 Status | int16 | *1 |  |  |
| 625 | NBE12 LEDsetpointlevel | int16 | *1 |  |  |
| 626 | Temperatur Nebenbedienteil 12 | int16 | *10 | °C |  |
| 627 | NBE13 Status | int16 | *1 |  |  |
| 628 | NBE13 LEDsetpointlevel | int16 | *1 |  |  |
| 629 | Temperatur Nebenbedienteil 13 | int16 | *10 | °C |  |
| 630 | NBE14 Status | int16 | *1 |  |  |
| 631 | NBE14 LEDsetpointlevel | int16 | *1 |  |  |
| 632 | Temperatur Nebenbedienteil 14 | int16 | *10 | °C |  |
| 633 | NBE15 Status | int16 | *1 |  |  |
| 634 | NBE15 LEDsetpointlevel | int16 | *1 |  |  |
| 635 | Temperatur Nebenbedienteil 15 | int16 | *10 | °C |  |
| 636 | NBE16 Status | int16 | *1 |  |  |
| 637 | NBE16 LEDsetpointlevel | int16 | *1 |  |  |
| 638 | Temperatur Nebenbedienteil 16 | int16 | *10 | °C |  |
| 639 | NBE17 Status | int16 | *1 |  |  |
| 640 | NBE17 LEDsetpointlevel | int16 | *1 |  |  |
| 641 | Temperatur Nebenbedienteil 17 | int16 | *10 | °C |  |
| 642 | NBE18 Status | int16 | *1 |  |  |
| 643 | NBE18 LEDsetpointlevel | int16 | *1 |  |  |
| 644 | Temperatur Nebenbedienteil 18 | int16 | *10 | °C |  |
| 645 | NBE19 Status | int16 | *1 |  |  |
| 646 | NBE19 LEDsetpointlevel | int16 | *1 |  |  |
| 647 | Temperatur Nebenbedienteil 19 | int16 | *10 | °C |  |
| 648 | PTC NBE/HNBE/HBDE Fehler 1 | int16 | *1 |  |  |
| 649 | PTC NBE/HNBE/HBDE Fehler 2 | int16 | *1 |  |  |
| 650 | PTC modul 1 und 2 Fehler | int16 | *1 |  |  |

### T300 Input Register

| Addr | Parameter | Typ | Format | Einheit | Kommentar |
|-----:|-----------|-----|:------:|---------|-----------|
| 800 | ADCvalueCH6 | uint16 | 0 | *1 |  |
| 801 | ADCvalueCH7 | uint16 | 0 | *1 |  |
| 802 | ADCvalueCH8 | uint16 | 0 | *1 |  |
| 803 | ADCvalueCH9 | uint16 | 0 | *1 |  |
| 804 | ADCvalueCH10 | uint16 | 0 | *1 |  |
| 805 | ADCvalueCH11 | uint16 | 0 | *1 |  |
| 806 | ADCvalueCH3 | uint16 | 0 | *1 |  |
| 807 | ADCvalueCH12 | uint16 | 0 | *1 |  |
| 808 | ADCvalueCH15 | uint16 | 0 | *1 |  |
| 809 | ADCvalueCH13 | uint16 | 0 | *1 |  |
| 810 | ADCvalueCH14 | uint16 | 0 | *1 |  |
| 811 | T5 Vor Verdampfer | uint16 | -1000 | *10 | °C |
| 812 | T6 Verdampfer | uint16 | -1000 | *10 | °C |
| 813 | T20 Behälter Unten | uint16 | -1000 | *10 | °C |
| 814 | T21 Behälter Mitte | uint16 | -1000 | *10 | °C |
| 815 | T13 Kompressor | uint16 | -1000 | *10 | °C |
| 816 | T11 Sauggas nach Verdampfer | uint16 | -1000 | *10 | °C |
| 817 | T9 Extern Fühler | uint16 | -1000 | *10 | °C |
| 818 | P14 ND. Verdampfer | uint16 | 0 | *100 | bar |
| 819 | P19 Druckdiff. Abtau | uint16 | 0 | *100 | Pa |
| 820 | E-ventil Posision | uint16 | 0 | *1 |  |
| 821 | StepSetpointPosision | uint16 | 0 | *1 |  |
| 822 | StepMicroStepPos | uint16 | 0 | *1 |  |
| 823 | StepState | uint16 | 0 | *1 |  |
| 824 | R2:Kompressor | uint16 | 0 | *1 | AUS/AN |
| 825 | R3:Solar | uint16 | 0 | *1 | AUS/AN |
| 826 | R4:E-Heiz | uint16 | 0 | *1 | AUS/AN |
| 827 | R5:Ventilator | uint16 | 0 | *1 | AUS/AN |
| 828 | R6:Abtau | uint16 | 0 | *1 | AUS/AN |
| 829 | Verdampfertemperatur (Druck) | uint16 | -1000 | *10 | °C |
| 830 | Delta Sauggas Verdampfer Temp | uint16 | 0 | *10 | °C |
| 831 | Nou_used | uint16 | 0 | *1 |  |
| 832 | HotAirRestrictedCnt | uint16 | 0 | *1 | Sekunden |
| 833 | CompressorState | uint16 | 0 | *1 |  |
| 834 | NotBetrieb | uint16 | 0 | *1 |  |
| 835 | WP_AbtauRestrictedCnt | uint16 | 0 | *1 | Sekunden |
| 836 | WP_StateTimer | uint16 | 0 | *1 | Sekunden |
| 837 | AbtauState | uint16 | 0 | *1 |  |
| 838 | Ventilator Geschwindigkeit | uint16 | 0 | *1 | % |
| 839 | AbtauMaxTimeLeft | uint16 | 0 | *1 | Sekunden |
| 840 | AbtauWaitTime | uint16 | 0 | *1 | Sekunden |
| 841 | KalteBetriebCnt | uint16 | 0 | *1 | Sekunden |
| 842 | RressorstatFehlerCnt | uint16 | 0 | *1 | Sekunden |
| 843 | ModBusErrorDisplayCnt | uint16 | 0 | *1 | Sekunden |
| 844 | VentilatorFehlerCnt | uint16 | 0 | *1 | Sekunden |
| 845 | KompTempFehlerNo4 | uint16 | 0 | *1 | Sekunden |
| 846 | P14DrukFehlerCnt | uint16 | 0 | *1 | Sekunden |
| 847 | HourCntR2LowWord | uint16 | 0 | *1 | Sekunden |
| 848 | HourCntR2HiWord | uint16 | 0 | *1 |  |
| 849 | HourCntR3LowWord | uint16 | 0 | *1 | Sekunden |
| 850 | HourCntR3HiWord | uint16 | 0 | *1 |  |
| 851 | HourCntR4LowWord | uint16 | 0 | *1 | Sekunden |
| 852 | HourCntR4HiWord | uint16 | 0 | *1 |  |
| 853 | HourCntR5LowWord | uint16 | 0 | *1 | Sekunden |
| 854 | HourCntR5HiWord | uint16 | 0 | *1 |  |
| 855 | HourCntR6LowWord | uint16 | 0 | *1 | Sekunden |
| 856 | HourCntR6HiWord | uint16 | 0 | *1 |  |
| 857 | FilterCntLowWord | uint16 | 0 | *1 | Sekunden |
| 858 | FilterCntHiWord | uint16 | 0 | *1 |  |
| 859 | LegionallaCntLowWord | uint16 | 0 | *1 | Sekunden |
| 860 | LegionallaCntHiWord | uint16 | 0 | *1 |  |
| 861 | FehlerList | uint16 | 0 | *1 | Binär |
| 862 | FanRPM | uint16 | 0 | *1 | rpm |
| 863 | ECO_NodeOnOff | uint16 | 0 | *1 | AUS/AN |
| 864 | pid_max_vordamfer_reduktion | uint16 | 0 | *1 |  |
| 865 | MaxTempWP_reduktion | uint16 | 1 | *1 |  |
| 868 | NotEheizFreigabeState | uint16 | 0 | *1 | AUS/AN |
| 869 | P19FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 870 | P14FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 871 | T5_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 872 | T6_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 873 | T20_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 874 | T21_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 875 | T13_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 876 | T11_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 877 | T9_FehlerCnt | uint16 | 0 | *1 | Sekunden |
| 878 | KompMaxTempFehlerCnt | uint16 | 0 | *1 | Sekunden |
| 879 | CurrentSetpoint | uint16 | 0 | *10 | °C |
| 880 | Number_of_restart | uint16 | 0 | *1 |  |
| 881 | Firmware ver | uint16 | 0 | *10 |  |
| 882 | BehaelderAvg | uint16 | 0 | *100 | °C |
| 883 | SuperHeatTemp | uint16 | 0 | *100 | °C |
| 884 | AktMaxSuperHeat | uint16 | 0 | *100 | °C |
| 885 | AktMinSuperHeat | uint16 | 0 | *100 | °C |
| 886 | SuperHeatRef | uint16 | 0 | *100 | °C |
| 887 | EventilStartPosTimeLeft | uint16 | 0 | *1 | Sekunden |
| 888 | RegReleaseAfterAbtauRestTime | uint16 | 0 | *1 | Sekunden |
| 889 | AfterAbtauSuperheatRestoreValue | uint16 | 0 | *1 |  |
| 890 | AfterAbtauMaxSuperHeat | uint16 | 0 | *100 | °C |
| 891 | ADCvalueCH13Avg | uint16 | 0 | *1 |  |
| 892 | AbtauStartTemp | uint16 | -1000 | *10 | °C |
| 896 | Hitze Begrenzung | uint16 | 0 | *1 |  |
| 897 | Kälte Begrenzung | uint16 | 0 | *1 |  |
| 898 | PV T9 level | uint16 | 0 | *1 | % |
| 899 | PV Eheiz AN | uint16 | 0 | *1 | AUS/AN |
| 900 | PV WP AN | uint16 | 0 | *1 | AUS/AN |

---

## Format-Legende

| Format | Realwert | Beispiel |
|:------:|----------|---------|
| `*1` | = Rohwert | 3 → 3 |
| `*10` | = Rohwert ÷ 10 | 235 → 23,5 |
| `*100` | = Rohwert ÷ 100 | 1660 → 16,60 |
| `*1000` | = Rohwert ÷ 1000 | 45000 → 45,0 |
| T300 offset | = (Rohwert − 1000) ÷ 10 | 1561 → 56,1 °C |

## Verbindungsparameter

| Parameter | Wert |
|-----------|------|
| Protokoll | Modbus RTU-over-TCP |
| Host | 10.42.20.2:502 |
| Slave ID | 41 |
| Baudrate | 19200 Bd (Werkseinstellung) |
| Datenbits | 8 |
| Parität | Even |
| Stopbits | 1 |