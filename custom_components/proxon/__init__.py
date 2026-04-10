"""Proxon FWT Home Assistant Integration."""
from __future__ import annotations

from homeassistant.components.persistent_notification import async_create, async_dismiss
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SCAN_INTERVAL, Platform
from homeassistant.core import HomeAssistant, callback

from .const import (
    CONF_FILTER_NOTIFICATION,
    CONF_HAS_T300,
    CONF_SLAVE,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_SLAVE,
    DOMAIN,
    FILTER_NOTIFICATION_ID,
)
from .coordinator import ProxonCoordinator

PLATFORMS = [
    Platform.CLIMATE,
    Platform.SENSOR,
    Platform.SELECT,
    Platform.FAN,
    Platform.NUMBER,
    Platform.SWITCH,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.TEXT,
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Proxon FWT from a config entry."""
    coordinator = ProxonCoordinator(
        hass,
        host=entry.data[CONF_HOST],
        port=entry.data.get(CONF_PORT, 502),
        slave=int(entry.data.get(CONF_SLAVE, DEFAULT_SLAVE)),
        # Prefer options (new entries); fall back to data (entries created before this fix).
        scan_interval=entry.options.get(CONF_SCAN_INTERVAL)
        or entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        # Default True: backward-compat for existing entries created before this option existed.
        has_t300=entry.data.get(CONF_HAS_T300, True),
    )
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _setup_filter_notification(hass, entry, coordinator)
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration when options change (e.g. scan_interval)."""
    await hass.config_entries.async_reload(entry.entry_id)


def _setup_filter_notification(
    hass: HomeAssistant,
    entry: ConfigEntry,
    coordinator: ProxonCoordinator,
) -> None:
    """Register coordinator listener for filter-change persistent notification."""
    notification_id = f"{FILTER_NOTIFICATION_ID}_{entry.entry_id}"

    @callback
    def _on_coordinator_update() -> None:
        filter_status = coordinator.data.get("filter_wechsel_faellig")
        notify_enabled: bool = entry.options.get(CONF_FILTER_NOTIFICATION, True)

        if filter_status is True and notify_enabled:
            async_create(
                hass,
                message=(
                    "Der Gerätefilter der Proxon FWT muss gewechselt werden.\n\n"
                    "**Wichtig:** Das Gerät schaltet sich automatisch ab, wenn der Filter "
                    "nicht innerhalb von 3 Wochen getauscht wird.\n\n"
                    "Nach dem Tausch: Quittierung am Bedienteil + "
                    "Button **Gerätefilter zurücksetzen** in Home Assistant drücken."
                ),
                title="Proxon FWT – Filterwechsel fällig",
                notification_id=notification_id,
            )
        elif filter_status is False or not notify_enabled:
            # Only dismiss when filter is confirmed OK, or user disabled notifications.
            # When filter_status is None (short read / unknown), leave current state.
            async_dismiss(hass, notification_id)

    entry.async_on_unload(coordinator.async_add_listener(_on_coordinator_update))


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator: ProxonCoordinator = hass.data[DOMAIN].pop(entry.entry_id)
        coordinator._close_client()
    return unload_ok
