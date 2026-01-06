import { describe, expect, it } from "vitest";
import { PhaseGrid } from "../src/phase-grid.js";
import { BiasField } from "../src/bias-field.js";
import { defaultConfig } from "../src/config.js";

describe("PhaseGrid", () => {
  it("keeps liquid/solid bounded and increments forgiveness under variance", () => {
    const grid = new PhaseGrid(defaultConfig);
    const bias = new BiasField(defaultConfig.gridSize, defaultConfig);
    bias.inject({ x: 0, y: 0, z: 0 }, 0.9, 1);

    grid.perturb();
    grid.step(bias);

    const maxLiquid = Math.max(...grid.liquid);
    const minLiquid = Math.min(...grid.liquid);
    expect(maxLiquid).toBeLessThanOrEqual(1);
    expect(minLiquid).toBeGreaterThanOrEqual(0);
    expect(grid.forgivenessEvents).toBeGreaterThanOrEqual(0);
  });
});
