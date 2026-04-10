"""Switch platform for Proxon FWT."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_ROOMS, DOMAIN, FWT_HOLDING_REGISTERS, T300_HOLDING_REGISTERS
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, DEVICE_T300, ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonSwitchDescription(SwitchEntityDescription):
    data_key: str | None = None  # None → falls back to key
    register_key: str = ""
    device: str = DEVICE_FWT


SWITCHES: tuple[ProxonSwitchDescription, ...] = (
    # FWT
    ProxonSwitchDescription(
        key="kuehlung_freigabe",
        data_key="kuehlung_freigabe",
        register_key="kuehlung_freigabe",
        name="Kühlung",
        icon="mdi:snowflake",
    ),
    # hbde_ptc_freigabe entfernt – jetzt als aux_heat in climate.zone_1 (Wohnen/Essen)
    # FWT – disabled by default (schedule/config settings)
    ProxonSwitchDescription(
        key="zeitprogramm_luft",
        data_key="zeitprogramm_luft",
        register_key="zeitprogramm_luft",
        name="Zeitprogramm Luftmenge",
        icon="mdi:clock-time-eight-outline",
        entity_registry_enabled_default=False,
    ),
    ProxonSwitchDescription(
        key="nachtabsenkung",
        data_key="nachtabsenkung",
        register_key="nachtabsenkung",
        name="Nachtabsenkung",
        icon="mdi:weather-night",
        entity_registry_enabled_default=False,
    ),
    # T300
    ProxonSwitchDescription(
        key="t300_eheiz_freigabe",
        data_key="t300_eheiz_freigabe",
        register_key="t300_eheiz_freigabe",
        name="E-Heizstab",
        icon="mdi:water-boiler",
        device=DEVICE_T300,
    ),
    ProxonSwitchDescription(
        key="t300_legionella",
        data_key="t300_legionella",
        register_key="t300_legionella",
        name="Legionellafunktion",
        icon="mdi:bacteria",
        device=DEVICE_T300,
    ),
    ProxonSwitchDescription(
        key="t300_pv_funktion",
        data_key="t300_pv_funktion",
        register_key="t300_pv_funktion",
        name="PV Funktion",
        icon="mdi:solar-power",
        device=DEVICE_T300,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    rooms: list[dict] = entry.data.get(CONF_ROOMS, [])

    # Dynamic PTC switches: HBDE (reg 187) + one per NBE room (reg 253 + physical_idx)
    ptc_switches = []
    for room in rooms:
        n = room.get("physical_idx")
        if n is None:
            # HBDE primary – PTC at reg 187, data key hbde_ptc_freigabe
            ptc_switches.append(ProxonDynamicSwitch(
                coordinator,
                key=f"ptc_{room['name_idx']}",
                data_key="hbde_ptc_freigabe",
                address=187,
                name=f"Heizelement {room['name']}",
            ))
        else:
            ptc_switches.append(ProxonDynamicSwitch(
                coordinator,
                key=f"ptc_{room['name_idx']}",
                data_key=f"nbe_ptc_{n}",
                address=253 + n,
                name=f"Heizelement {room['name']}",
            ))

    switches = [
        ProxonSwitch(coordinator, desc)
        for desc in SWITCHES
        if coordinator.has_t300 or desc.device != DEVICE_T300
    ]
    async_add_entities(switches + ptc_switches)


class ProxonSwitch(ProxonEntity, SwitchEntity):
    """Switch entity for binary Proxon settings."""

    entity_description: ProxonSwitchDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonSwitchDescription,
    ) -> None:
        super().__init__(coordinator, description.key, description.device)
        self.entity_description = description

    @property
    def is_on(self) -> bool | None:
        data_key = self.entity_description.data_key or self.entity_description.key
        val = self.coordinator.data.get(data_key)
        if val is None:
            return None
        return int(val) == 1

    def _reg(self):
        key = self.entity_description.register_key or self.entity_description.key
        return FWT_HOLDING_REGISTERS.get(key) or T300_HOLDING_REGISTERS[key]

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.write_register(self._reg().address, 1)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.write_register(self._reg().address, 0)
        await self.coordinator.async_request_refresh()


class ProxonDynamicSwitch(ProxonEntity, SwitchEntity):
    """Switch with a directly specified address (for dynamically discovered entities)."""

    _attr_icon = "mdi:radiator"

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        key: str,
        data_key: str,
        address: int,
        name: str,
    ) -> None:
        super().__init__(coordinator, key, DEVICE_FWT)
        self._data_key = data_key
        self._address = address
        self._attr_name = name

    @property
    def is_on(self) -> bool | None:
        val = self.coordinator.data.get(self._data_key)
        return None if val is None else int(val) == 1

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.write_register(self._address, 1)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.write_register(self._address, 0)
        await self.coordinator.async_request_refresh()
