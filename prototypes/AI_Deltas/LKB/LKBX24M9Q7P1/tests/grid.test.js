import { afterEach, describe, expect, it, vi } from "vitest";
import { PhaseGrid } from "../src/grid.js";

describe("PhaseGrid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies forgiveness and rewiring when variance spikes", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const grid = new PhaseGrid(3, {
      plasmaNoise: 0,
      liquidCoupling: 0.2,
      biasGain: 1,
      pathBlend: 0.1,
      forgivenessThreshold: 0.01,
      forgivenessDamping: 0.5,
      traceBlend: 0.5,
      solidBlend: 0.2,
      plasticityProbability: 1,
    });
    grid.liquid.fill(0.4);
    grid.solid.fill(0.1);
    grid.trace.fill(0);
    grid.plasma.fill(0);

    const bias = new Float32Array(grid.liquid.length).fill(0.8);
    const metrics = grid.step(bias, {
      biasGain: 0.5,
      pathBlend: 0.2,
      forgivenessBoost: 0.2,
    });

    expect(metrics.energy).toBeGreaterThan(0);
    expect(grid.rewireCount).toBeGreaterThan(0);
    expect(grid.liquid.every((v) => Math.abs(v) <= 1.5)).toBe(true);
  });
});
