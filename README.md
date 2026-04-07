# Proxon FWT – Home Assistant Integration

Custom Component für die **Proxon FWT 2.0** Wärmepumpe / Lüftungsanlage und die **T300** Warmwasser-Wärmepumpe.

Verbindung erfolgt lokal über Modbus RTU-over-TCP via USR RS485-to-LAN Adapter – keine Cloud, kein Nabto.

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
| **Select** | FWT Betriebsart (Aus / Eco Sommer / Eco Winter / Komfort) · T300 Betriebsart |
| **Fan** | Lüftungsstufe (4 Stufen: 25 / 50 / 75 / 100 %) |
| **Switch** | Kühlung freigeben · T300 Elektroheizung · T300 Legionellenschutz · T300 PV-Modus · PTC-Freigabe je Raum (deaktiviert) · Zeitprogramm Lüftung · Nachtabsenkung (deaktiviert) |
| **Number** | NBE Temperatur-Offsets je Raum (deaktiviert) · Zone-2-Solltemperatur (deaktiviert) · Intensivlüftung Timer · Nachttemperatur · T300 Solltemperatur · T300 Elektroheizungstemperatur |
| **Binary Sensor** | Störung aktiv · Kompressor aktiv · Bypass offen · Filterwechsel fällig · T300 Relais-Zustände |
| **Button** | Filterlaufzeit zurücksetzen |
| **Text** | Raumname je Bediengerät – schreibt direkt in den Gerätespeicher (deaktiviert) |

---

## Installation

### Über HACS (empfohlen)

1. HACS öffnen → **Integrationen** → ⋮ Menü → **Benutzerdefinierte Repositories**
2. `https://github.com/Oponn4/proxon_homeassistant` als **Integration** hinzufügen
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

## Hinweise

- **Nabto / Cloud**: Nicht unterstützt. Diese Integration verwendet ausschließlich lokales Modbus.
- **Betriebsart „Test"** (Modus 9): Nicht verfügbar – ausschließlich für Servicetechniker vorgesehen.
- **Zone 2**: Als `number`-Entity verfügbar (deaktiviert) – nur relevant für Anlagen ohne NBE-Raumbediengeräte.
- **Raumnamen**: Das Schreiben über die `text`-Entities ändert den Gerätespeicher direkt (FC6 Preset Write, Latin-1 kodiert). Mit Bedacht verwenden.
