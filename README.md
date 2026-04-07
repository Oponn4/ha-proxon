# Proxon FWT – Home Assistant Integration

Custom component for the **Proxon FWT 2.0** heat pump / ventilation unit and the **T300** domestic hot-water heat pump.

Connects locally via Modbus RTU-over-TCP using a USR RS485-to-LAN adapter (no cloud, no Nabto).

---

## Supported Hardware

| Device | Role |
|---|---|
| **Proxon FWT 2.0** | Main unit – heating, cooling, ventilation |
| **Proxon T300** | Domestic hot-water heat pump (separate Modbus slave on the same bus) |
| **NBE / HNBE room panels** | Up to 7 room temperature sensors + individual offsets |

---

## Features

### Climate
- **Zone 1 (main zone)**: Full thermostat control – set target temperature 10–30 °C. HVAC action reflects actual compressor/heating state.
- **Room panels (NBE)**: Individual ±3 °C temperature offset per room panel, shown as climate entities. Rooms are discovered automatically from the device at setup time.

### Sensors
- **FWT**: Supply/return/outdoor/evaporator temperatures (T1–T13), compressor speed & power, fan speeds, air volume flow, CO₂, humidity, power consumption, JAZ/COP values, filter runtime hours
- **T300**: Tank temperatures (top/middle/bottom), compressor data, power consumption, COP
- **Room panels**: Current room temperature per NBE device

### Controls

| Platform | Entities |
|---|---|
| **Select** | FWT operating mode (Off / Eco Summer / Eco Winter / Comfort) · T300 operating mode |
| **Fan** | Ventilation level (4 speeds: 25 / 50 / 75 / 100 %) |
| **Switch** | Cooling enable · T300 electric heater · T300 legionella protection · T300 PV mode · PTC release per room (disabled by default) · Ventilation schedule · Night setback (disabled by default) |
| **Number** | NBE temperature offsets per room (disabled by default) · Zone 2 setpoint (disabled by default) · Intensive ventilation timer · Night temperature · T300 target temperature · T300 electric heater temperature |
| **Binary Sensor** | Fault active · Compressor active · Bypass open · Filter change due · T300 relay states |
| **Button** | Reset filter runtime counter |
| **Text** | Room name per panel – writes directly to device memory (disabled by default) |

---

## Installation

### Via HACS (recommended)

1. Open HACS → **Integrations** → ⋮ menu → **Custom repositories**
2. Add `https://github.com/Oponn4/proxon_homeassistant` as an **Integration**
3. Search for **Proxon FWT** and install
4. Restart Home Assistant

### Manual

Copy `custom_components/proxon/` into your Home Assistant `config/custom_components/` directory and restart HA.

---

## Setup

1. Go to **Settings → Devices & Services → Add Integration**
2. Search for **Proxon FWT**
3. Enter:
   - **Host**: IP address of your RS485-to-LAN adapter
   - **Port**: Modbus TCP port (default: `502`)
   - **Slave ID**: Modbus slave address (default: `41`)
4. After setup, room panels are discovered automatically. To re-run discovery (e.g. after adding a room panel), use **Reconfigure** in the integration card.

### Options

After setup, click **Configure** to adjust:
- **Scan interval** (default: 30 s) – how often registers are polled
- **Filter notification** – days before filter change to show a persistent notification

---

## Modbus Details

| Parameter | Value |
|---|---|
| Protocol | Modbus RTU-over-TCP |
| Default slave ID | 41 |
| RS485 baud rate | 19200 (factory default) |
| Register types | Input (3x, read-only) · Holding (4x, read/write) |

The integration always opens a fresh TCP connection per poll cycle and closes it afterwards. This keeps the framer state clean and avoids stale-frame accumulation from internal RS485 bus traffic forwarded by the adapter.

### Write Access

The Proxon unit requires an unlock code before holding registers can be written. This integration writes `55555` to register `438` once per HA session to enable write access – avoiding repeated flash writes on the device.

---

## Notes

- **Nabto / cloud**: Not supported. This integration uses local Modbus only.
- **Operating mode "Test"** (mode 9): Not exposed – intended for service technicians only.
- **Zone 2**: Exposed as a `number` entity (disabled by default) – only relevant for systems without NBE room panels.
- **Room names**: Writing room names via the `text` entities modifies device memory directly (FC6 preset write, Latin-1 encoded). Use with care.
