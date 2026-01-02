import { clamp01 } from "./utils.js";

export function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((acc, v) => acc + v, 0) || 1;
  const normalized = {};
  for (const [k, v] of Object.entries(weights)) {
    normalized[k] = clamp01(v / total);
  }
  return normalized;
}

export function deriveDynamics(weights, defaults) {
  const w = normalizeWeights(weights);

  const pathBWeight = clamp01(0.25 + w.predictive * 0.6 + w.harmonic * 0.1);
  const forgiveness = clamp01(defaults.forgiveness + w.harmonic * 0.5);
  const damping = clamp01(defaults.damping + w.human * 0.35 + w.harmonic * 0.15);
  const flipProb = clamp01(defaults.flipProb + w.predictive * 0.03 + w.harmonic * 0.02);
  const parityProb = clamp01(defaults.parityProb + w.predictive * 0.05);
  const solidBlend = clamp01(defaults.solidBlend + w.human * 0.2 + w.systemic * 0.05);
  const biasBoost = 0.8 + w.systemic * 0.6; // systemic lens amplifies bias diffusion

  return {
    pathBWeight,
    forgiveness,
    damping,
    flipProb,
    parityProb,
    solidBlend,
    biasBoost,
  };
}

// TODO: allow experimental lens transforms (non-linear ramps, phase-dependent weighting) via presets.
