import { describe, expect, it } from "vitest";
import { MultiGridSwarm } from "../src/swarm.js";

describe("smoke", () => {
  it("steps the swarm without collapsing", () => {
    const swarm = new MultiGridSwarm({
      grid: { size: 6 },
    });
    const initialMetrics = swarm.measureAggregateMetrics();
    swarm.injectBias({ x: 1, y: 1, z: 1, strength: 0.5, radius: 1 });
    const { aggregate, lensControls } = swarm.step();

    expect(aggregate.energy).toBeGreaterThan(0);
    expect(aggregate.coherence).toBeGreaterThan(0);
    expect(lensControls.biasGain).toBeGreaterThan(0);
    expect(swarm.core.rewireCount).toBeGreaterThanOrEqual(0);
    expect(aggregate.energy).not.toBe(initialMetrics.energy);
  });
});
