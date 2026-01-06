import test from 'node:test';
import assert from 'node:assert';
import { mergeConfig } from '../src/config.js';
import { LensController } from '../src/lenses.js';
import { MultiGridSwarm } from '../src/multiGrid.js';
import { RNG } from '../src/utils.js';

function makeRng(seed = 7) {
  const rng = new RNG(seed);
  rng.random = rng.next.bind(rng);
  return rng;
}

test('multi-grid swarm records metrics and couples grids', () => {
  const config = mergeConfig({ gridSize: 4 });
  const lensController = new LensController(config.lensPresets, ['stable', 'harmonic'], 2, 0.5);
  const swarm = new MultiGridSwarm(config, lensController, makeRng());
  const snapshot = swarm.tick(0.05);
  assert.ok(snapshot.core.averageEnergy > 0);
  assert.ok(snapshot.echo.averageEnergy > 0);
  assert.ok(snapshot.memory.averageEnergy > 0);
  assert.strictEqual(swarm.metrics.length, 1);
});

test('lens controller cycles presets with blending', () => {
  const presets = {
    a: { cognitive: 1, predictive: 0, systemic: 0, harmonic: 0 },
    b: { cognitive: 0, predictive: 1, systemic: 0, harmonic: 0 }
  };
  const lc = new LensController(presets, ['a', 'b'], 1, 0.5);
  const first = lc.tick();
  const second = lc.tick();
  assert.notDeepStrictEqual(first, second);
});
