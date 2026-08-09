"""Proxon FWT Home Assistant Integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.persistent_notification import async_create, async_dismiss
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SCAN_INTERVAL, Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.loader import async_get_integration

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
from .entity import DEVICE_FWT, DEVICE_T300

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

FRONTEND_URL_BASE = "/proxon_frontend"
FRONTEND_CARD = "proxon-schema-card.js"
FRONTEND_REGISTERED = f"{DOMAIN}_frontend_registered"

_LOGGER = logging.getLogger(__name__)


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled Lovelace card and load it on every dashboard.

    Shipping the card with the integration means no separate HACS plugin, no
    manual `resources:` entry, and cache busting tied to the integration
    version instead of a hand-edited ?v= in the dashboard config.
    """
    if hass.data.get(FRONTEND_REGISTERED):
        return
    hass.data[FRONTEND_REGISTERED] = True

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL_BASE,
                str(Path(__file__).parent / "www"),
                # Long cache is safe: the ?v= below changes with every release.
                True,
            )
        ]
    )
    integration = await async_get_integration(hass, DOMAIN)
    add_extra_js_url(
        hass, f"{FRONTEND_URL_BASE}/{FRONTEND_CARD}?v={integration.version}"
    )


async def _async_migrate_identity(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Rebind entity and device identity from the host address to the entry id.

    Up to 0.4.4 the unique_id was ``proxon_<host>_<suffix>`` and the device
    identifier ``<host>_<device>``. Changing the host -- a new DHCP lease, a
    move to another VLAN -- therefore looked like a different device: HA
    registered a second set of entities and orphaned the originals, taking
    their entity_ids and any user renames with them. The entry id survives
    reconfiguration, so it is the stable anchor.

    Runs on every setup and is a no-op once migrated.
    """
    ent_reg = er.async_get(hass)
    new_prefix = f"proxon_{entry.entry_id}_"
    taken = {
        existing.unique_id
        for existing in er.async_entries_for_config_entry(ent_reg, entry.entry_id)
    }

    @callback
    def _migrate(registry_entry: er.RegistryEntry) -> dict[str, str] | None:
        old = registry_entry.unique_id
        if old.startswith(new_prefix) or not old.startswith("proxon_"):
            return None
        # proxon_<host>_<suffix> -- hosts carry dots, never underscores, so the
        # first underscore after the domain prefix separates host from suffix.
        _, _, rest = old.partition("_")
        _host, separator, suffix = rest.partition("_")
        if not separator:
            return None
        new_unique_id = f"{new_prefix}{suffix}"
        if new_unique_id in taken:
            # A second registration already claimed this identity: the host was
            # changed while the old entities were still registered. Merging
            # would silently pick a winner, so leave both and let the user
            # delete the set they do not want.
            _LOGGER.warning(
                "Proxon: cannot migrate %s to %s, that identity already exists. "
                "Delete the duplicate entities and reload the integration",
                registry_entry.entity_id,
                new_unique_id,
            )
            return None
        taken.add(new_unique_id)
        return {"new_unique_id": new_unique_id}

    await er.async_migrate_entries(hass, entry.entry_id, _migrate)

    dev_reg = dr.async_get(hass)
    devices = dr.async_entries_for_config_entry(dev_reg, entry.entry_id)
    claimed = {ident for device in devices for ident in device.identifiers}
    for device in devices:
        new_identifiers = set()
        changed = False
        for domain, ident in device.identifiers:
            host, separator, kind = ident.rpartition("_")
            if domain != DOMAIN or not separator or host == entry.entry_id:
                new_identifiers.add((domain, ident))
                continue
            target = (domain, f"{entry.entry_id}_{kind}")
            if target in claimed:
                new_identifiers.add((domain, ident))
                continue
            new_identifiers.add(target)
            claimed.add(target)
            changed = True
        if changed:
            dev_reg.async_update_device(device.id, new_identifiers=new_identifiers)


async def async_remove_config_entry_device(
    hass: HomeAssistant, entry: ConfigEntry, device: dr.DeviceEntry
) -> bool:
    """Allow deleting devices the integration no longer provides.

    Without this hook Home Assistant refuses every device deletion, which
    leaves stale devices from an earlier host permanently in the registry.
    Devices we currently provide are keyed on the entry id and stay put.
    """
    current = {f"{entry.entry_id}_{DEVICE_FWT}", f"{entry.entry_id}_{DEVICE_T300}"}
    return not any(
        domain == DOMAIN and ident in current for domain, ident in device.identifiers
    )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Proxon FWT from a config entry."""
    await _async_register_frontend(hass)
    await _async_migrate_identity(hass, entry)

    coordinator = ProxonCoordinator(
        hass,
        entry_id=entry.entry_id,
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
