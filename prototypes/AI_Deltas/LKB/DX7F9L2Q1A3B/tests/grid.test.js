import { describe, it, expect } from 'vitest';
import { PhaseGrid } from '../src/grid.js';

const cfg = { noiseFlip: 0.0, parityFlip: 0.0, alpha: 0.2, parityWeight: 0.08 };

describe('PhaseGrid', () => {
  it('keeps values bounded after a step', () => {
    const grid = new PhaseGrid(4);
    grid.step({
      basePath: 0.7,
      alpha: cfg.alpha,
      parityWeight: cfg.parityWeight,
      biasField: null,
      biasGain: 0,
      lensMix: { pathBoost: 0, damping: 0 },
      harmonicClamp: 0
    });
    const allValues = [...grid.plasma, ...grid.liquid, ...grid.solid];
    expect(allValues.every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it('responds to bias injection', () => {
    const grid = new PhaseGrid(4);
    const bias = new Float32Array(grid.n).fill(0.2);
    const before = grid.plasma[0];
    grid.perturb(0, 0, bias);
    expect(grid.plasma[0]).toBeGreaterThanOrEqual(before);
  });
});
