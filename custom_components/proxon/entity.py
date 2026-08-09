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
        # Keyed on the entry id, never the host -- see _async_migrate_identity.
        self._attr_unique_id = f"proxon_{coordinator.entry_id}_{unique_suffix}"
        # The suffix doubles as the translation key. It lands in the entity
        # registry's display data (`tk`), which is what lets the dashboard card
        # find entities by meaning instead of by hard-coded entity_id.
        # Entities with a runtime name (per-room thermostats, room-name texts)
        # keep their _attr_name / description name -- both win over a missing
        # translation in Entity._name_internal, so no translation is defined
        # for those keys.
        self._attr_translation_key = unique_suffix
        info = _DEVICE_INFO[device]
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{coordinator.entry_id}_{device}")},
            name=info["name"],
            manufacturer="Proxon",
            model=info["model"],
        )
