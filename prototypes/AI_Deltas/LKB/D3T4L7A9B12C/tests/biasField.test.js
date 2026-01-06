import test from 'node:test';
import assert from 'node:assert';
import { BiasField } from '../src/biasField.js';
import { DelayLine } from '../src/delayLine.js';

test('bias field decays and injects correctly', () => {
  const field = new BiasField(4, 0.5);
  field.injectUniform(1);
  field.decay();
  for (const v of field.field) {
    assert.strictEqual(v, 0.5);
  }

  const center = Math.floor(field.length / 2);
  field.injectSphere(center, 1, 0.5);
  assert.ok(field.field[center] > 0.5);
});

test('delay line mixes snapshots with decay weighting', () => {
  const dl = new DelayLine(3, 0.5);
  dl.push(Float32Array.from([1, 0]));
  dl.push(Float32Array.from([0, 1]));
  dl.push(Float32Array.from([1, 1]));
  const mixed = dl.mix();
  assert.strictEqual(mixed.length, 2);
  assert.ok(mixed[1] > mixed[0], 'newest frame dominance keeps recent energy visible');
  assert.ok(Math.abs((mixed[0] + mixed[1]) - 1.5714) < 0.01, 'mix preserves proportional decay');
});
