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
    # FWT
    ProxonBinarySensorDescription(
        key="stoerung",
        data_key="stoerung",
        name="FWT Störung",
        device_class=BinarySensorDeviceClass.PROBLEM,
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="kompressor_aktiv",
        data_key="kompressor_status",
        name="FWT Kompressor aktiv",
        device_class=BinarySensorDeviceClass.RUNNING,
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="bypass_offen",
        data_key="bypass_zustand",
        name="FWT Bypass offen",
        icon="mdi:valve-open",
        on_value=1,
    ),
    # T300
    ProxonBinarySensorDescription(
        key="t300_stoerung",
        data_key="t300_fehlerliste",
        name="T300 Störung",
        device_class=BinarySensorDeviceClass.PROBLEM,
        on_value=1,  # any non-zero = fault; see FehlerList bitmask
    ),
    ProxonBinarySensorDescription(
        key="t300_kompressor_aktiv",
        data_key="t300_r2_kompressor",
        name="T300 Kompressor aktiv",
        device_class=BinarySensorDeviceClass.RUNNING,
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="t300_eheiz_aktiv",
        data_key="t300_r4_eheiz",
        name="T300 E-Heiz aktiv",
        icon="mdi:water-boiler",
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="t300_abtau_aktiv",
        data_key="t300_r6_abtau",
        name="T300 Abtau aktiv",
        icon="mdi:snowflake-melt",
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="t300_pv_wp",
        data_key="t300_pv_wp",
        name="T300 PV WP aktiv",
        icon="mdi:solar-power",
        on_value=1,
    ),
    ProxonBinarySensorDescription(
        key="filter_wechsel_faellig",
        data_key="filter_wechsel_faellig",
        name="Filtertausch fällig",
        device_class="problem",
        icon="mdi:air-filter",
        on_value=True,
    ),
    # Status flags – disabled by default (technical/diagnostic)
    ProxonBinarySensorDescription(
        key="umluft_aktiv",
        data_key="umluft_aktiv",
        name="Umluft aktiv",
        icon="mdi:rotate-3d-variant",
        on_value=1,
        entity_registry_enabled_default=False,
    ),
    ProxonBinarySensorDescription(
        key="erdwaerme_aktiv",
        data_key="erdwaerme_aktiv",
        name="Erdwärme aktiv",
        icon="mdi:earth",
        on_value=1,
        entity_registry_enabled_default=False,
    ),
    ProxonBinarySensorDescription(
        key="vierwege_ventil",
        data_key="vierwege_ventil",
        name="4-Wegeventil (Kühlen)",
        icon="mdi:valve",
        on_value=1,
        entity_registry_enabled_default=False,
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
        # Boolean values (e.g. filter_wechsel_faellig computed in coordinator)
        if isinstance(val, bool):
            return val
        raw = int(val)
        # FehlerList is a bitmask – any non-zero means fault
        if self.entity_description.key == "t300_stoerung":
            return raw != 0
        return raw == self.entity_description.on_value
