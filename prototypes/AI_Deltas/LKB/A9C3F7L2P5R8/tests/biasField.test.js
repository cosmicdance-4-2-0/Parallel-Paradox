import test from "node:test";
import assert from "node:assert/strict";
import { BiasField } from "../src/biasField.js";

test("bias field decays and stays bounded", () => {
  const field = new BiasField({ x: 4, y: 4, z: 4 }, 0.5, 0.4);
  field.injectSphere({ x: 1, y: 1, z: 1 }, 1, 1.0);
  const maxAfterInject = Math.max(...field.field);
  assert.ok(maxAfterInject <= 0.401);
  field.applyDecay();
  const maxAfterDecay = Math.max(...field.field);
  assert.ok(maxAfterDecay <= maxAfterInject);
});
