import test from "node:test";
import assert from "node:assert/strict";
import { runSession } from "../src/simulation.js";

test("runSession completes without throwing", () => {
  assert.doesNotThrow(() => runSession(12));
});
