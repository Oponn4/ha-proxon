"""Climate platform for Proxon FWT – per-room thermostat via NBE offsets."""
from __future__ import annotations

from typing import Any

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_ROOMS, DOMAIN
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, ProxonEntity

# NBE offset register is int16; pymodbus write_register expects uint16.
def _offset_to_raw(offset: int) -> int:
    return offset if offset >= 0 else offset + 65536


# How many °C the offset can deviate from Mitteltemperatur (-3..+3)
_OFFSET_MIN = -3
_OFFSET_MAX = 3


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    rooms: list[dict] = entry.data.get(CONF_ROOMS, [])

    # NBE per-room climate entities (offset-based, ±3 °C)
    nbe_entities = [
        ProxonRoomClimate(coordinator, room)
        for room in rooms
        if room.get("physical_idx") is not None
    ]

    # Zone 1 (EG): direct setpoint 10–30 °C, name from HBDE room
    zone1_name = next((r["name"] for r in rooms if r.get("name_idx") == 0), "Wohnen/Essen")
    zone_entities = [
        ProxonZoneClimate(coordinator, zone=1, name=zone1_name,
                          temp_key="t21_zone1", target_key="soll_temp_zone1", target_addr=70),
        # Zone 2 (reg 75) is "Bei keine HNBE" only – not modelled as climate.
        # Controlled via the number entity soll_temp_zone2 if needed.
    ]

    async_add_entities(nbe_entities + zone_entities)


class ProxonRoomClimate(ProxonEntity, ClimateEntity):
    """Per-room thermostat.

    current_temperature = nbe_temp_N   (NBE input register)
    target_temperature  = nbe_mittel_N + nbe_offset_N
    set_temperature     → writes offset = round(target − mittel), clamped ±3 °C

    HVAC modes (system-wide, shared across all rooms):
      OFF  → Betriebsart 0 (Aus)
      AUTO → Betriebsart 3 (Komfortbetrieb)

    hvac_action:
      heating  → compressor on, vierwege_ventil = 0
      cooling  → compressor on, vierwege_ventil = 1
      fan      → compressor off, fan running
      idle     → compressor off, fan stopped
      off      → system off
    """

    _attr_hvac_modes = [HVACMode.OFF, HVACMode.AUTO]
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_target_temperature_step = 1.0

    def __init__(self, coordinator: ProxonCoordinator, room: dict) -> None:
        n = room["physical_idx"]
        super().__init__(coordinator, f"climate_room_{room['name_idx']}", DEVICE_FWT)
        self._n = n
        self._attr_name = room["name"]

    # ── temperatures ──────────────────────────────────────────────────────

    @property
    def current_temperature(self) -> float | None:
        return self.coordinator.data.get(f"nbe_temp_{self._n}")

    @property
    def target_temperature(self) -> float | None:
        mittel = self.coordinator.data.get(f"nbe_mittel_{self._n}")
        offset = self.coordinator.data.get(f"nbe_offset_{self._n}")
        if mittel is None or offset is None:
            return None
        return float(mittel) + float(offset)

    @property
    def min_temp(self) -> float:
        mittel = self.coordinator.data.get(f"nbe_mittel_{self._n}")
        return float(16 + _OFFSET_MIN) if mittel is None else float(mittel) + _OFFSET_MIN

    @property
    def max_temp(self) -> float:
        mittel = self.coordinator.data.get(f"nbe_mittel_{self._n}")
        return float(26 + _OFFSET_MAX) if mittel is None else float(mittel) + _OFFSET_MAX

    # ── HVAC mode / action ────────────────────────────────────────────────

    @property
    def hvac_mode(self) -> HVACMode | None:
        ba = self.coordinator.data.get("sollbetriebsart")
        if ba is None:
            return None
        return HVACMode.OFF if int(ba) == 0 else HVACMode.AUTO

    @property
    def hvac_action(self) -> HVACAction | None:
        if self.hvac_mode == HVACMode.OFF:
            return HVACAction.OFF
        running = self.coordinator.data.get("kompressor_status")
        if running is None:
            return None
        if int(running) == 1:
            ventil = self.coordinator.data.get("vierwege_ventil")
            return HVACAction.COOLING if (ventil is not None and int(ventil) == 1) else HVACAction.HEATING
        rpm = self.coordinator.data.get("drehzahl_zuluft")
        if rpm is not None and float(rpm) > 0:
            return HVACAction.FAN
        return HVACAction.IDLE

    # ── write actions ─────────────────────────────────────────────────────

    async def async_set_temperature(self, **kwargs: Any) -> None:
        temp = kwargs.get(ATTR_TEMPERATURE)
        if temp is None:
            return
        mittel = self.coordinator.data.get(f"nbe_mittel_{self._n}")
        if mittel is None:
            return
        offset = max(_OFFSET_MIN, min(_OFFSET_MAX, round(float(temp) - float(mittel))))
        await self.coordinator.write_register(213 + self._n, _offset_to_raw(offset))
        await self.coordinator.async_request_refresh()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        if hvac_mode == HVACMode.OFF:
            await self.coordinator.write_register(16, 0)   # Betriebsart: Aus
        elif hvac_mode == HVACMode.AUTO:
            await self.coordinator.write_register(16, 3)   # Komfortbetrieb
        await self.coordinator.async_request_refresh()


class ProxonZoneClimate(ProxonEntity, ClimateEntity):
    """Zone 1 (EG) thermostat – direct setpoint 10–30 °C.

    Writes soll_temp_zone1 (reg 70, scale ×100).
    Current temperature from T2.1 Zonentemperatur 1 (input reg 263).
    """

    _attr_hvac_modes = [HVACMode.OFF, HVACMode.AUTO]
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_target_temperature_step = 0.5
    _attr_min_temp = 10.0
    _attr_max_temp = 30.0

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        zone: int,
        name: str,
        temp_key: str,
        target_key: str,
        target_addr: int,
    ) -> None:
        super().__init__(coordinator, f"zone_{zone}", DEVICE_FWT)
        self._temp_key = temp_key
        self._target_key = target_key
        self._target_addr = target_addr
        self._attr_name = name

    @property
    def current_temperature(self) -> float | None:
        return self.coordinator.data.get(self._temp_key)

    @property
    def target_temperature(self) -> float | None:
        return self.coordinator.data.get(self._target_key)

    @property
    def hvac_mode(self) -> HVACMode | None:
        ba = self.coordinator.data.get("sollbetriebsart")
        if ba is None:
            return None
        return HVACMode.OFF if int(ba) == 0 else HVACMode.AUTO

    @property
    def hvac_action(self) -> HVACAction | None:
        if self.hvac_mode == HVACMode.OFF:
            return HVACAction.OFF
        running = self.coordinator.data.get("kompressor_status")
        if running is None:
            return None
        if int(running) == 1:
            ventil = self.coordinator.data.get("vierwege_ventil")
            return HVACAction.COOLING if (ventil is not None and int(ventil) == 1) else HVACAction.HEATING
        rpm = self.coordinator.data.get("drehzahl_zuluft")
        if rpm is not None and float(rpm) > 0:
            return HVACAction.FAN
        return HVACAction.IDLE

    async def async_set_temperature(self, **kwargs: Any) -> None:
        temp = kwargs.get(ATTR_TEMPERATURE)
        if temp is None:
            return
        raw = int(round(float(temp) * 100))
        await self.coordinator.write_register(self._target_addr, raw)
        await self.coordinator.async_request_refresh()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        if hvac_mode == HVACMode.OFF:
            await self.coordinator.write_register(16, 0)
        elif hvac_mode == HVACMode.AUTO:
            await self.coordinator.write_register(16, 3)
        await self.coordinator.async_request_refresh()


