import { describe, it, expect, vi, afterEach } from "vitest";
import { PhaseGrid } from "../src/grid.js";

describe("PhaseGrid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies forgiveness damping when dispersion spikes", () => {
    const size = 2;
    const alpha = 0.2;
    const flip = 0;
    const parity = 0;

    const runOnce = (forgivenessDamp) => {
      const grid = new PhaseGrid(size, alpha);
      grid.plasma.fill(0);
      grid.liquid.fill(0);
      grid.solid.fill(0);
      grid.parity.fill(0);
      grid.plasma[0] = 1; // create sharp contrast against neighbors

      vi.spyOn(Math, "random").mockReturnValue(0); // force Path B
      grid.perturb(flip, parity);
      grid.step({
        pathBProb: 1,
        damping: 0,
        forgiveness: { threshold: 0.1, damp: forgivenessDamp },
        biasField: null,
        biasGain: 0,
        echoField: null,
        echoGain: 0
      });
      return grid.liquid[0];
    };

    const withoutForgiveness = runOnce(0);
    const withForgiveness = runOnce(0.5);

    expect(withForgiveness).toBeLessThan(withoutForgiveness);
  });
});
