"""Base entity for Proxon FWT."""
from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ProxonCoordinator


class ProxonEntity(CoordinatorEntity[ProxonCoordinator]):
    """Base class for all Proxon entities."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: ProxonCoordinator, unique_suffix: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"proxon_{coordinator.host}_{unique_suffix}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.host)},
            name="Proxon FWT",
            manufacturer="Proxon",
            model="FWT 2.0",
        )
