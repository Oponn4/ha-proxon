"""Select platform for Proxon FWT – Betriebsart."""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    BETRIEBSART_MAP, BETRIEBSART_REVERSE,
    T300_BETRIEBSART_MAP, T300_BETRIEBSART_REVERSE,
    DOMAIN, FWT_HOLDING_REGISTERS, T300_HOLDING_REGISTERS,
)
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        ProxonBetriebsartSelect(coordinator),
        ProxonT300BetriebsartSelect(coordinator),
    ])


class ProxonBetriebsartSelect(ProxonEntity, SelectEntity):
    """Select entity for the operating mode (Betriebsart)."""

    _attr_name = "Betriebsart"
    _attr_icon = "mdi:heat-pump"
    _attr_options = list(BETRIEBSART_MAP.values())

    def __init__(self, coordinator: ProxonCoordinator) -> None:
        super().__init__(coordinator, "betriebsart")

    @property
    def current_option(self) -> str | None:
        raw = self.coordinator.data.get("sollbetriebsart")
        if raw is None:
            return None
        return BETRIEBSART_MAP.get(int(raw), f"Unbekannt ({raw})")

    async def async_select_option(self, option: str) -> None:
        raw = BETRIEBSART_REVERSE.get(option)
        if raw is None:
            return
        reg = FWT_HOLDING_REGISTERS["sollbetriebsart"]
        await self.coordinator.write_register(reg.address, raw)
        await self.coordinator.async_request_refresh()


class ProxonT300BetriebsartSelect(ProxonEntity, SelectEntity):
    """Select entity for the T300 operating mode."""

    _attr_name = "T300 Betriebsart"
    _attr_icon = "mdi:water-boiler"
    _attr_options = list(T300_BETRIEBSART_MAP.values())

    def __init__(self, coordinator: ProxonCoordinator) -> None:
        super().__init__(coordinator, "t300_betriebsart")

    @property
    def current_option(self) -> str | None:
        raw = self.coordinator.data.get("t300_betriebsart")
        if raw is None:
            return None
        return T300_BETRIEBSART_MAP.get(int(raw), f"Unbekannt ({raw})")

    async def async_select_option(self, option: str) -> None:
        raw = T300_BETRIEBSART_REVERSE.get(option)
        if raw is None:
            return
        reg = T300_HOLDING_REGISTERS["t300_betriebsart"]
        await self.coordinator.write_register(reg.address, raw)
        await self.coordinator.async_request_refresh()
