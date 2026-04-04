"""Fan platform for Proxon FWT – Lüftung."""
from __future__ import annotations

import math
from typing import Any

from homeassistant.components.fan import FanEntity, FanEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, FWT_HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity

# Proxon fan levels 1–4 mapped to percentage steps
_SPEED_STEPS = [25, 50, 75, 100]


def _level_to_pct(level: int) -> int:
    level = max(1, min(4, int(level)))
    return _SPEED_STEPS[level - 1]


def _pct_to_level(pct: float) -> int:
    if pct <= 25:
        return 1
    if pct <= 50:
        return 2
    if pct <= 75:
        return 3
    return 4


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([ProxonFan(coordinator)])


class ProxonFan(ProxonEntity, FanEntity):
    """Fan entity controlling Proxon ventilation level."""

    _attr_name = "Lüftung"
    _attr_icon = "mdi:fan"
    _attr_supported_features = FanEntityFeature.SET_SPEED
    _attr_speed_count = 4

    def __init__(self, coordinator: ProxonCoordinator) -> None:
        super().__init__(coordinator, "lueftung")

    @property
    def is_on(self) -> bool:
        betriebsart = self.coordinator.data.get("sollbetriebsart")
        return betriebsart not in (None, 0)

    @property
    def percentage(self) -> int | None:
        level = self.coordinator.data.get("luefterstufe")
        if level is None:
            return None
        return _level_to_pct(int(level))

    async def async_set_percentage(self, percentage: int) -> None:
        level = _pct_to_level(percentage)
        reg = FWT_HOLDING_REGISTERS["luefterstufe"]
        await self.coordinator.write_register(reg.address, level)
        await self.coordinator.async_request_refresh()

    async def async_turn_on(
        self, percentage: int | None = None, preset_mode: str | None = None, **kwargs: Any
    ) -> None:
        if percentage is not None:
            await self.async_set_percentage(percentage)

    async def async_turn_off(self, **kwargs: Any) -> None:
        # Turning off the fan means switching to "Aus" operating mode
        reg = FWT_HOLDING_REGISTERS["sollbetriebsart"]
        await self.coordinator.write_register(reg.address, 0)
        await self.coordinator.async_request_refresh()
