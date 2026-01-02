import assert from 'assert';
import { computeLensWeights } from '../src/lens.js';
import { defaultConfig } from '../src/config.js';

export function run() {
  const metrics = { energy: 0.9, dispersion: 0.5, biasEnergy: 0.2 };
  const weights = computeLensWeights(metrics, defaultConfig);
  assert.ok(weights.basePathB <= defaultConfig.phases.pathBClamp[1], 'path B clamp upper respected');
  assert.ok(weights.basePathB >= defaultConfig.phases.pathBClamp[0], 'path B clamp lower respected');
  assert.ok(weights.forgiveness >= defaultConfig.lens.forgivenessFloor, 'forgiveness floor enforced');
  assert.ok(weights.biasCoupling >= 0.5 && weights.biasCoupling <= 1.4, 'bias coupling bounded');
  return 'lens';
}
