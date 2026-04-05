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

from .const import DOMAIN, FWT_HOLDING_REGISTERS, T300_HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, DEVICE_T300, ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonNumberDescription(NumberEntityDescription):
    data_key: str
    register_key: str
    scale: float = 1.0   # multiply HA value by this before writing
    device: str = DEVICE_FWT


NUMBERS: tuple[ProxonNumberDescription, ...] = (
    ProxonNumberDescription(
        key="soll_temp_zone1",
        data_key="soll_temp_zone1",
        register_key="soll_temp_zone1",
        name="Solltemperatur EG",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=10,
        native_max_value=30,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=100.0,
    ),
    ProxonNumberDescription(
        key="soll_temp_zone2",
        data_key="soll_temp_zone2",
        register_key="soll_temp_zone2",
        name="Solltemperatur OG",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=10,
        native_max_value=30,
        native_step=0.5,
        mode=NumberMode.BOX,
        scale=100.0,
    ),
    ProxonNumberDescription(
        key="nbe_offset_haupt",
        data_key="nbe_offset_haupt",
        register_key="nbe_offset_haupt",
        name="NBE Offset Büro",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=-3,
        native_max_value=3,
        native_step=1,
        mode=NumberMode.BOX,
        scale=1.0,
    ),
    ProxonNumberDescription(
        key="nbe_offset_1",
        data_key="nbe_offset_1",
        register_key="nbe_offset_1",
        name="NBE Offset Diele",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=-3,
        native_max_value=3,
        native_step=1,
        mode=NumberMode.BOX,
        scale=1.0,
    ),
    ProxonNumberDescription(
        key="nbe_offset_2",
        data_key="nbe_offset_2",
        register_key="nbe_offset_2",
        name="NBE Offset Schlafen",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=-3,
        native_max_value=3,
        native_step=1,
        mode=NumberMode.BOX,
        scale=1.0,
    ),
    ProxonNumberDescription(
        key="nbe_offset_4",
        data_key="nbe_offset_4",
        register_key="nbe_offset_4",
        name="NBE Offset Kreativ",
        device_class=NumberDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        native_min_value=-3,
        native_max_value=3,
        native_step=1,
        mode=NumberMode.BOX,
        scale=1.0,
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
    async_add_entities(ProxonNumber(coordinator, desc) for desc in NUMBERS)


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
        return self.coordinator.data.get(self.entity_description.data_key)

    async def async_set_native_value(self, value: float) -> None:
        raw = int(round(value * self.entity_description.scale))
        key = self.entity_description.register_key
        reg = FWT_HOLDING_REGISTERS.get(key) or T300_HOLDING_REGISTERS[key]
        await self.coordinator.write_register(reg.address, raw)
        await self.coordinator.async_request_refresh()
