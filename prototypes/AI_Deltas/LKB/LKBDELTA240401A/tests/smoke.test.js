import { describe, expect, it } from "vitest";
import { createSimulator } from "../src/simulator.js";

describe("smoke simulation", () => {
  it("runs a short simulation without NaN values", () => {
    const sim = createSimulator({ run: { steps: 10, biasPulseEvery: 3 } });
    for (let i = 0; i < sim.config.run.steps; i++) {
      sim.step(i);
    }

    const hasNaN = [
      ...sim.grid.plasma,
      ...sim.grid.liquid,
      ...sim.grid.solid,
      ...sim.bias.field
    ].some(Number.isNaN);

    expect(hasNaN).toBe(false);
  });
});
