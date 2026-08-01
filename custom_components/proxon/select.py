"""Select platform for Proxon FWT – Betriebsart."""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    BETRIEBSART_MAP, BETRIEBSART_REVERSE,
    BYPASS_MODUS_MAP, BYPASS_MODUS_REVERSE,
    T300_BETRIEBSART_MAP, T300_BETRIEBSART_REVERSE,
    DOMAIN, FWT_HOLDING_REGISTERS, T300_HOLDING_REGISTERS,
)
from .coordinator import ProxonCoordinator
from .entity import DEVICE_T300, ProxonEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities = [ProxonBetriebsartSelect(coordinator), ProxonBypassModusSelect(coordinator)]
    if coordinator.has_t300:
        entities.append(ProxonT300BetriebsartSelect(coordinator))
    async_add_entities(entities)


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
        await self.coordinator.async_write(
            reg.address, raw, optimistic={"sollbetriebsart": raw},
        )
        await self.coordinator.async_request_refresh()


class ProxonBypassModusSelect(ProxonEntity, SelectEntity):
    """Select entity for the summer-bypass mode (Holding 21, Menü T05:Test).

    "Geregelt" is the normal operating mode – the unit opens/closes the bypass
    automatically (thresholds: number.bypass_min_frischluft / bypass_hysterese).
    "Geschlossen"/"Geöffnet" are forced positions that disable that regulation
    until the mode is set back to "Geregelt".
    """

    _attr_name = "Bypass Modus"
    _attr_icon = "mdi:valve"
    _attr_options = list(BYPASS_MODUS_MAP.values())
    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator: ProxonCoordinator) -> None:
        super().__init__(coordinator, "bypass_modus")

    @property
    def current_option(self) -> str | None:
        raw = self.coordinator.data.get("bypass_modus")
        if raw is None:
            return None
        return BYPASS_MODUS_MAP.get(int(raw), f"Unbekannt ({raw})")

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "Hinweis": (
                "T05:Test – 'Geschlossen'/'Geöffnet' deaktivieren die "
                "Bypass-Automatik dauerhaft. Normalbetrieb ist 'Geregelt'."
            )
        }

    async def async_select_option(self, option: str) -> None:
        raw = BYPASS_MODUS_REVERSE.get(option)
        if raw is None:
            return
        reg = FWT_HOLDING_REGISTERS["bypass_modus"]
        await self.coordinator.async_write(
            reg.address, raw, optimistic={"bypass_modus": raw},
        )
        await self.coordinator.async_request_refresh()


class ProxonT300BetriebsartSelect(ProxonEntity, SelectEntity):
    """Select entity for the T300 operating mode."""

    _attr_name = "Betriebsart"
    _attr_icon = "mdi:water-boiler"
    _attr_options = list(T300_BETRIEBSART_MAP.values())

    def __init__(self, coordinator: ProxonCoordinator) -> None:
        super().__init__(coordinator, "t300_betriebsart", DEVICE_T300)

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
        await self.coordinator.async_write(
            reg.address, raw, optimistic={"t300_betriebsart": raw},
        )
        await self.coordinator.async_request_refresh()
