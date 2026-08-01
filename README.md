# Proxon FWT – Home Assistant Integration

Custom Component für die **Proxon FWT 2.0** Wärmepumpe / Lüftungsanlage und die **T300** Warmwasser-Wärmepumpe.

Verbindung erfolgt lokal über Modbus RTU-over-TCP via USR RS485-to-LAN Adapter.

---

## Unterstützte Geräte

| Gerät | Funktion |
|---|---|
| **Proxon FWT 2.0** | Hauptgerät – Heizen, Kühlen, Lüften |
| **Proxon T300** | Warmwasser-Wärmepumpe (separater Modbus-Slave am gleichen Bus) |
| **NBE / HNBE Raumbediengeräte** | Bis zu 7 Raumtemperatursensoren mit individuellen Offsets |

---

## Funktionen

### Klimasteuerung
- **Zone 1 (Hauptzone)**: Voller Thermostat – Solltemperatur 10–30 °C einstellbar. HVAC-Aktion spiegelt den tatsächlichen Kompressor- und Heizbetrieb wider.
- **Raumbediengeräte (NBE)**: Individueller Temperatur-Offset ±3 °C pro Raum als Climate-Entity. Räume werden beim Einrichten automatisch vom Gerät erkannt.

### Sensoren
- **FWT**: Vor-/Rücklauf-/Außen-/Verdampfertemperaturen (T1–T13), Kompressordrehzahl & -leistung, Lüfterdrehzahlen, Luftvolumenstrom, CO₂, Luftfeuchtigkeit, Stromverbrauch, JAZ/COP, Filterlaufzeit
- **T300**: Speichertemperaturen (oben/mitte/unten), Kompressordaten, Stromverbrauch, COP
- **Raumbediengeräte**: Aktuelle Raumtemperatur je NBE-Gerät

### Steuerung

| Platform | Entities |
|---|---|
| **Select** | FWT Betriebsart (Aus / Eco Sommer / Eco Winter / Komfort) · Bypass Modus (Geregelt / Geschlossen / Geöffnet, deaktiviert) · T300 Betriebsart |
| **Fan** | Lüftungsstufe (4 Stufen: 25 / 50 / 75 / 100 %) |
| **Switch** | Kühlung freigeben · T300 Elektroheizung · T300 Legionellenschutz · T300 PV-Modus · PTC-Freigabe je Raum (deaktiviert) · Zeitprogramm Lüftung · Nachtabsenkung (deaktiviert) |
| **Number** | NBE Temperatur-Offsets je Raum (deaktiviert) · Zone-2-Solltemperatur (deaktiviert) · Intensivlüftung Timer · Nachttemperatur · Bypass Minimum Frischlufttemperatur (G01) · Bypass Hysterese (G02) · Bypass Laufzeit (G03, deaktiviert) · T300 Solltemperatur · T300 Elektroheizungstemperatur |
| **Binary Sensor** | Störung aktiv · Kompressor aktiv · Bypass offen · Filterwechsel fällig · T300 Relais-Zustände |
| **Button** | Filterlaufzeit zurücksetzen |
| **Text** | Raumname je Bediengerät – schreibt direkt in den Gerätespeicher (deaktiviert) |

---

## Installation

### Über HACS (empfohlen)

1. HACS öffnen → **Integrationen** → ⋮ Menü → **Benutzerdefinierte Repositories**
2. `https://github.com/Oponn4/ha-proxon` als **Integration** hinzufügen
3. Nach **Proxon FWT** suchen und installieren
4. Home Assistant neu starten

### Manuell

`custom_components/proxon/` in das Verzeichnis `config/custom_components/` von Home Assistant kopieren und HA neu starten.

---

## Einrichtung

1. **Einstellungen → Geräte & Dienste → Integration hinzufügen**
2. Nach **Proxon FWT** suchen
3. Eingaben:
   - **Host**: IP-Adresse des RS485-to-LAN Adapters
   - **Port**: Modbus TCP Port (Standard: `502`)
   - **Slave ID**: Modbus Slave-Adresse (Standard: `41`)
4. Raumbediengeräte werden nach der Verbindung automatisch erkannt. Um die Erkennung erneut durchzuführen (z. B. nach dem Hinzufügen eines Raums), **Neu konfigurieren** in der Integrationskarte verwenden.

### Optionen

Nach der Einrichtung über **Konfigurieren** anpassbar:
- **Abfrageintervall** (Standard: 30 s) – wie oft die Register abgefragt werden
- **Filterwechsel-Benachrichtigung** – Tage vor fälligem Filterwechsel für eine Persistent Notification

---

## Modbus Details

| Parameter | Wert |
|---|---|
| Protokoll | Modbus RTU-over-TCP |
| Standard Slave ID | 41 |
| RS485 Baudrate | 19200 (Werkseinstellung) |
| Registertypen | Input (3x, read-only) · Holding (4x, lesen/schreiben) |

Die Integration öffnet pro Abfragezyklus eine neue TCP-Verbindung und schließt sie danach wieder. Das hält den Framer-Zustand sauber und verhindert die Ansammlung von veralteten Frames aus dem internen RS485-Bus-Verkehr des Adapters.

### Schreibzugriff

Die Proxon-Einheit erfordert einen Freischaltcode bevor Holding-Register geschrieben werden können. Die Integration schreibt einmalig pro HA-Session den Wert `55555` in Register `438` – um wiederholte Flash-Schreibvorgänge am Gerät zu vermeiden.

---

## Entwicklung

### Tests

```bash
python -m pytest tests/ -q
```

Läuft ohne Home-Assistant-Installation: getestet werden die HA-freien Logikmodule.

### Simulator statt echter Anlage

Damit Schreibpfade nicht an der laufenden Wärmepumpe ausprobiert werden müssen:

```bash
# 1. Registerabzug der echten Anlage — ausschließlich lesend
python tools/dump_registers.py --host 10.42.20.2 --out proxon_dump.json

# 2. Simulator starten (spricht RTU-over-TCP wie der USR-Adapter)
python tools/proxon_sim.py --dump proxon_dump.json --port 5020
```

Danach eine zweite Integrations-Instanz auf `host:5020` einrichten.

Drei Schalter stellen das reale Verhalten nach:

| Option | Wirkung |
|---|---|
| `--latency 0.15` | Antwortzeit pro Registerzugriff — über 15 Blöcke ergibt das den ~3-s-Poll des echten Adapters |
| `--lazy 62:8` | Register übernimmt den Wert erst nach 8 s: ein Poll dazwischen liefert noch den alten Stand |
| `--reject 2001` | Write wird mit Modbus-Exception beantwortet — prüft die Fehlerbehandlung |

Der Abzug enthält die Raumnamen des Geräts und gehört deshalb nicht ins Repository.

---

## Hinweise

- **Betriebsart „Test"** (Modus 9): Nicht verfügbar – ausschließlich für Servicetechniker vorgesehen.
- **Zone 2**: Als `number`-Entity verfügbar (deaktiviert) – nur relevant für Anlagen ohne NBE-Raumbediengeräte.
- **Frischluft-Leistungsbegrenzung** (Sensoren *obere/untere Leistungsgrenze*, deaktiviert): Die WP begrenzt ihre Kompressorleistung temperaturabhängig über eine 2-Punkt-Rampe (Register 95–98) – „ober/unter" bezeichnet dabei das Leistungspaar, nicht die Temperaturreihenfolge, weshalb die Obergrenze-Temperatur unter der Untergrenze liegen darf.
- **Raumnamen**: Das Schreiben über die `text`-Entities ändert den Gerätespeicher direkt (FC6 Preset Write, Latin-1 kodiert). Mit Bedacht verwenden.
- **Entwicklung**: Diese Integration entstand mit Unterstützung von [Claude Code](https://claude.ai/code) – auf Basis manuell definierter Modbus-Sensoren und -Schalter, die in Home Assistant über Jahre gewachsen sind.
