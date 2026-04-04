"""Switch platform for Proxon FWT."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonSwitchDescription(SwitchEntityDescription):
    data_key: str
    register_key: str


SWITCHES: tuple[ProxonSwitchDescription, ...] = (
    ProxonSwitchDescription(
        key="kuehlung_freigabe",
        data_key="kuehlung_freigabe",
        register_key="kuehlung_freigabe",
        name="Kühlung Freigabe",
        icon="mdi:snowflake",
    ),
    ProxonSwitchDescription(
        key="hbde_ptc_freigabe",
        data_key="hbde_ptc_freigabe",
        register_key="hbde_ptc_freigabe",
        name="HBDE PTC Freigabe (Wohnzimmer)",
        icon="mdi:radiator",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(ProxonSwitch(coordinator, desc) for desc in SWITCHES)


class ProxonSwitch(ProxonEntity, SwitchEntity):
    """Switch entity for binary Proxon settings."""

    entity_description: ProxonSwitchDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonSwitchDescription,
    ) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def is_on(self) -> bool | None:
        val = self.coordinator.data.get(self.entity_description.data_key)
        if val is None:
            return None
        return int(val) == 1

    async def async_turn_on(self, **kwargs: Any) -> None:
        reg = HOLDING_REGISTERS[self.entity_description.register_key]
        await self.coordinator.write_register(reg.address, 1)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        reg = HOLDING_REGISTERS[self.entity_description.register_key]
        await self.coordinator.write_register(reg.address, 0)
        await self.coordinator.async_request_refresh()
