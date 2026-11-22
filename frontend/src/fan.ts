/**
 * What the FWT schematic may say about the fans.
 *
 * The fan entity reports holding register 22 ("Lüfterstufe"). Per the register
 * list that level only applies in ECO summer, ECO winter and test mode. In
 * comfort mode the plant drives the fans itself from the heating load
 * (condenser temperature, menu B03/B04), so the register is a stored value
 * for the next ECO switch, not the running speed. Measured 2026-11-21: the
 * register went from 1 to 4 while the supply fan stayed at ~1700-1890 rpm.
 *
 * Hence two separate questions:
 *  - Is the level worth showing at all?  -> only in the ECO modes.
 *  - How fast should the animation run?  -> from the measured fan speed.
 *
 * Kept free of lit so it runs under plain Node in tests.
 */

/** Operating modes (select state) in which register 22 sets the fan speed. */
export const FAN_LEVEL_MODES: ReadonlySet<string> = new Set(["Sommerbetrieb", "Winterbetrieb"]);

/**
 * Supply fan speed treated as 100 % for the animation. Highest monthly maximum
 * in the long-term statistics May-Nov 2026 was 2924 rpm; the floor at level 1
 * sits around 1260 rpm.
 */
export const FAN_RPM_MAX = 2900;

export function fanLevelApplies(mode: string | undefined): boolean {
  return mode !== undefined && FAN_LEVEL_MODES.has(mode);
}

/** Fan entity percentage (25 % steps) -> Proxon level 1-4. */
export function levelFromPct(pct: number | undefined): number | undefined {
  if (pct === undefined || !Number.isFinite(pct) || pct <= 0) return undefined;
  return Math.max(1, Math.min(4, Math.round(pct / 25)));
}

/**
 * Load in percent for the animation, or undefined for "fans stand still".
 * Measured speed wins; the fan percentage is only a fallback for setups
 * without the rpm sensor.
 */
export function animationLoadPct(
  rpm: number | undefined,
  fanOn: boolean,
  fanPct: number | undefined,
): number | undefined {
  if (rpm !== undefined) {
    if (rpm <= 0) return undefined;
    return Math.min(100, (rpm / FAN_RPM_MAX) * 100);
  }
  return fanOn ? (fanPct ?? 50) : undefined;
}
