import { test } from "node:test";
import assert from "node:assert/strict";
import { runSession } from "../src/main.js";

test("runs a short tri-grid session and returns summary", async () => {
  const result = await runSession({ steps: 6, gridSize: 6, pulses: [] });
  assert.equal(result.steps, 6);
  assert.ok(result.finalOracle, "oracle sample should be present");
  assert.ok(result.energyMean > 0);
  assert.ok(result.dispersionMean >= 0);
  assert.equal(result.frames.length, 6);
});
