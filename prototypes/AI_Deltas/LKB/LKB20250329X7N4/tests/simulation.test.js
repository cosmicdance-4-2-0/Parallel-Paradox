import { describe, it, expect } from "vitest";
import { runSession } from "../src/simulation.js";

describe("runSession", () => {
  it("completes a short session and returns metrics", () => {
    const result = runSession({ steps: 40 }, { captureEvery: 10 });
    expect(result.deltaId).toBeDefined();
    expect(result.samples.length).toBeGreaterThan(0);
    const final = result.latestMetrics;
    expect(final.energy).toBeGreaterThanOrEqual(0);
    expect(final.energy).toBeLessThanOrEqual(1);
    expect(final.controls.pathBProb).toBeGreaterThan(0);
  });
});
