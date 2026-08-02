/**
 * Entity resolution for the Proxon card.
 *
 * The card is configured with a device_id only. Everything else is resolved by
 * `translation_key`, which the integration sets to its own unique_suffix. That
 * key is part of the entity registry's *display* data, which the frontend
 * already holds in `hass.entities` -- so resolution is synchronous and costs no
 * websocket round trip.
 *
 * Resolving by key rather than entity_id means the card survives entity_id
 * renames, friendly-name changes and area moves.
 *
 * Older installs that have not restarted since the integration gained
 * translation keys fall back to matching the unique_id tail, which needs the
 * full registry over the wire.
 *
 * Either way matching is scoped to one device first -- that is what keeps
 * `betriebsart` (FWT) apart from `t300_betriebsart` (T300).
 */

export interface RegistryEntry {
  entity_id: string;
  device_id: string | null;
  platform: string;
  unique_id: string;
  disabled_by: string | null;
}

export interface HassLike {
  states: Record<string, any>;
  devices?: Record<string, any>;
  entities?: Record<string, any>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  formatEntityState?(stateObj: any): string;
  localize?(key: string): string;
}

/** Keys the FWT schematic needs. Missing ones degrade to a blank label. */
export const FWT_KEYS = [
  "t1_zuluft",
  "t3_frischluft",
  "t4_fortluft",
  "t7_abluft",
  "t13_kompressor",
  "betriebsart",
  "lueftung",
  "geraetefilter_remaining_days",
  "power_total",
  "rf_sensor1",
  "drehzahl_zuluft",
  "drehzahl_abluft",
  "kompressor_drehzahl",
  "kompressor_leistung",
  "bypass_offen",
  "bypass_min_frischluft",
  "kuehlung_freigabe",
  // Reversing valve = the plant is actually cooling. Disabled by default in
  // the integration, so the card must cope with it being absent.
  "vierwege_ventil",
] as const;

/** Keys the T300 schematic needs. */
export const T300_KEYS = [
  "t300_betriebsart",
  "t300_behaelter_avg",
  "t300_solltemperatur_akt",
  "t300_temp_eheiz",
  "t300_t20_behaelter_unten",
  "t300_t21_behaelter_mitte",
  "t300_ventilator_pct",
  "t300_ventilator_rpm",
  "t300_kompressor_aktiv",
  "t300_eheiz_aktiv",
  "t300_abtau_aktiv",
  "t300_solar_aktiv",
] as const;

export type ProxonKey = (typeof FWT_KEYS)[number] | (typeof T300_KEYS)[number];
export type EntityMap = Partial<Record<ProxonKey, string>>;

/** Which schematic a device gets, derived from the model the integration sets. */
export type Variant = "fwt" | "t300";

export function keysFor(variant: Variant): readonly string[] {
  return variant === "t300" ? T300_KEYS : FWT_KEYS;
}

export function variantForDevice(hass: HassLike, deviceId: string): Variant | undefined {
  const model = (hass.devices ?? {})[deviceId]?.model;
  if (model === "T300") return "t300";
  if (model === "FWT 2.0") return "fwt";
  return undefined;
}

/**
 * Build key -> entity_id for one device.
 *
 * Longest tail match wins so that a key which is a suffix of another key
 * cannot steal the shorter one's entity.
 */
export function mapByUniqueIdTail(
  entries: RegistryEntry[],
  deviceId: string,
  keys: readonly string[],
): EntityMap {
  const scoped = entries.filter(
    (e) => e.device_id === deviceId && e.platform === "proxon" && !e.disabled_by,
  );
  const map: EntityMap = {};
  for (const key of keys) {
    const suffix = `_${key}`;
    const hit = scoped.find((e) => e.unique_id.endsWith(suffix));
    if (hit) map[key as ProxonKey] = hit.entity_id;
  }
  return map;
}

/** Preferred path: translation_key straight out of the display registry. */
export function mapByTranslationKey(
  hass: HassLike,
  deviceId: string,
  keys: readonly string[],
): EntityMap {
  const map: EntityMap = {};
  const wanted = new Set<string>(keys);
  for (const entry of Object.values(hass.entities ?? {}) as any[]) {
    if (entry.device_id !== deviceId || entry.platform !== "proxon") continue;
    const key = entry.translation_key;
    if (key && wanted.has(key)) map[key as ProxonKey] = entry.entity_id;
  }
  return map;
}

export async function resolveEntities(
  hass: HassLike,
  deviceId: string,
  variant: Variant,
): Promise<EntityMap> {
  const keys = keysFor(variant);
  const fast = mapByTranslationKey(hass, deviceId, keys);
  if (Object.keys(fast).length) return fast;

  // Integration predates translation keys, or HA has not restarted since the
  // upgrade. Pay for the full registry once rather than render an empty card.
  const entries = await hass.callWS<RegistryEntry[]>({
    type: "config/entity_registry/list",
  });
  return mapByUniqueIdTail(entries, deviceId, keys);
}

/**
 * Pick a device when the card config does not name one. Only unambiguous when
 * a single matching Proxon device exists; otherwise the user must configure it.
 */
export function guessDevice(hass: HassLike, variant: Variant = "fwt"): string | undefined {
  const model = variant === "t300" ? "T300" : "FWT 2.0";
  const devices = Object.values(hass.devices ?? {}) as any[];
  const proxon = devices.filter(
    (d) => (d.identifiers ?? []).some((i: string[]) => i[0] === "proxon") && d.model === model,
  );
  return proxon.length === 1 ? proxon[0].id : undefined;
}
