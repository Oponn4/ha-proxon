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

from .const import DOMAIN
from .coordinator import ProxonCoordinator
from .entity import ProxonEntity


@dataclass(frozen=True, kw_only=True)
class ProxonSensorDescription(SensorEntityDescription):
    """Extended sensor description with the coordinator data key."""
    data_key: str


SENSORS: tuple[ProxonSensorDescription, ...] = (
    # Temperatures
    ProxonSensorDescription(
        key="t1_zuluft", data_key="t1_zuluft", name="T1 Zuluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t3_frischluft", data_key="t3_frischluft", name="T3 Frischluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t4_fortluft", data_key="t4_fortluft", name="T4 Fortluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t5_vorverdampfer", data_key="t5_vorverdampfer", name="T5 VorVerdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t6_verdampfer", data_key="t6_verdampfer", name="T6 Verdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t7_abluft", data_key="t7_abluft", name="T7 Abluft",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t13_kompressor", data_key="t13_kompressor", name="T13 Kompressor",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t21_zone1", data_key="t21_zone1", name="Zonentemperatur EG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t22_zone2", data_key="t22_zone2", name="Zonentemperatur OG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="soll_zone1", data_key="soll_zone1", name="Solltemperatur EG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="soll_zone2", data_key="soll_zone2", name="Solltemperatur OG",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
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

    # Power
    ProxonSensorDescription(
        key="power_pcb", data_key="power_pcb", name="Leistung PCB",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    ProxonSensorDescription(
        key="power_fu", data_key="power_fu", name="Leistung FU",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    ProxonSensorDescription(
        key="power_total", data_key="power_total", name="Leistung Gesamt",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),

    # JAZ / COP
    ProxonSensorDescription(
        key="jaz_komp_1h", data_key="jaz_komp_1h", name="JAZ Kompressor (1h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
    ),
    ProxonSensorDescription(
        key="jaz_komp_24h", data_key="jaz_komp_24h", name="JAZ Kompressor (24h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
    ),
    ProxonSensorDescription(
        key="jaz_total_1h", data_key="jaz_total_1h", name="JAZ Gesamt (1h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
    ),
    ProxonSensorDescription(
        key="jaz_total_24h", data_key="jaz_total_24h", name="JAZ Gesamt (24h)",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:gauge",
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

    # Thresholds (from holding registers, read-only display)
    ProxonSensorDescription(
        key="wp_einschaltschwelle", data_key="wp_einschaltschwelle", name="WP Einschaltschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="wp_ausschaltschwelle", data_key="wp_ausschaltschwelle", name="WP Ausschaltschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="wp_kuehlschwelle", data_key="wp_kuehlschwelle", name="WP Kühlschwelle",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),

    # ── T300 Warmwasser-Wärmepumpe ──────────────────────────────────────
    ProxonSensorDescription(
        key="t300_t5_vorverdampfer", data_key="t300_t5_vorverdampfer", name="T300 T5 VorVerdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t6_verdampfer", data_key="t300_t6_verdampfer", name="T300 T6 Verdampfer",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t20_behaelter_unten", data_key="t300_t20_behaelter_unten", name="T300 T20 Behälter Unten",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t21_behaelter_mitte", data_key="t300_t21_behaelter_mitte", name="T300 T21 Behälter Mitte",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t13_kompressor", data_key="t300_t13_kompressor", name="T300 T13 Kompressor",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t11_sauggas", data_key="t300_t11_sauggas", name="T300 T11 Sauggas",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_t9_extern", data_key="t300_t9_extern", name="T300 T9 Extern",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_behaelter_avg", data_key="t300_behaelter_avg", name="T300 Behälter Ø",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_solltemperatur_akt", data_key="t300_solltemperatur_akt", name="T300 Aktueller Sollwert",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_ventilator_pct", data_key="t300_ventilator_pct", name="T300 Ventilator",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        icon="mdi:fan",
    ),
    ProxonSensorDescription(
        key="t300_ventilator_rpm", data_key="t300_ventilator_rpm", name="T300 Ventilator RPM",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=REVOLUTIONS_PER_MINUTE,
        icon="mdi:fan",
    ),
    # T300 Solltemperatur (from holding register, for display)
    ProxonSensorDescription(
        key="t300_solltemperatur", data_key="t300_solltemperatur", name="T300 Solltemperatur",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
    ProxonSensorDescription(
        key="t300_temp_eheiz", data_key="t300_temp_eheiz", name="T300 Temperatur E-Heiz",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: ProxonCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(ProxonSensor(coordinator, desc) for desc in SENSORS)


class ProxonSensor(ProxonEntity, SensorEntity):
    """A Proxon sensor entity."""

    entity_description: ProxonSensorDescription

    def __init__(
        self,
        coordinator: ProxonCoordinator,
        description: ProxonSensorDescription,
    ) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get(self.entity_description.data_key)
