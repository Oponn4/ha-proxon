"""Text platform for Proxon FWT – per-room name editing."""
from __future__ import annotations

import asyncio

from homeassistant.components.text import TextEntity, TextMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_ROOMS, DOMAIN
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, ProxonEntity

_NAME_MAX_LEN = 20          # 10 registers × 2 bytes per register
_NAME_REGS = 10             # holding registers per name slot
_INTER_WRITE_DELAY = 0.05   # seconds between individual FC6 writes


def _name_to_registers(name: str) -> list[int]:
    """Pack a name string into 10 uint16 Modbus registers (2 Latin-1 bytes each)."""
    encoded = name.encode("latin-1", errors="replace")[:_NAME_MAX_LEN]
    padded = encoded.ljust(_NAME_MAX_LEN, b"\x00")
    return [(padded[i] << 8) | padded[i + 1] for i in range(0, _NAME_MAX_LEN, 2)]


def _validate_name(value: str) -> str | None:
    """Return an error message if value is invalid, None if OK."""
    stripped = value.strip()
    if not stripped:
        return "Name darf nicht leer sein"
    try:
        stripped.encode("latin-1")
    except UnicodeEncodeError:
        return "Nur Latin-1 Zeichen erlaubt (keine Emoji oder Sonderzeichen)"
    return None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    rooms: list[dict] = entry.data.get(CONF_ROOMS, [])

    async_add_entities(
        ProxonRoomNameText(coordinator, entry, room)
        for room in rooms   # all rooms including HBDE (name_idx 0)
    )


class ProxonRoomNameText(ProxonEntity, TextEntity):
    """Editable room name for a single Proxon HBE/NBE name slot.

    The device stores each name in 10 consecutive holding registers
    (2 Latin-1 bytes packed per register, reg = 620 + name_idx * 10).
    Write requires 10 individual FC6 single-register writes because the
    device does not support FC16 block writes.

    State is initialised from entry.data (populated during config flow) and
    persisted back there after each successful write so the value survives
    HA restarts.
    """

    _attr_mode = TextMode.TEXT
    _attr_native_min = 1
    _attr_native_max = _NAME_MAX_LEN
    _attr_entity_registry_enabled_default = False  # rarely needed; enable manually

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        entry: ConfigEntry,
        room: dict,
    ) -> None:
        super().__init__(coordinator, f"name_room_{room['name_idx']}", DEVICE_FWT)
        self._entry = entry
        self._name_idx = room["name_idx"]
        self._name_addr = 620 + room["name_idx"] * 10
        self._current_name = room["name"]
        self._attr_name = f"Raumname {room['name']}"

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "hinweis": (
                "Ändert den Raumnamen direkt im Proxon-Gerät. "
                "Nur Latin-1 Zeichen (keine Emoji), max. 20 Zeichen."
            )
        }

    @property
    def native_value(self) -> str:
        return self._current_name

    async def async_set_value(self, value: str) -> None:
        """Validate, write to device, and persist the new room name."""
        value = value.strip()
        err = _validate_name(value)
        if err:
            raise ValueError(err)

        regs = _name_to_registers(value)
        for i, reg_val in enumerate(regs):
            await self.coordinator.write_register(self._name_addr + i, reg_val)
            if i < _NAME_REGS - 1:
                await asyncio.sleep(_INTER_WRITE_DELAY)

        self._current_name = value
        self._attr_name = f"Raumname {value}"
        self.async_write_ha_state()

        # Persist to entry.data so the value survives HA restarts.
        updated_rooms = [
            {**r, "name": value} if r["name_idx"] == self._name_idx else r
            for r in self._entry.data.get(CONF_ROOMS, [])
        ]
        self.hass.config_entries.async_update_entry(
            self._entry,
            data={**self._entry.data, CONF_ROOMS: updated_rooms},
        )
