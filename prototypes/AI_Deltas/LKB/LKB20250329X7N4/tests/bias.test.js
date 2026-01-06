import { describe, it, expect } from "vitest";
import { BiasField } from "../src/bias-field.js";

describe("BiasField", () => {
  it("injects and decays bias energy", () => {
    const field = new BiasField(4, 0.5, 0.4, 1);
    field.injectPulse({ x: 1, y: 1, z: 1, strength: 0.5, radius: 1 });
    const afterInject = field.aggregate();
    expect(afterInject).toBeGreaterThan(0);

    field.decayField();
    const afterDecay = field.aggregate();
    expect(afterDecay).toBeLessThan(afterInject);
    expect(afterDecay).toBeGreaterThan(0);
  });
});
