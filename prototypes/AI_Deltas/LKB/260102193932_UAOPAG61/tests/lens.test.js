import { test } from "node:test";
import assert from "node:assert/strict";
import { createConfig } from "../src/config.js";
import { LensMixer, normalizeWeights } from "../src/lens.js";
import { BiasField } from "../src/bias.js";

test("lens mixing clamps pathB and damping under high dispersion", () => {
  const config = createConfig();
  const mixer = new LensMixer(config);
  const mix = mixer.mix({ energy: 0.2, dispersion: 1.2, biasLoad: 0.5 });

  assert.ok(mix.pathBProbability <= config.path.max);
  assert.ok(mix.pathBProbability >= config.path.min);
  assert.ok(mix.damping <= 1);
  assert.ok(mix.damping >= config.forgiveness.floor);
  assert.ok(mix.biasGain >= 0.6 && mix.biasGain <= 1.35);
});

test("normalizeWeights safely defaults when sum is zero", () => {
  const normalized = normalizeWeights({ a: 0, b: 0 });
  const total = Object.values(normalized).reduce((acc, v) => acc + v, 0);
  assert.equal(total.toFixed(2), "1.00");
});

test("bias field decays and clamps values", () => {
  const config = createConfig({ gridSize: 4 });
  const field = new BiasField(config.gridSize, config.bias);
  field.ingestPulse({ pan: 1, depth: 1, amplitude: 5 });
  const before = field.average();
  field.decayField();
  const after = field.average();
  assert.ok(after < before, "decay should reduce bias energy");
  const max = Math.max(...field.values);
  const min = Math.min(...field.values);
  assert.ok(max <= config.bias.maxMagnitude);
  assert.ok(min >= -config.bias.maxMagnitude);
});
