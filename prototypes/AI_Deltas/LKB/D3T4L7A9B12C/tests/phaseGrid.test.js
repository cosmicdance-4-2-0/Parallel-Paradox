import test from 'node:test';
import assert from 'node:assert';
import { mergeConfig } from '../src/config.js';
import { PhaseGrid } from '../src/phaseGrid.js';
import { BiasField } from '../src/biasField.js';
import { RNG } from '../src/utils.js';

function makeDeterministicRng() {
  const rng = new RNG(42);
  rng.random = rng.next.bind(rng);
  return rng;
}

test('phase grid steps with bias and damping', () => {
  const config = mergeConfig({ gridSize: 4, forgiveness: { threshold: 0.05, strength: 0.9 } });
  const rng = makeDeterministicRng();
  const grid = new PhaseGrid(config.gridSize, config, rng);
  const bias = new BiasField(config.gridSize, 1);
  bias.injectUniform(0.1);

  grid.perturb();
  const metrics = grid.step(bias, { cognitive: 0.2, predictive: 0.3, systemic: 0.3, harmonic: 0.2 });
  assert.ok(metrics.averageEnergy > 0);
  assert.ok(metrics.averageDivergence < 1);
});

test('structural plasticity occasionally swaps plasma states', () => {
  const config = mergeConfig({ gridSize: 4, plasticityProbability: 1 });
  const seq = [0, 0, 0.5, 0.8]; // trigger rewiring, pick index 0 then mid-grid\n  const rng = { random: () => seq.shift() ?? 0.1 };\n  const grid = new PhaseGrid(config.gridSize, config, rng);\n  grid.plasma = Float32Array.from(grid.plasma.map((_, idx) => idx / grid.length));\n  const before = grid.plasma[0];\n  grid.maybeRewire();\n  const after = grid.plasma[0];\n  assert.notStrictEqual(before, after);\n });
});
