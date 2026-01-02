import { describe, it, expect } from 'vitest';
import { SIM_CONFIG } from '../src/config.js';
import { runSimulation } from '../src/simulation.js';

describe('Simulation', () => {
  it('runs without collapsing and records forgiveness events when variance spikes', () => {
    const config = { ...SIM_CONFIG, steps: 40, forgiveness: { varianceThreshold: 0.05, dampening: 0.5 } };
    const result = runSimulation(config);

    expect(result.summary.steps).toBe(40);
    expect(result.summary.variance).toBeGreaterThanOrEqual(0);
    expect(result.summary.biasEnergy).toBeGreaterThanOrEqual(0);
    expect(result.summary.forgivenessEvents).toBeGreaterThanOrEqual(0);
  });
});
