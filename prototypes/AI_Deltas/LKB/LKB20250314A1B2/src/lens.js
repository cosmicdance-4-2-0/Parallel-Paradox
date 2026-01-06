import { config } from "./config.js";

export function lensMixer(metrics, weights = config.lensWeights) {
  const { energy = 0, dispersion = 0, biasAmplitude = 0 } = metrics;

  const predictivePush = weights.predictive * (0.4 + biasAmplitude * 0.6);
  const harmonicPull = weights.harmonic * dispersion;
  const systemicGuard = weights.systemic * Math.max(0, dispersion - 0.5);
  const humanBlend = weights.human * (0.2 + energy * 0.4);

  let pathB = config.basePathB + predictivePush - harmonicPull + humanBlend;
  pathB = clamp(pathB, config.harmonicClamp[0], config.harmonicClamp[1]);

  const damping = clamp(1 - (harmonicPull + systemicGuard) * config.forgivenessDamp, 0.4, 1);
  const biasScale = 1 + biasAmplitude * weights.predictive * 0.6;

  return { pathB, damping, biasScale };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
