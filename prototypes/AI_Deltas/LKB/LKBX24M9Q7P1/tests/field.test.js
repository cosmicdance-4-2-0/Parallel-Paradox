import { describe, expect, it } from "vitest";
import { BiasField } from "../src/bias-field.js";
import { DelayLine } from "../src/delay-line.js";

describe("BiasField and DelayLine", () => {
  it("diffuses and decays injected energy", () => {
    const field = new BiasField(3, { decay: 0.5, diffusion: 0.5 });
    field.injectPulse({ x: 1, y: 1, z: 1, strength: 1, radius: 1 });
    const before = field.view().reduce((a, b) => a + b, 0);
    field.tick();
    const after = field.view().reduce((a, b) => a + b, 0);
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThan(0);
  });

  it("builds a decayed composite frame", () => {
    const delay = new DelayLine(3, 0.5);
    delay.push(new Float32Array([1, 1]));
    delay.push(new Float32Array([0.5, 0.5]));
    const composite = delay.compose();
    expect(composite[0]).toBeCloseTo(1 + 0.5 * 0.5);
    expect(composite[1]).toBeCloseTo(1 + 0.5 * 0.5);
  });
});
