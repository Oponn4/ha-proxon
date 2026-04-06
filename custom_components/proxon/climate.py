"""Climate platform for Proxon FWT – per-room thermostat via NBE offsets."""
from __future__ import annotations

from dataclasses import dataclass
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

from .const import CONF_ROOM_NAMES, DOMAIN
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, ProxonEntity

# NBE offset register is int16; pymodbus write_register expects uint16.
def _offset_to_raw(offset: int) -> int:
    return offset if offset >= 0 else offset + 65536


@dataclass(frozen=True)
class _RoomDef:
    """Static per-room data for building climate entities."""
    key: str            # unique suffix
    nbe_idx: str        # index into CONF_ROOM_NAMES
    fallback: str       # name fallback if no stored room name
    temp_key: str       # coordinator data key for current temperature (NBE input reg)
    mittel_key: str     # coordinator data key for zone average temperature
    offset_key: str     # coordinator data key for current offset
    offset_addr: int    # Modbus holding register address to write offset


_ROOM_DEFS: tuple[_RoomDef, ...] = (
    _RoomDef(
        key="room_0", nbe_idx="0", fallback="Büro",
        temp_key="temp_klavierzimmer", mittel_key="mitteltemp_klavierzimmer",
        offset_key="nbe_offset_haupt", offset_addr=213,
    ),
    _RoomDef(
        key="room_1", nbe_idx="1", fallback="Diele",
        temp_key="temp_flur", mittel_key="mitteltemp_flur",
        offset_key="nbe_offset_1", offset_addr=214,
    ),
    _RoomDef(
        key="room_2", nbe_idx="2", fallback="Schlafen",
        temp_key="temp_schlafzimmer", mittel_key="mitteltemp_schlafzimmer",
        offset_key="nbe_offset_2", offset_addr=215,
    ),
    _RoomDef(
        key="room_4", nbe_idx="4", fallback="Kreativ",
        temp_key="temp_office", mittel_key="mitteltemp_office",
        offset_key="nbe_offset_4", offset_addr=217,
    ),
)

# How many °C the offset can deviate from Mitteltemperatur (-3..+3)
_OFFSET_MIN = -3
_OFFSET_MAX = 3


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    room_names: dict[str, str] = entry.data.get(CONF_ROOM_NAMES, {})

    async_add_entities(
        ProxonRoomClimate(
            coordinator,
            room_def,
            room_names.get(room_def.nbe_idx, room_def.fallback),
        )
        for room_def in _ROOM_DEFS
    )


class ProxonRoomClimate(ProxonEntity, ClimateEntity):
    """Per-room thermostat.

    Current temperature  = NBE sensor (input register).
    Target temperature   = Mitteltemperatur + NBE-Offset (both holding registers).
    Setting target temp  → writes new offset = round(target − Mittel), clamped to ±3°C.

    HVAC modes (system-wide, affect all rooms simultaneously via shared coordinator):
      OFF  → Betriebsart 0 (Aus)
      HEAT → Betriebsart 3 (Komfortbetrieb) + Kühlung Freigabe = 0
      COOL → Betriebsart 3 (Komfortbetrieb) + Kühlung Freigabe = 1 (active cooling)

    Dynamic limits: min_temp = Mittel − 3, max_temp = Mittel + 3.
    """

    _attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL]
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_target_temperature_step = 1.0

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        room_def: _RoomDef,
        room_name: str,
    ) -> None:
        super().__init__(coordinator, room_def.key, DEVICE_FWT)
        self._room = room_def
        self._attr_name = room_name

    # ── temperatures ──────────────────────────────────────────────────────

    @property
    def current_temperature(self) -> float | None:
        return self.coordinator.data.get(self._room.temp_key)

    @property
    def target_temperature(self) -> float | None:
        mittel = self.coordinator.data.get(self._room.mittel_key)
        offset = self.coordinator.data.get(self._room.offset_key)
        if mittel is None or offset is None:
            return None
        return float(mittel) + float(offset)

    @property
    def min_temp(self) -> float:
        mittel = self.coordinator.data.get(self._room.mittel_key)
        if mittel is None:
            return float(16 + _OFFSET_MIN)
        return float(mittel) + _OFFSET_MIN

    @property
    def max_temp(self) -> float:
        mittel = self.coordinator.data.get(self._room.mittel_key)
        if mittel is None:
            return float(26 + _OFFSET_MAX)
        return float(mittel) + _OFFSET_MAX

    # ── HVAC mode / action ────────────────────────────────────────────────

    @property
    def hvac_mode(self) -> HVACMode | None:
        ba = self.coordinator.data.get("sollbetriebsart")
        if ba is None:
            return None
        if int(ba) == 0:
            return HVACMode.OFF
        kuehl = self.coordinator.data.get("kuehlung_freigabe")
        if kuehl is not None and int(kuehl) == 1:
            return HVACMode.COOL
        return HVACMode.HEAT

    @property
    def hvac_action(self) -> HVACAction | None:
        mode = self.hvac_mode
        if mode == HVACMode.OFF:
            return HVACAction.OFF
        running = self.coordinator.data.get("kompressor_status")
        if running is None:
            return None
        if int(running) == 1:
            return HVACAction.COOLING if mode == HVACMode.COOL else HVACAction.HEATING
        return HVACAction.IDLE

    # ── write actions ─────────────────────────────────────────────────────

    async def async_set_temperature(self, **kwargs: Any) -> None:
        temp = kwargs.get(ATTR_TEMPERATURE)
        if temp is None:
            return
        mittel = self.coordinator.data.get(self._room.mittel_key)
        if mittel is None:
            return
        offset = max(_OFFSET_MIN, min(_OFFSET_MAX, round(float(temp) - float(mittel))))
        await self.coordinator.write_register(self._room.offset_addr, _offset_to_raw(offset))
        await self.coordinator.async_request_refresh()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        if hvac_mode == HVACMode.OFF:
            await self.coordinator.write_register(16, 0)
        elif hvac_mode == HVACMode.HEAT:
            await self.coordinator.write_register(16, 3)   # Komfortbetrieb
            await self.coordinator.write_register(62, 0)   # Kühlung Freigabe aus
        elif hvac_mode == HVACMode.COOL:
            await self.coordinator.write_register(16, 3)   # Komfortbetrieb
            await self.coordinator.write_register(62, 1)   # Kühlung Freigabe ein
        await self.coordinator.async_request_refresh()
