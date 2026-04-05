"""Base entity for Proxon FWT."""
from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ProxonCoordinator

DEVICE_FWT = "fwt"
DEVICE_T300 = "t300"

_DEVICE_INFO: dict[str, dict] = {
    DEVICE_FWT: {
        "name": "Proxon FWT",
        "model": "FWT 2.0",
    },
    DEVICE_T300: {
        "name": "Proxon T300",
        "model": "T300",
    },
}


class ProxonEntity(CoordinatorEntity[ProxonCoordinator]):
    """Base class for all Proxon entities."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        unique_suffix: str,
        device: str = DEVICE_FWT,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"proxon_{coordinator.host}_{unique_suffix}"
        info = _DEVICE_INFO[device]
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{coordinator.host}_{device}")},
            name=info["name"],
            manufacturer="Proxon",
            model=info["model"],
        )
