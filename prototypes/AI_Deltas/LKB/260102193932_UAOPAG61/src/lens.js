import { clamp } from "./config.js";

export class LensMixer {
  constructor(config) {
    this.path = config.path;
    this.forgiveness = config.forgiveness;
    this.weights = normalizeWeights(config.lensWeights);
  }

  mix(metrics) {
    const { energy = 0.5, dispersion = 0, biasLoad = 0 } = metrics ?? {};
    const { predictive, harmonic, systemic, human } = this.weights;

    const exploration = (predictive - harmonic) * 0.25;
    const biasNudge = biasLoad * 0.1;
    const dispersionPenalty =
      dispersion > this.forgiveness.dispersionThreshold
        ? (dispersion - this.forgiveness.dispersionThreshold) * 0.5
        : 0;

    let pathB = this.path.baseB + exploration + biasNudge - dispersionPenalty;
    pathB = clamp(pathB, this.path.min, this.path.max);

    let damping = 1 - harmonic * 0.18 - Math.min(0.25, dispersion * 0.6);
    if (dispersion > this.forgiveness.dispersionThreshold) {
      damping = Math.max(damping, this.forgiveness.floor);
    }
    damping = clamp(damping, this.forgiveness.floor, 1);

    const biasGain = clamp(1 + systemic * 0.25 + (energy - 0.5) * 0.2 + human * 0.05, 0.6, 1.35);

    return { pathBProbability: pathB, damping, biasGain };
  }
}

export function normalizeWeights(weights) {
  const entries = Object.entries(weights ?? {});
  const total = entries.reduce((acc, [, v]) => acc + (Number.isFinite(v) ? v : 0), 0);
  if (total <= 0) {
    return { human: 0.25, predictive: 0.25, systemic: 0.25, harmonic: 0.25 };
  }
  const normalized = {};
  for (const [k, v] of entries) {
    normalized[k] = v / total;
  }
  return normalized;
}
