import test from "node:test";
import assert from "node:assert/strict";
import { mapLensWeights } from "../src/lensMapper.js";

test("lens mapper returns bounded parameters", () => {
  const params = mapLensWeights({ human: 1, predictive: 1, systemic: 1, harmonic: 1 });
  assert.ok(params.pathBWeight <= 0.9 && params.pathBWeight >= 0.05);
  assert.ok(params.forgivenessStrength >= 0.1 && params.forgivenessStrength <= 0.85);
  assert.ok(params.biasGain <= 1 && params.biasGain >= 0.1);
});
