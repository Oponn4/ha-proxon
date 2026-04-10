"""Sensor platform for Proxon FWT."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONCENTRATION_PARTS_PER_MILLION,
    PERCENTAGE,
    REVOLUTIONS_PER_MINUTE,
    UnitOfPower,
    UnitOfTemperature,
    UnitOfVolumeFlowRate,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_ROOMS, DOMAIN
from .coordinator import ProxonCoordinator
from .entity import DEVICE_FWT, DEVICE_T300, ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonSensorDescription(SensorEntityDescription):
    """Extended sensor description with the coordinator data key."""
    data_key: str | None = None  # None → falls back to key
    device: str = DEVICE_FWT


SENSORS: tuple[ProxonSensorDescription, ...] = (
    # Temperatures
    ProxonSensorDescription(
        key="t1_zuluft", data_key="t1_zuluft", name="Temperatur T01 Zuluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t3_frischluft", data_key="t3_frischluft", name="Temperatur T03 Frischluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t4_fortluft", data_key="t4_fortluft", name="Temperatur T04 Fortluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t5_vorverdampfer", data_key="t5_vorverdampfer", name="Temperatur T05 VorVerdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t6_verdampfer", data_key="t6_verdampfer", name="Temperatur T06 Verdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t7_abluft", data_key="t7_abluft", name="Temperatur T07 Abluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t13_kompressor", data_key="t13_kompressor", name="Temperatur T13 Kompressor",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t21_zone1", data_key="t21_zone1", name="Zonentemperatur EG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,  # in climate.zone_1 current_temperature
    ),
    ProxonSensorDescription(
        key="t22_zone2", data_key="t22_zone2", name="Zonentemperatur OG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    # soll_zone1 / soll_zone2 entfernt – wird von den Climate-Entitäten (Zone 1 / NBE) angezeigt
    ProxonSensorDescription(
        key="temp_hbde", data_key="temp_hbde", name="Temperatur HBDE",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="temp_hnbe", data_key="temp_hnbe", name="Temperatur HNBE",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),

    # Compressor
    ProxonSensorDescription(
        key="kompressor_leistung", data_key="kompressor_leistung", name="Kompressor Leistung",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        icon="mdi:heat-pump",
    ),
    ProxonSensorDescription(
        key="kompressor_drehzahl", data_key="kompressor_drehzahl", name="Kompressor Drehzahl",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=REVOLUTIONS_PER_MINUTE,
        icon="mdi:rotate-right",
    ),

    # Ventilation
    ProxonSensorDescription(
        key="drehzahl_zuluft", data_key="drehzahl_zuluft", name="Drehzahl Zuluft",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=REVOLUTIONS_PER_MINUTE,
        icon="mdi:fan",
    ),
    ProxonSensorDescription(
        key="drehzahl_abluft", data_key="drehzahl_abluft", name="Drehzahl Abluft",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=REVOLUTIONS_PER_MINUTE,
        icon="mdi:fan",
    ),
    ProxonSensorDescription(
        key="luftmenge_m3h", data_key="luftmenge_m3h", name="Luftmenge",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement="m³/h",
        icon="mdi:air-filter",
    ),
    ProxonSensorDescription(
        key="druckventilator_pa", data_key="druckventilator_pa", name="Druckventilator P18",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement="Pa",
        icon="mdi:gauge",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="stufe_abluft", data_key="stufe_abluft", name="Ventilator Stufe Abluft",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:fan",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="t9_aussenluft", data_key="t9_aussenluft", name="Temperatur T09 Außenluft vor EWT",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
    ),

    # Power
    ProxonSensorDescription(
        key="power_pcb", data_key="power_pcb", name="Leistung PCB",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="power_fu", data_key="power_fu", name="Leistung FU",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="power_total", data_key="power_total", name="Leistung Gesamt",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),

    # JAZ / COP — always 0 in firmware 73.73 (no heat meter configured)
    ProxonSensorDescription(
        key="jaz_komp_1h", data_key="jaz_komp_1h", name="JAZ Kompressor (1h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="jaz_komp_24h", data_key="jaz_komp_24h", name="JAZ Kompressor (24h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="jaz_total_1h", data_key="jaz_total_1h", name="JAZ Gesamt (1h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="jaz_total_24h", data_key="jaz_total_24h", name="JAZ Gesamt (24h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
        entity_registry_enabled_default=False,
    ),

    # Air quality
    ProxonSensorDescription(
        key="co2_sensor1", data_key="co2_sensor1", name="CO₂",
        device_class=SensorDeviceClass.CO2,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=CONCENTRATION_PARTS_PER_MILLION,
    ),
    ProxonSensorDescription(
        key="rf_sensor1", data_key="rf_sensor1", name="Relative Feuchte",
        device_class=SensorDeviceClass.HUMIDITY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
    ),

    # Thresholds (holding register config values, not live measurements)
    ProxonSensorDescription(
        key="wp_einschaltschwelle", data_key="wp_einschaltschwelle", name="WP Einschaltschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="wp_ausschaltschwelle", data_key="wp_ausschaltschwelle", name="WP Ausschaltschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="wp_kuehlschwelle", data_key="wp_kuehlschwelle", name="WP Kühlschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
    ),

    # ── T300 Warmwasser-Wärmepumpe ──────────────────────────────────────
    ProxonSensorDescription(
        key="t300_t5_vorverdampfer", data_key="t300_t5_vorverdampfer", name="Temperatur T05 VorVerdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t6_verdampfer", data_key="t300_t6_verdampfer", name="Temperatur T06 Verdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t20_behaelter_unten", data_key="t300_t20_behaelter_unten", name="Temperatur T20 Behälter Unten",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t21_behaelter_mitte", data_key="t300_t21_behaelter_mitte", name="Temperatur T21 Behälter Mitte",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t13_kompressor", data_key="t300_t13_kompressor", name="Temperatur T13 Kompressor",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t11_sauggas", data_key="t300_t11_sauggas", name="Temperatur T11 Sauggas",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_t9_extern", data_key="t300_t9_extern", name="Temperatur T09 Extern",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_behaelter_avg", data_key="t300_behaelter_avg", name="Behälter Ø",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_solltemperatur_akt", data_key="t300_solltemperatur_akt", name="Aktueller Sollwert",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_ventilator_pct", data_key="t300_ventilator_pct", name="Ventilator",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        icon="mdi:fan",
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_ventilator_rpm", data_key="t300_ventilator_rpm", name="Ventilator RPM",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=REVOLUTIONS_PER_MINUTE,
        icon="mdi:fan",
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_solltemperatur", data_key="t300_solltemperatur", name="Solltemperatur",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),
    ProxonSensorDescription(
        key="t300_temp_eheiz", data_key="t300_temp_eheiz", name="Temperatur E-Heiz",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_registry_enabled_default=False,
        device=DEVICE_T300,
    ),

    # Filter + Betriebsstunden
    ProxonSensorDescription(
        key="umluft_betriebsstunden", name="Umluft Betriebsstunden",
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement="h",
        icon="mdi:rotate-3d-variant",
        entity_registry_enabled_default=False,
    ),
    ProxonSensorDescription(
        key="geraetefilter_stunden", data_key="geraetefilter_stunden", name="Gerätefilter Betriebsstunden",
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement="h",
        icon="mdi:air-filter",
    ),
    ProxonSensorDescription(
        key="geraetefilter_remaining_days", data_key="geraetefilter_remaining_days",
        name="Gerätefilter verbleibende Tage",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement="d",
        icon="mdi:air-filter",
    ),
    ProxonSensorDescription(
        key="fwt_betriebsstunden", data_key="fwt_betriebsstunden", name="Betriebsstunden gesamt",
        state_class=SensorStateClass.TOTAL_INCREASING,
        native_unit_of_measurement="h",
        icon="mdi:heat-pump",
    ),

)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    rooms: list[dict] = entry.data.get(CONF_ROOMS, [])

    # One temperature sensor per discovered NBE room (physical_idx is not None).
    nbe_sensors = [
        ProxonSensor(
            coordinator,
            ProxonSensorDescription(
                key=f"nbe_temp_{room['physical_idx']}",
                data_key=f"nbe_temp_{room['physical_idx']}",
                name=f"Temperatur {room['name']}",
                device_class=SensorDeviceClass.TEMPERATURE,
                state_class=SensorStateClass.MEASUREMENT,
                native_unit_of_measurement=UnitOfTemperature.CELSIUS,
                entity_registry_enabled_default=False,  # in climate.room current_temperature
            ),
        )
        for room in rooms
        if room.get("physical_idx") is not None
    ]
    sensors = [
        ProxonSensor(coordinator, desc)
        for desc in SENSORS
        if coordinator.has_t300 or desc.device != DEVICE_T300
    ]
    async_add_entities(sensors + nbe_sensors)


class ProxonSensor(ProxonEntity, SensorEntity):
    """A Proxon sensor entity."""

    entity_description: ProxonSensorDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonSensorDescription,
    ) -> None:
        super().__init__(coordinator, description.key, description.device)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        data_key = self.entity_description.data_key or self.entity_description.key
        return self.coordinator.data.get(data_key)
