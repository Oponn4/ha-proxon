/**
 * Proxon T300 plant schematic -- domestic hot water heat pump on a 300 l tank.
 *
 * Geometry ported 1:1 from the former generator proxon-schema/t300_svg.py.
 * Portrait, because that is how the unit is built: the heat pump module sits
 * directly on the tank, one continuous silhouette.
 *
 * The running/idle split that used to be two generated files is a branch here,
 * driven by the compressor binary sensor.
 */
import { svg, SVGTemplateResult, nothing } from "lit";
import type { EntityMap, HassLike } from "./entities";

const C_FRAME = "#306291";
const C_FILL = "#E2E8F2";
const C_ORANGE = "#F3B229";
const C_RED = "#D62631";
const C_BLUE = "#3E8FD0";
const C_TEXT = "#1A1A1A";
const C_OFF = "#C3CEDE";

export const W = 1000;
export const H = 1500;
const BAND = 54;
const WALL = 20;

const DEV_X0 = 210, DEV_X1 = 790;
const WP_Y0 = 90, WP_Y1 = 520;
const TK_Y0 = 520, TK_Y1 = 1430;
const DEV_CX = (DEV_X0 + DEV_X1) / 2;

const Y_AIR_IN = 205, Y_AIR_OUT = 400;
const FAN_X = 330, FAN_RAD = 38;
const EVAP_Y = 300;
const COMP_X = 640, COMP_Y = 455;

const HEATER_Y = 760;
const T21_Y = 900, T20_Y = 1060;
const COIL_Y0 = 1140, COIL_Y1 = 1360;

type Pt = [number, number];
const d = (points: Pt[]) => "M " + points.map(([x, y]) => `${x},${y}`).join(" L ");

function bandPath(points: Pt[], stroke: string, id: string, opacity = 1.0) {
  return svg`<path id=${id} d=${d(points)} fill="none" stroke=${stroke} stroke-width=${BAND}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${opacity}/>`;
}

function chevrons(x: number, y: number, toRight: boolean, count = 2, gap = 30) {
  const w = toRight ? 17 : -17;
  const h = 15;
  const out: SVGTemplateResult[] = [];
  for (let i = 0; i < count; i++) {
    const cx = x + (toRight ? i * gap : -i * gap);
    out.push(svg`<path d="M ${cx - w},${y - h} L ${cx},${y} L ${cx - w},${y + h}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return out;
}

function fan(cx: number, cy: number, id: string, color: string, dur?: number) {
  const r = FAN_RAD, q = FAN_RAD * 0.5;
  return svg`<g id=${id}>
    <circle cx=${cx} cy=${cy} r=${r} fill="#FFFFFF" fill-opacity="0.6" stroke=${color}
      stroke-width=${Math.round(r * 0.16 * 10) / 10}/>
    <path d="M ${cx - r * 0.78},${cy} A ${q} ${q} 0 0 1 ${cx},${cy}
      A ${q} ${q} 0 0 0 ${cx + r * 0.78},${cy}" fill="none" stroke=${color}
      stroke-width=${Math.round(r * 0.14 * 10) / 10} stroke-linecap="round">
      ${dur === undefined
        ? nothing
        : svg`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${cx} ${cy}`} to=${`360 ${cx} ${cy}`} dur=${`${dur}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}

/** Evaporator: horizontal finned block across the air path. */
function lamellaeH(y: number, x0: number, x1: number, id: string, color: string) {
  const step = (x1 - x0) / 7;
  const lines: SVGTemplateResult[] = [];
  for (let i = 1; i < 7; i++) {
    const xx = x0 + i * step;
    lines.push(svg`<line x1=${xx} y1=${y - 24} x2=${xx} y2=${y + 24} stroke=${color} stroke-width="3.5"/>`);
  }
  return svg`<g id=${id}>
    <rect x=${x0} y=${y - 24} width=${x1 - x0} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${color} stroke-width="5"/>
    ${lines}
  </g>`;
}

function coil(x0: number, x1: number, y0: number, y1: number, id: string, color: string) {
  const turns = 5;
  const step = (y1 - y0) / turns;
  let path = `M ${x0},${y0}`;
  for (let i = 0; i < turns; i++) {
    const yy = y0 + i * step;
    path += ` L ${x1},${yy + step * 0.45} L ${x0},${yy + step * 0.9}`;
  }
  return svg`<path id=${id} d=${path} fill="none" stroke=${color} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}

/** Flow dots along a duct, same technique as the FWT schematic. */
function flowDots(pathId: string, dur: number, count = 3, color = "#FFFFFF") {
  const dots: SVGTemplateResult[] = [];
  for (let i = 0; i < count; i++) {
    dots.push(svg`<circle r="8" fill=${color} opacity="0.75">
      <animateMotion dur=${`${dur}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(dur / count) * i}s`}>
        <mpath href=${`#${pathId}`} xlink:href=${`#${pathId}`}/>
      </animateMotion>
    </circle>`);
  }
  return dots;
}

export interface T300Ctx {
  hass: HassLike;
  map: EntityMap;
  /** Helper entities that are not part of the proxon integration. */
  extras: { power?: string; energy_daily?: string; pv_surplus?: string };
  animate: boolean;
  /** Multiplier on all animation rates. 1 = default, 0.5 = half speed. */
  speed: number;
  onEntityClick: (entityId: string) => void;
}

function formatState(hass: HassLike, id?: string): string {
  if (!id) return "–";
  const st = hass.states[id];
  if (!st) return "–";
  if (hass.formatEntityState) return hass.formatEntityState(st);
  const unit = st.attributes?.unit_of_measurement;
  return unit ? `${st.state} ${unit}` : String(st.state);
}

export function renderT300(ctx: T300Ctx): SVGTemplateResult {
  const { hass, map, extras, animate } = ctx;

  const running = hass.states[map.t300_kompressor_aktiv ?? ""]?.state === "on";
  const heaterOn = hass.states[map.t300_eheiz_aktiv ?? ""]?.state === "on";
  const defrost = hass.states[map.t300_abtau_aktiv ?? ""]?.state === "on";
  const solar = hass.states[map.t300_solar_aktiv ?? ""]?.state === "on";
  const fanPct = Number(hass.states[map.t300_ventilator_pct ?? ""]?.state);

  const airIn = running ? C_ORANGE : C_OFF;
  const airOut = running ? C_BLUE : C_OFF;
  const circ = running ? C_RED : C_OFF;
  const part = running ? C_FRAME : "#8FA3BC";
  const op = running ? 1.0 : 0.55;

  // Same mapping as the FWT card: more throughput, shorter cycle.
  const pct = Number.isFinite(fanPct) ? Math.min(100, Math.max(0, fanPct)) : 60;
  const dur = (10 - (pct / 100) * (10 - 3.5)) / ctx.speed;
  const dotsOn = animate && running;
  const bladeDur = dur / 2;

  const values: Array<{
    entityId?: string; x: number; y: number; color: string; size: "core" | "detail";
  }> = [
    { entityId: map.t300_behaelter_avg, x: DEV_CX, y: 620, color: "#B03A2E", size: "core" },
    { entityId: map.t300_solltemperatur_akt, x: DEV_CX, y: 685, color: "#1f4e79", size: "core" },
    { entityId: map.t300_temp_eheiz, x: DEV_X1 - 95, y: HEATER_Y, color: "dimgray", size: "detail" },
    { entityId: map.t300_t21_behaelter_mitte, x: DEV_X1 - 110, y: T21_Y, color: "#C0392B", size: "core" },
    { entityId: map.t300_t20_behaelter_unten, x: DEV_X1 - 110, y: T20_Y, color: "steelblue", size: "core" },
    { entityId: map.t300_betriebsart, x: DEV_CX, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: map.t300_ventilator_pct, x: FAN_X, y: 264, color: "dimgray", size: "detail" },
    { entityId: extras.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: extras.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: extras.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" },
  ];

  return svg`
    <svg viewBox=${`0 0 ${W} ${H}`} id="proxon-t300" data-state=${running ? "running" : "idle"}
         style=${`aspect-ratio: ${W} / ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${W} height=${H} fill="#FFFFFF"/>

      <rect id="tank" x=${DEV_X0} y=${TK_Y0} width=${DEV_X1 - DEV_X0} height=${TK_Y1 - TK_Y0}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${C_FRAME} stroke-width=${WALL}/>
      <path d=${`M ${DEV_X1},${TK_Y0 + 90} L ${W - 60},${TK_Y0 + 90}`} stroke=${C_RED}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${DEV_X1},${TK_Y1 - 70} L ${W - 60},${TK_Y1 - 70}`} stroke=${C_BLUE}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${W - 60} y=${TK_Y0 + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${W - 60} y=${TK_Y1 - 100} text-anchor="end">Kaltwasser</text>

      ${coil(DEV_X1 - 50, DEV_X0 + 50, COIL_Y0, COIL_Y1, "condenser-coil", circ)}

      <g id="e-heater">
        <rect x=${DEV_X0 + 50} y=${HEATER_Y - 12} width=${(DEV_X1 - DEV_X0) * 0.5} height="24" rx="12"
          fill=${heaterOn ? "#FFE3B0" : "#FFFFFF"} stroke=${heaterOn ? "#E8843C" : C_FRAME}
          stroke-width=${heaterOn ? 7 : 5}/>
        <path d=${`M ${DEV_X0 + 78},${HEATER_Y} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${heaterOn ? "#E8843C" : C_FRAME} stroke-width="4.5"/>
      </g>

      ${[[T21_Y, "T21 Mitte"], [T20_Y, "T20 unten"]].map(
        ([y, tag]) => svg`
          <circle cx=${DEV_X0 + 90} cy=${y as number} r="9" fill=${C_TEXT}/>
          <text class="tag" x=${DEV_X0 + 110} y=${(y as number) + 9}>${tag}</text>`,
      )}

      <rect id="hp-case" x=${DEV_X0} y=${WP_Y0} width=${DEV_X1 - DEV_X0} height=${WP_Y1 - WP_Y0}
        rx="24" fill=${C_FILL} fill-opacity="0.9" stroke=${C_FRAME} stroke-width=${WALL}/>

      ${bandPath([[40, Y_AIR_IN], [DEV_CX, Y_AIR_IN], [DEV_CX, EVAP_Y]], airIn, "flow-air-in", op)}
      ${bandPath([[DEV_CX, EVAP_Y], [DEV_CX, Y_AIR_OUT], [W - 40, Y_AIR_OUT]], airOut, "flow-air-out", op)}
      ${chevrons(120, Y_AIR_IN, true)}
      ${chevrons(920, Y_AIR_OUT, true)}

      ${fan(FAN_X, Y_AIR_IN, "fan-t300", part, animate && running ? bladeDur : undefined)}
      ${lamellaeH(EVAP_Y, DEV_X0 + 60, DEV_X1 - 60, "evaporator", part)}

      <g id="refrigerant" opacity=${op}>
        <path d=${`M ${DEV_X0 + 150},${EVAP_Y + 24} L ${DEV_X0 + 150},${COMP_Y} L ${COMP_X - 42},${COMP_Y}`}
          fill="none" stroke=${circ} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${COMP_X + 42},${COMP_Y} L ${DEV_X1 - 60},${COMP_Y} L ${DEV_X1 - 60},${COIL_Y0} L ${DEV_X1 - 50},${COIL_Y0}`}
          fill="none" stroke=${circ} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${DEV_X0 + 50},${COIL_Y1} L ${DEV_X0 + 26},${COIL_Y1} L ${DEV_X0 + 26},${EVAP_Y + 24} L ${DEV_X0 + 62},${EVAP_Y + 24}`}
          fill="none" stroke=${circ} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${COMP_X} cy=${COMP_Y} r="42" fill="#FFFFFF" stroke=${part} stroke-width="9"/>
        <g>
          <path d=${`M ${COMP_X - 31},${COMP_Y - 15} L ${COMP_X + 29},${COMP_Y - 7} L ${COMP_X},${COMP_Y} Z`}
            fill=${part}/>
          ${animate && running
            ? svg`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${COMP_X} ${COMP_Y}`} to=${`360 ${COMP_X} ${COMP_Y}`}
                dur=${`${1.8 / ctx.speed}s`} repeatCount="indefinite"/>`
            : nothing}
        </g>
        <circle cx=${COMP_X} cy=${COMP_Y} r="7" fill=${C_TEXT}/>
      </g>

      <!-- Same reason as on the FWT: above the lamellae block and the fan. -->
      <g id="flow-dots">
        ${dotsOn ? flowDots("flow-air-in", dur) : nothing}
        ${dotsOn ? flowDots("flow-air-out", dur) : nothing}
      </g>

      <text class="port" x="40" y=${Y_AIR_IN - 48}>Luft an</text>
      <text class="port" x=${W - 40} y=${Y_AIR_OUT + 66} text-anchor="end">Luft ab</text>

      ${defrost
        ? svg`<text class="badge" x=${DEV_CX} y=${WP_Y1 - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>`
        : nothing}
      ${solar
        ? svg`<text class="badge" x=${DEV_CX} y=${TK_Y1 + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>`
        : nothing}

      ${values.map(
        (v) => svg`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => v.entityId && ctx.onEntityClick(v.entityId)}
          style=${v.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${formatState(hass, v.entityId)}
        </text>`,
      )}
    </svg>`;
}
