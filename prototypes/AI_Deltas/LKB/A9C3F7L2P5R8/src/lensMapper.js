import { clamp } from "./utils.js";

export const mapLensWeights = (lensWeights) => {
  const { human, predictive, systemic, harmonic } = lensWeights;
  const pathBWeight = clamp(0.28 + predictive * 0.45 - harmonic * 0.15, 0.05, 0.9);
  const forgivenessStrength = clamp(0.25 + harmonic * 0.6 - predictive * 0.15, 0.1, 0.85);
  const forgivenessThreshold = clamp(0.22 + human * 0.25 + harmonic * 0.15, 0.15, 0.8);
  const biasGain = clamp(0.2 + human * 0.5 + systemic * 0.25, 0.1, 1.0);
  const couplingGain = clamp(0.12 + systemic * 0.45 + harmonic * 0.2, 0.05, 0.95);
  const noise = clamp(0.04 + predictive * 0.12 + harmonic * 0.04, 0.02, 0.3);

  return {
    pathBWeight,
    forgivenessStrength,
    forgivenessThreshold,
    biasGain,
    couplingGain,
    noise
  };
};
