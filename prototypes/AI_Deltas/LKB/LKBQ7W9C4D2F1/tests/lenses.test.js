import { describe, it, expect } from 'vitest';
import { LensController } from '../src/lenses.js';

describe('LensController', () => {
  it('normalizes weights and dampens pathB on high variance', () => {
    const controller = new LensController({ human: 0.3, predictive: 0.2, systemic: 0.3, harmonic: 0.2 });
    const mix = controller.harmonize({ variance: 0.5, biasEnergy: 0.1, basePathB: 0.6 });

    expect(mix.pathBWeight).toBeLessThan(0.8);
    expect(mix.pathAWeight + mix.pathBWeight).toBeGreaterThan(0.9);
    expect(mix.pathAWeight).toBeGreaterThan(0);
  });
});
