import { describe, expect, it } from "vitest";
import { BiasField } from "../src/bias-field.js";
import { defaultConfig } from "../src/config.js";

describe("BiasField", () => {
  it("decays and diffuses while staying bounded", () => {
    const field = new BiasField(4, defaultConfig);
    field.inject({ x: 2, y: 2, z: 2 }, 1, 1);
    const beforeMax = Math.max(...field.field);
    expect(beforeMax).toBeGreaterThan(0.5);

    for (let i = 0; i < 5; i++) {
      field.decayAndDiffuse();
    }

    const afterMax = Math.max(...field.field);
    const afterMin = Math.min(...field.field);
    expect(afterMax).toBeLessThanOrEqual(1);
    expect(afterMin).toBeGreaterThanOrEqual(0);
    expect(afterMax).toBeLessThan(beforeMax);
  });
});
