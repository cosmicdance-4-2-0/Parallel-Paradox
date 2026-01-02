import { describe, expect, it } from "vitest";
import { LensFusion } from "../src/lens.js";
import { CONFIG } from "../src/config.js";

describe("LensFusion", () => {
  it("derives controls that respond to metrics", () => {
    const lens = new LensFusion(CONFIG.lens);
    const calmControls = lens.deriveControls({
      energy: 0.2,
      coherence: 0.9,
      divergence: 0.1,
    });
    const excitedControls = lens.deriveControls({
      energy: 0.8,
      coherence: 0.3,
      divergence: 0.6,
    });

    expect(excitedControls.biasGain).toBeGreaterThan(calmControls.biasGain);
    expect(excitedControls.crossTalkGain).toBeGreaterThanOrEqual(
      calmControls.crossTalkGain
    );
    expect(excitedControls.pathBlend).toBeGreaterThan(calmControls.pathBlend);
  });
});
