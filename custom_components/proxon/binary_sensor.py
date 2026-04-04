"""Binary sensor platform for Proxon FWT – fault/status."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonBinarySensorDescription(BinarySensorEntityDescription):
    data_key: str
    on_value: int = 1   # raw value considered "on"


BINARY_SENSORS: tuple[ProxonBinarySensorDescription, ...] = (
    ProxonBinarySensorDescription(
        key="stoerung",
        data_key="stoerung",
        name="Störung",
        device_class=BinarySensorDeviceClass.PROBLEM,
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="kompressor_aktiv",
        data_key="kompressor_status",
        name="Kompressor aktiv",
        device_class=BinarySensorDeviceClass.RUNNING,
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="bypass_offen",
        data_key="bypass_zustand",
        name="Bypass offen",
        icon="mdi:valve-open",
        on_value=1,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(ProxonBinarySensor(coordinator, desc) for desc in BINARY_SENSORS)


class ProxonBinarySensor(ProxonEntity, BinarySensorEntity):
    """Binary sensor for Proxon status flags."""

    entity_description: ProxonBinarySensorDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonBinarySensorDescription,
    ) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def is_on(self) -> bool | None:
        val = self.coordinator.data.get(self.entity_description.data_key)
        if val is None:
            return None
        return int(val) == self.entity_description.on_value
