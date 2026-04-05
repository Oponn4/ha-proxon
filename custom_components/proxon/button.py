"""Button entities for Proxon FWT."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class ProxonButtonDescription(ButtonEntityDescription):
    """Describes a Proxon button."""
    register: int = 0
    reset_value: int = 0


BUTTONS: tuple[ProxonButtonDescription, ...] = (
    ProxonButtonDescription(
        key="geraetefilter_reset",
        name="Gerätefilter zurücksetzen",
        icon="mdi:air-filter",
        register=469,
        reset_value=0,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(ProxonButton(coordinator, desc) for desc in BUTTONS)


class ProxonButton(ProxonEntity, ButtonEntity):
    """A Proxon button that writes a reset value to a holding register."""

    entity_description: ProxonButtonDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonButtonDescription,
    ) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    async def async_press(self) -> None:
        """Write reset value to the register and request coordinator refresh."""
        success = await self.coordinator.write_register(
            self.entity_description.register,
            self.entity_description.reset_value,
        )
        if success:
            _LOGGER.info(
                "Reset register %d to %d",
                self.entity_description.register,
                self.entity_description.reset_value,
            )
            await self.coordinator.async_request_refresh()
        else:
            _LOGGER.error(
                "Failed to reset register %d",
                self.entity_description.register,
            )
