# Proxon FWT – Home Assistant Integration

Custom component for the **Proxon FWT 2.0** heat pump / ventilation unit.

Connects via Modbus TCP using the Proxon RS485-to-LAN adapter.

## Features

- **Sensors**: All temperatures (T1–T13), compressor speed/power, fan speeds, air volume, CO₂, humidity, power consumption, JAZ/COP values
- **Select**: Operating mode (Aus / Eco Sommer / Eco Winter / Test)
- **Fan**: Ventilation level control (4 speeds)
- **Number**: Zone setpoint temperatures, NBE temperature offsets, intensive ventilation timer
- **Switch**: Cooling enable, HBDE PTC release
- **Binary Sensor**: Fault indicator, compressor active, bypass state

## Installation

### Via HACS (when public)

Add this repository as a custom repository in HACS.

### Manual

Copy `custom_components/proxon/` into your Home Assistant `config/custom_components/` directory and restart HA.

## Setup

1. Go to **Settings → Devices & Services → Add Integration**
2. Search for **Proxon FWT**
3. Enter the IP address of your RS485-to-LAN adapter, Modbus port (default: 502) and Slave ID (default: 41)

## Modbus Details

- **Protocol**: Modbus TCP
- **Baudrate** (RS485 side): 19200 / 9600 (factory default: 19200)
- **Default Slave ID**: 41
- **Register types used**:
  - Input Registers (3x) – read-only sensor data
  - Holding Registers (4x) – configuration and control (write level ≥ 1 required)

## Write Permissions

The Proxon unit has three write permission levels (register `schreibrechte`):
- **0** – Read only
- **1** – Partial write access (operating mode, temperatures, fan level, offsets)
- **2** – Full write access (factory settings)

This integration uses level 1 writes only.

## Notes

- The T300 hot water heat pump is a separate Modbus device and is **not** covered by this integration.
- NBE/HNBE room panel temperatures are read from the panel bus, not directly from this integration (they appear as HBDE/HNBE sensors).
