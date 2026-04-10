"""Number platform for Proxon FWT – writable setpoints."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_ROOMS, DOMAIN, FWT_HOLDING_REGISTERS, T300_HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, DEVICE_T300, ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonNumberDescription(NumberEntityDescription):
    data_key: str | None = None  # None → falls back to key
    register_key: str = ""
    direct_address: int | None = None  # used instead of register_key for dynamic entities
    scale: float = 1.0   # multiply HA value by this before writing
    device: str = DEVICE_FWT
    note: str | None = None  # shown as extra state attribute "Hinweis"


NUMBERS: tuple[ProxonNumberDescription, ...] = (
    # soll_temp_zone1 entfernt – wird von climate.zone_1 (Wohnen/Essen) abgelöst.
    ProxonNumberDescription(
        key="soll_temp_zone2",
        data_key="soll_temp_zone2",
        register_key="soll_temp_zone2",
        name="Solltemperatur Zone 2",
        note="Nur relevant wenn keine HNBE (Nebenbedieneinheit) verbaut ist",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=10,
        native_max_value=30,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=100.0,
        entity_registry_enabled_default=False,
    ),
    ProxonNumberDescription(
        key="intensivlueftung",
        data_key="intensivlueftung",
        register_key="intensivlueftung",
        name="Intensivlüftung",
        native_unit_of_measurement="min",
        native_min_value=0,
        native_max_value=1440,
        native_step=10,
        mode=NumberMode.BOX,
        icon="mdi:fan-speed-3",
        scale=1.0,
    ),
    ProxonNumberDescription(
        key="nacht_temperatur",
        data_key="nacht_temperatur",
        register_key="nacht_temperatur",
        name="Nachttemperatur",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=10,
        native_max_value=30,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=100.0,
        entity_registry_enabled_default=False,
    ),

    # ── T300 ────────────────────────────────────────────────────────────
    ProxonNumberDescription(
        key="t300_solltemperatur",
        data_key="t300_solltemperatur",
        register_key="t300_solltemperatur",
        name="Solltemperatur",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=20,
        native_max_value=55,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=10.0,
        device=DEVICE_T300,
    ),
    ProxonNumberDescription(
        key="t300_temp_eheiz",
        data_key="t300_temp_eheiz",
        register_key="t300_temp_eheiz",
        name="Temperatur E-Heiz",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=20,
        native_max_value=70,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=10.0,
        device=DEVICE_T300,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    rooms: list[dict] = entry.data.get(CONF_ROOMS, [])

    # Dynamic NBE offset number entities (one per discovered NBE room).
    nbe_offset_numbers = [
        ProxonNumber(coordinator, ProxonNumberDescription(
            key=f"nbe_offset_{room['physical_idx']}",
            data_key=f"nbe_offset_{room['physical_idx']}",
            direct_address=213 + room["physical_idx"],
            name=f"Offset {room['name']}",
            device_class=NumberDeviceClass.TEMPERATURE,
            native_unit_of_measurement=UnitOfTemperature.CELSIUS,
            native_min_value=-3,
            native_max_value=3,
            native_step=1,
            mode=NumberMode.BOX,
            scale=1.0,
            entity_registry_enabled_default=False,
        ))
        for room in rooms
        if room.get("physical_idx") is not None
    ]

    numbers = [
        ProxonNumber(coordinator, desc)
        for desc in NUMBERS
        if coordinator.has_t300 or desc.device != DEVICE_T300
    ]
    async_add_entities(numbers + nbe_offset_numbers)


class ProxonNumber(ProxonEntity, NumberEntity):
    """Writable number entity for Proxon setpoints."""

    entity_description: ProxonNumberDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonNumberDescription,
    ) -> None:
        super().__init__(coordinator, description.key, description.device)
        self.entity_description = description

    @property
    def native_value(self) -> float | None:
        data_key = self.entity_description.data_key or self.entity_description.key
        return self.coordinator.data.get(data_key)

    @property
    def extra_state_attributes(self) -> dict | None:
        if self.entity_description.note:
            return {"Hinweis": self.entity_description.note}
        return None

    async def async_set_native_value(self, value: float) -> None:
        raw = int(round(value * self.entity_description.scale))
        if raw < 0:
            raw += 65536  # int16 → uint16 for signed registers (e.g. NBE offsets)
        if self.entity_description.direct_address is not None:
            address = self.entity_description.direct_address
        else:
            key = self.entity_description.register_key
            reg = FWT_HOLDING_REGISTERS.get(key) or T300_HOLDING_REGISTERS[key]
            address = reg.address
        await self.coordinator.write_register(address, raw)
        await self.coordinator.async_request_refresh()
