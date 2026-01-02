import assert from 'assert';
import { runSession } from '../src/runner.js';

export function run() {
  const result = runSession({ config: { steps: 30, gridSize: 8 } });
  assert.ok(result.frames.length > 0, 'frames should be recorded');
  assert.ok(Array.isArray(result.witness) && result.witness.length === 6, 'witness sample length');
  assert.ok(result.finalMetrics.energy >= 0 && result.finalMetrics.energy <= 1, 'energy bounded');
  assert.ok(result.finalMetrics.dispersion >= 0 && result.finalMetrics.dispersion <= 1, 'dispersion bounded');
  return 'smoke';
}
