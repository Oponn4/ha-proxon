/**
 * Proxon FWT plant schematic.
 *
 * Geometry ported 1:1 from the former generator proxon-schema/fwt_compact.py.
 * That script wrote two static SVG files to /config/www and the dashboard
 * switched between them with conditional cards; here the same drawing is a
 * render function, so plant state is a branch instead of a second file.
 */
import { svg, SVGTemplateResult, nothing } from "lit";
import type { EntityMap, HassLike } from "./entities";

const C_FRAME = "#306291";
const C_FILL = "#E2E8F2";
const C_GREEN = "#8DC63F";
const C_ORANGE = "#F3B229";
const C_BROWN = "#79593A";
const C_RED = "#D62631";
const C_TEXT = "#1A1A1A";
const C_GREY = "#7A7A7A";
const C_OFF = "#C3CEDE";

export const W = 1600;
export const H = 900;
const GX0 = 210, GY0 = 120, GX1 = 1390, GY1 = 800;
const WALL = 22;
const Y_TOP = 315, Y_BOT = 605;
const BAND = 62;
const HB = BAND / 2;
const WT_CX = 800, WT_CY = 460, WT_R = 168;
const FAN_L = 450, FAN_R = 1150, FAN_RAD = 42;
const PRE_X = 350;
const EVAP_X = 350, COND_X = 1250;
const CIRC_Y = 725;
const COMP_X = 900;
const BP_X_IN = 590, BP_Y = 690, BP_X_OUT = 1030;
const X_A = 240, X_B = 1360;

const X_L = WT_CX - WT_R;
const X_R = WT_CX + WT_R;
const S1 = Math.round(((X_L - X_A) / (X_B - X_A)) * 100);
const S2 = Math.round(((X_R - X_A) / (X_B - X_A)) * 100);

type Pt = [number, number];

const path = (points: Pt[]) => "M " + points.map(([x, y]) => `${x},${y}`).join(" L ");

function chevrons(x: number, y: number, toRight: boolean, count = 2, gap = 36) {
  const w = toRight ? 21 : -21;
  const h = 19;
  const out: SVGTemplateResult[] = [];
  for (let i = 0; i < count; i++) {
    const cx = x + (toRight ? i * gap : -i * gap);
    out.push(svg`<path d="M ${cx - w},${y - h} L ${cx},${y} L ${cx - w},${y + h}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return out;
}

function way(points: Pt[], stroke: string, id?: string, opacity = 1.0) {
  return svg`<path id=${id ?? nothing} d=${path(points)} fill="none" stroke=${stroke}
    stroke-width=${BAND} stroke-linejoin="round" stroke-linecap="butt" opacity=${opacity}/>`;
}

function plate(x: number, y0: number, y1: number, id: string) {
  return svg`<g id=${id}>
    <rect x=${x - 14} y=${y0} width="28" height=${y1 - y0} fill="#FFFFFF" stroke=${C_FRAME} stroke-width="6"/>
    <line x1=${x} y1=${y0} x2=${x} y2=${y1} stroke=${C_FRAME} stroke-width="4"/>
  </g>`;
}

/**
 * Fan symbol. `dur` drives the blade rotation; undefined means the fan is off
 * and the symbol stays put.
 */
function fan(cx: number, id: string, dur?: number) {
  const r = FAN_RAD, cy = Y_TOP, q = r * 0.5;
  const blades = svg`<path d="M ${cx - r * 0.78},${cy} A ${q} ${q} 0 0 1 ${cx},${cy}
      A ${q} ${q} 0 0 0 ${cx + r * 0.78},${cy}" fill="none" stroke=${C_FRAME}
      stroke-width=${Math.round(r * 0.14 * 10) / 10} stroke-linecap="round">
      ${dur === undefined
        ? nothing
        : svg`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${cx} ${cy}`} to=${`360 ${cx} ${cy}`} dur=${`${dur}s`} repeatCount="indefinite"/>`}
    </path>`;
  return svg`<g id=${id}>
    <circle cx=${cx} cy=${cy} r=${r} fill="#FFFFFF" fill-opacity="0.6" stroke=${C_FRAME}
      stroke-width=${Math.round(r * 0.16 * 10) / 10}/>
    ${blades}
  </g>`;
}

/**
 * Flow dots travelling along an existing duct path, the technique
 * power-flow-card-plus uses: animateMotion bound to the visible path with
 * mpath, so the geometry is never duplicated. `href` is SVG2, `xlink:href`
 * keeps older WebKit happy.
 */
function flowDots(pathId: string, dur: number, count = 4, color = "#FFFFFF") {
  const dots: SVGTemplateResult[] = [];
  for (let i = 0; i < count; i++) {
    dots.push(svg`<circle r="9" fill=${color} opacity="0.75">
      <animateMotion dur=${`${dur}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(dur / count) * i}s`}>
        <mpath href=${`#${pathId}`} xlink:href=${`#${pathId}`}/>
      </animateMotion>
    </circle>`);
  }
  return dots;
}

export interface FwtCtx {
  hass: HassLike;
  map: EntityMap;
  animate: boolean;
  /** Multiplier on all animation rates. 1 = default, 0.5 = half speed. */
  speed: number;
  onEntityClick: (entityId: string) => void;
}

const num = (hass: HassLike, id?: string): number | undefined => {
  if (!id) return undefined;
  const v = Number(hass.states[id]?.state);
  return Number.isFinite(v) ? v : undefined;
};

function formatState(hass: HassLike, id?: string): string {
  if (!id) return "–";
  const st = hass.states[id];
  if (!st) return "–";
  if (hass.formatEntityState) return hass.formatEntityState(st);
  const unit = st.attributes?.unit_of_measurement;
  return unit ? `${st.state} ${unit}` : String(st.state);
}

/**
 * Fan speed -> seconds per animation cycle, same linear mapping
 * power-flow-card-plus applies to power: more throughput, shorter duration.
 *
 * Deliberately unhurried: a schematic that is glanced at on a wall tablet
 * should read as "air is moving", not flicker. Divide by `speed` so a larger
 * multiplier means faster.
 */
function flowDuration(pct: number | undefined, speed: number, min = 3.5, max = 10): number {
  const base = pct === undefined || pct <= 0
    ? max
    : max - (Math.min(100, Math.max(0, pct)) / 100) * (max - min);
  return base / speed;
}

const VALUES: Array<{
  key: keyof EntityMap;
  x: number;
  y: number;
  color: string;
  size: "core" | "detail";
  prefix?: string;
}> = [
  { key: "t3_frischluft", x: 120, y: Y_TOP + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: Y_BOT + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: Y_TOP + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: Y_BOT + 22, color: "red", size: "core" },
  { key: "betriebsart", x: 800, y: 165, color: "#1f4e79", size: "core" },
  { key: "lueftung", x: 800, y: 225, color: "dimgray", size: "detail" },
  { key: "geraetefilter_remaining_days", x: 430, y: 195, color: "dimgray", size: "core", prefix: "Filter " },
  { key: "power_total", x: 1250, y: 165, color: "#1f4e79", size: "core" },
  { key: "rf_sensor1", x: 1250, y: 225, color: "dimgray", size: "detail" },
  { key: "drehzahl_zuluft", x: FAN_L, y: 420, color: "dimgray", size: "detail" },
  { key: "drehzahl_abluft", x: FAN_R, y: 420, color: "dimgray", size: "detail" },
  { key: "kompressor_drehzahl", x: 350, y: 855, color: "dimgray", size: "detail" },
  { key: "kompressor_leistung", x: 620, y: 855, color: "dimgray", size: "detail" },
  { key: "t13_kompressor", x: 880, y: 855, color: "darkred", size: "detail" },
  { key: "bypass_min_frischluft", x: 1130, y: 855, color: "dimgray", size: "detail" },
];

export function renderFwt(ctx: FwtCtx): SVGTemplateResult {
  const { hass, map, animate } = ctx;

  const bypassOpen = hass.states[map.bypass_offen ?? ""]?.state === "on";
  const fanState = hass.states[map.lueftung ?? ""];
  const fanOn = fanState?.state === "on";
  const fanPct = fanState?.attributes?.percentage as number | undefined;
  const compressorRpm = num(hass, map.kompressor_drehzahl);

  const flapAngle = bypassOpen ? 0 : 90;
  const bpFill = bypassOpen ? C_GREEN : C_OFF;
  const bpOp = bypassOpen ? 1.0 : 0.6;
  const wtOp = bypassOpen ? 0.18 : 1.0;

  const dur = flowDuration(fanOn ? (fanPct ?? 50) : undefined, ctx.speed);
  const dotsOn = animate && fanOn;
  // Blades turn slower than the dots travel; a blurred fan reads as noise.
  const bladeDur = dur / 2;

  const supply: Pt[] = [[X_A, Y_TOP], [X_L, Y_TOP], [X_R, Y_BOT], [X_B, Y_BOT]];
  const gap = HB + 14;

  return svg`
    <svg viewBox=${`0 0 ${W} ${H}`} id="proxon-fwt" data-bypass=${bypassOpen ? "open" : "closed"}
         style=${`aspect-ratio: ${W} / ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${X_A} y1="0" x2=${X_B} y2="0">
          <stop offset="0%" stop-color=${C_GREEN}/><stop offset=${`${S1}%`} stop-color=${C_GREEN}/>
          <stop offset=${`${S2}%`} stop-color=${C_RED}/><stop offset="100%" stop-color=${C_RED}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${X_B} y1="0" x2=${X_A} y2="0">
          <stop offset="0%" stop-color=${C_ORANGE}/><stop offset=${`${S1}%`} stop-color=${C_ORANGE}/>
          <stop offset=${`${S2}%`} stop-color=${C_BROWN}/><stop offset="100%" stop-color=${C_BROWN}/>
        </linearGradient>
      </defs>

      <rect id="backdrop" width=${W} height=${H} fill="#FFFFFF"/>
      <rect id="case" x=${GX0} y=${GY0} width=${GX1 - GX0} height=${GY1 - GY0} rx="12"
        fill=${C_FILL} stroke=${C_FRAME} stroke-width=${WALL}/>

      <g id="flow-extract-exhaust">
        ${way([[X_B, Y_TOP], [X_R, Y_TOP], [X_L, Y_BOT], [X_A, Y_BOT]], "url(#gradExhaust)", "flow-exhaust")}
        ${chevrons(1325, Y_TOP, false)}
        ${chevrons(300, Y_BOT, false)}
        ${dotsOn ? flowDots("flow-exhaust", dur) : nothing}
      </g>

      <g id="flow-fresh-supply">
        ${way(supply, "url(#gradSupply)", "flow-supply", wtOp)}
        ${bypassOpen
          ? svg`${way([[X_A, Y_TOP], [BP_X_IN, Y_TOP]], C_GREEN, "flow-fresh-active")}
                ${way([[BP_X_OUT, Y_BOT], [X_B, Y_BOT]], C_RED, "flow-supply-active")}`
          : nothing}
        ${chevrons(275, Y_TOP, true)}
        ${chevrons(1305, Y_BOT, true)}
        ${dotsOn ? flowDots("flow-supply", dur) : nothing}
      </g>

      <polygon id="heat-exchanger"
        points=${`${WT_CX},${WT_CY - WT_R} ${WT_CX + WT_R},${WT_CY} ${WT_CX},${WT_CY + WT_R} ${WT_CX - WT_R},${WT_CY}`}
        fill="none" stroke=${C_FRAME} stroke-width="10"/>

      <g id="bypass" data-state=${bypassOpen ? "open" : "closed"}>
        ${[
          path([[BP_X_IN, Y_TOP + HB], [BP_X_IN, Y_BOT - gap]]),
          path([[BP_X_IN, Y_BOT + gap], [BP_X_IN, BP_Y], [BP_X_OUT, BP_Y], [BP_X_OUT, Y_BOT + HB]]),
        ].map(
          (d, i) => svg`
            <path id=${i === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${d} fill="none"
              stroke=${bpFill} stroke-width=${BAND} stroke-linejoin="round" opacity=${bpOp}/>
            <path d=${d} fill="none" stroke=${C_FRAME} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`,
        )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${flapAngle} ${BP_X_IN} ${Y_TOP + HB})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${BP_X_IN - 9} y=${Y_TOP + HB - BAND / 2 - 8} width="18" height=${BAND + 16} rx="9"
            fill=${C_FRAME} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${BP_X_IN} cy=${Y_TOP + HB} r="10" fill=${C_TEXT} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${fan(FAN_L, "fan-supply", animate && fanOn ? bladeDur : undefined)}
      ${fan(FAN_R, "fan-extract", animate && fanOn ? bladeDur : undefined)}
      ${plate(PRE_X, Y_TOP - 95, Y_TOP + 95, "preheater")}
      ${plate(EVAP_X, Y_BOT - 110, 700, "evaporator")}
      ${plate(COND_X, Y_BOT - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${EVAP_X} y1=${CIRC_Y} x2=${COND_X} y2=${CIRC_Y}
        stroke=${C_FRAME} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${EVAP_X} y1="700" x2=${EVAP_X} y2=${CIRC_Y} stroke=${C_FRAME} stroke-width="7"/>
      <line x1=${COND_X} y1="700" x2=${COND_X} y2=${CIRC_Y} stroke=${C_FRAME} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${COMP_X} cy=${CIRC_Y} r="40" fill="#FFFFFF" stroke=${C_FRAME} stroke-width="9"/>
        <g>
          <path d=${`M ${COMP_X - 30},${CIRC_Y - 15} L ${COMP_X + 28},${CIRC_Y - 7} L ${COMP_X},${CIRC_Y} Z`}
            fill=${C_FRAME}/>
          ${animate && compressorRpm
            ? svg`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${COMP_X} ${CIRC_Y}`} to=${`360 ${COMP_X} ${CIRC_Y}`}
                dur=${`${Math.max(1.2, 240 / compressorRpm) / ctx.speed}s`} repeatCount="indefinite"/>`
            : nothing}
        </g>
        <circle cx=${COMP_X} cy=${CIRC_Y} r="7" fill=${C_TEXT}/>
      </g>

      ${([
        ["Frischluft", 120, Y_TOP - 30],
        ["Fortluft", 120, Y_BOT - 30],
        ["Abluft", 1480, Y_TOP - 30],
        ["Zuluft", 1480, Y_BOT - 30],
      ] as Array<[string, number, number]>).map(
        ([label, x, y]) => svg`<text class="port" x=${x} y=${y} text-anchor="middle">${label}</text>`,
      )}

      <text id="bypass-label" class="bp" x=${(BP_X_IN + BP_X_OUT) / 2} y=${BP_Y - 46}
        text-anchor="middle" fill=${bypassOpen ? "#4C8C1B" : C_GREY}>
        ${bypassOpen ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${VALUES.map((v) => {
        const entityId = map[v.key];
        return svg`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => entityId && ctx.onEntityClick(entityId)}
          style=${entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${(v.prefix ?? "") + formatState(hass, entityId)}
        </text>`;
      })}
    </svg>`;
}
