import { describe, it, expect } from 'vitest';
import { mergeConfig } from '../src/config.js';
import { TriGridEngine } from '../src/engine.js';

describe('TriGridEngine', () => {
  it('ticks without throwing and returns metrics', () => {
    const engine = new TriGridEngine(mergeConfig({ gridSize: 4 }));
    const result = engine.tick();
    expect(result.metrics.energy).toBeGreaterThan(0);
    expect(result.lensMix).toHaveProperty('predictive');
  });
});
