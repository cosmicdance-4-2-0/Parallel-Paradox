import { describe, it, expect } from 'vitest';
import { BiasField } from '../src/biasField.js';

describe('BiasField', () => {
  it('diffuses and decays pulses', () => {
    const field = new BiasField(4, { decay: 0.9, diffusionRate: 0.2 });
    field.addPulse({ x: 2, y: 2, z: 2 }, 1);

    const initialEnergy = field.energy();
    field.decayAndDiffuse();
    const afterEnergy = field.energy();

    expect(afterEnergy).toBeLessThan(initialEnergy);
    expect(afterEnergy).toBeGreaterThan(0);
  });
});
