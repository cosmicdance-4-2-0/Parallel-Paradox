export const DeltaID = "LKB20250314A1B2";

export const config = {
  gridSize: 10,
  scale: 18,
  pointSize: 3,
  flipProbability: 0.02,
  parityProbability: 0.01,
  basePathB: 0.68,
  alpha: 0.2,
  biasDecay: 0.93,
  biasStrength: 0.07,
  biasRadius: 2,
  forgivenessThreshold: 0.42,
  forgivenessDamp: 0.4,
  delaySteps: 6,
  lensWeights: {
    human: 0.25,
    predictive: 0.35,
    systemic: 0.15,
    harmonic: 0.25
  },
  harmonicClamp: [0.55, 0.92]
};

export const presets = {
  stable: {
    lensWeights: { human: 0.2, predictive: 0.25, systemic: 0.2, harmonic: 0.35 },
    basePathB: 0.6,
    alpha: 0.28
  },
  exploratory: {
    lensWeights: { human: 0.25, predictive: 0.45, systemic: 0.1, harmonic: 0.2 },
    basePathB: 0.78,
    alpha: 0.16
  }
};
