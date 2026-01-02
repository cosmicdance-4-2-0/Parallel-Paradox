import { clamp } from "./config.js";

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((acc, v) => acc + v, 0) || 1;
  const normalized = {};
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = value / total;
  }
  return normalized;
}

export function mixLens(metrics, config) {
  const weights = normalizeWeights(config.lensWeights);
  const { energy, dispersion, biasLoad, traceMean } = metrics;

  const exploration = weights.predictive * (0.5 + dispersion) + weights.human * (0.35 + biasLoad);
  const stability = weights.harmonic * (traceMean + dispersion) + weights.systemic * (0.3 + biasLoad * 0.4);

  const unclampedPathB = config.basePathB + 0.25 * exploration - 0.18 * stability + (energy - 0.5) * 0.05;
  const pathBProbability = clamp(unclampedPathB, config.pathBRange[0], config.pathBRange[1]);

  const forgivenessActive = dispersion > config.forgiveness.dispersionThreshold;
  const dispersionOver = Math.max(0, dispersion - config.forgiveness.dispersionThreshold);
  const damping = forgivenessActive
    ? clamp(1 - weights.harmonic * (0.6 * dispersionOver + 0.25), config.forgiveness.floor, 1)
    : 1;

  const biasGain = clamp(
    config.biasGain.base + config.biasGain.boost * (weights.systemic * (0.4 + biasLoad) + weights.human * 0.15),
    0,
    1
  );

  return {
    pathBProbability,
    damping,
    biasGain,
    forgivenessActive,
    weights
  };
}
