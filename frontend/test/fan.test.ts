// Run in frontend/: node --experimental-strip-types --test test/fan.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { animationLoadPct, fanLevelApplies, levelFromPct, FAN_RPM_MAX } from "../src/fan.ts";

test("fan level is shown only in the ECO modes", () => {
  assert.equal(fanLevelApplies("Sommerbetrieb"), true);
  assert.equal(fanLevelApplies("Winterbetrieb"), true);
  // Comfort mode: the plant regulates by heating load, register 22 is idle.
  assert.equal(fanLevelApplies("Komfortbetrieb"), false);
  assert.equal(fanLevelApplies("Ofenmodus"), false);
  assert.equal(fanLevelApplies("Aus"), false);
  assert.equal(fanLevelApplies(undefined), false);
});

test("percentage maps back to Proxon level 1-4", () => {
  assert.equal(levelFromPct(25), 1);
  assert.equal(levelFromPct(50), 2);
  assert.equal(levelFromPct(75), 3);
  assert.equal(levelFromPct(100), 4);
  assert.equal(levelFromPct(0), undefined);
  assert.equal(levelFromPct(undefined), undefined);
});

test("animation follows measured rpm, not the stored level", () => {
  // Situation of 2026-11-21: register 22 at level 4 (100 %), fan at 1872 rpm.
  const load = animationLoadPct(1872, true, 100);
  assert.ok(load !== undefined && Math.abs(load - (1872 / FAN_RPM_MAX) * 100) < 1e-9);
  assert.ok(load! < 100, "level 4 must not drive the animation to full speed");
  // Standing fans stop the animation even if the entity says on.
  assert.equal(animationLoadPct(0, true, 100), undefined);
  // Above the calibration point it saturates.
  assert.equal(animationLoadPct(3500, true, 25), 100);
});

test("without rpm sensor the fan percentage stays the fallback", () => {
  assert.equal(animationLoadPct(undefined, true, 75), 75);
  assert.equal(animationLoadPct(undefined, true, undefined), 50);
  assert.equal(animationLoadPct(undefined, false, 75), undefined);
});
