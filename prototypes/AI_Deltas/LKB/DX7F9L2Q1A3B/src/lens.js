import { clamp01 } from './math.js';

export function deriveLensMix(metrics, cfg) {
  const { energy = 0, divergence = 0, coherence = 0 } = metrics;
  const energyBand = clamp01((energy - cfg.energyFloor) / Math.max(0.001, cfg.energyCeil - cfg.energyFloor));
  const divergenceBand = clamp01(divergence / Math.max(cfg.divergenceTarget, 0.0001));

  const predictive = cfg.predictiveWeight * (0.35 + 0.45 * divergenceBand);
  const harmonic = cfg.harmonicWeight * (0.35 + 0.45 * (1 - energyBand));

  const pathBoost = clamp01(0.5 + predictive * 0.6 - harmonic * 0.4) - 0.5;
  const damping = clamp01(harmonic * (0.4 + 0.3 * coherence));

  return { predictive, harmonic, pathBoost, damping };
}

export function applyLensToProb(base, lensMix, clampRange = [0.05, 0.95]) {
  const { pathBoost } = lensMix;
  const biased = base + pathBoost;
  const [min, max] = clampRange;
  return Math.min(max, Math.max(min, biased));
}
