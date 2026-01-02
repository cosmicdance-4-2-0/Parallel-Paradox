import { describe, it, expect } from 'vitest';
import { deriveLensMix, applyLensToProb } from '../src/lens.js';

const lensCfg = {
  predictiveWeight: 0.6,
  harmonicWeight: 0.4,
  energyFloor: 0.2,
  energyCeil: 0.8,
  divergenceTarget: 0.15
};

describe('lens mixer', () => {
  it('increases path boost with divergence', () => {
    const calm = deriveLensMix({ energy: 0.5, divergence: 0.05, coherence: 0.8 }, lensCfg);
    const lively = deriveLensMix({ energy: 0.5, divergence: 0.2, coherence: 0.8 }, lensCfg);
    expect(lively.pathBoost).toBeGreaterThanOrEqual(calm.pathBoost);
  });

  it('clamps probability range', () => {
    const lens = { pathBoost: 1 };
    const prob = applyLensToProb(0.8, lens, [0.1, 0.9]);
    expect(prob).toBeCloseTo(0.9);
  });
});
