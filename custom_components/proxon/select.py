"""Select platform for Proxon FWT – Betriebsart."""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import BETRIEBSART_MAP, BETRIEBSART_REVERSE, DOMAIN, HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([ProxonBetriebsartSelect(coordinator)])


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
        reg = HOLDING_REGISTERS["sollbetriebsart"]
        await self.coordinator.write_register(reg.address, raw)
        await self.coordinator.async_request_refresh()
