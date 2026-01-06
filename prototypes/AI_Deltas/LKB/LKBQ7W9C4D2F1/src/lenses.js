import { clamp } from './util.js';

export class LensController {
  constructor(baseWeights) {
    this.weights = this.normalize(baseWeights);
  }

  normalize(weights) {
    const total = Object.values(weights).reduce((acc, val) => acc + val, 0);
    const normalized = {};
    Object.entries(weights).forEach(([key, val]) => {
      normalized[key] = total === 0 ? 0 : val / total;
    });
    return normalized;
  }

  harmonize({ variance, biasEnergy, basePathB }) {
    const { human, predictive, systemic, harmonic } = this.weights;
    const stability = human + systemic;
    const exploration = predictive + biasEnergy;

    const harmonicBrake = 1 - clamp(variance * harmonic * 1.8, 0, 0.5);
    const exploratoryPush = clamp(exploration * 0.25, 0, 0.25);
    const stabilityPull = clamp(stability * 0.2, 0, 0.2);

    const adjustedPathB = clamp(basePathB + exploratoryPush - stabilityPull, 0.05, 0.95);

    return {
      pathBWeight: adjustedPathB * harmonicBrake + (1 - harmonicBrake) * 0.5,
      pathAWeight: 1 - adjustedPathB,
      harmonicBrake
    };
  }
}
