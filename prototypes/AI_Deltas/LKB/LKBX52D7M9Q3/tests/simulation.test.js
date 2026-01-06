import assert from "assert";
import { test } from "node:test";
import { BiasField } from "../src/bias.js";
import { config, deltaId } from "../src/config.js";
import { PhaseLattice } from "../src/grid.js";
import { mixLens } from "../src/lens.js";
import { runSession } from "../src/runner.js";

test("BiasField pulses decay and remain bounded", () => {
  const bias = new BiasField(4, 0.5, 1.5);
  bias.applyPulse({ x: 0, y: 0, z: 0, amplitude: 1 });
  const firstAverage = bias.average();
  bias.decayField();
  const secondAverage = bias.average();
  assert.ok(firstAverage > 0.01, "pulse should raise average bias");
  assert.ok(secondAverage < firstAverage, "decay should reduce bias influence");
});

test("Lens mix clamps probabilities and damping", () => {
  const metrics = { energy: 0.5, dispersion: 0.6, biasLoad: 0.2, traceMean: 0.4 };
  const lensMix = mixLens(metrics, config);
  assert.ok(lensMix.pathBProbability >= config.pathBRange[0]);
  assert.ok(lensMix.pathBProbability <= config.pathBRange[1]);
  assert.ok(lensMix.damping <= 1 && lensMix.damping >= config.forgiveness.floor);
});

test("PhaseLattice neighbor averaging wraps toroidally", () => {
  const lattice = new PhaseLattice({ size: 2, alpha: 0.5, traceAlpha: 0.5 });
  lattice.plasma.fill(0);
  lattice.plasma[0] = 1; // corner cell
  const avg = lattice.neighborAvg(1); // neighbor across wrap
  assert.ok(avg > 0, "wrapped neighbor should contribute to average");
});

test("Session runner produces metrics and witness frames", () => {
  const result = runSession({ steps: 24, gridSize: 6 });
  assert.strictEqual(result.deltaId, deltaId);
  assert.ok(result.metricsLog.length === 24);
  assert.ok(result.witnessLog.length > 0);
});
