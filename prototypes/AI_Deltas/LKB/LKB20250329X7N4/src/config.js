export const deltaId = "LKB20250329X7N4";

export const defaultConfig = {
  steps: 180,
  gridSize: 8,
  flipProbability: 0.02,
  parityProbability: 0.01,
  alpha: 0.18,
  pathB: {
    base: 0.62,
    clamp: [0.25, 0.9]
  },
  forgiveness: {
    threshold: 0.38,
    damp: 0.35
  },
  bias: {
    decay: 0.9,
    strength: 0.35,
    radius: 2
  },
  coupling: {
    echoGain: 0.12,
    biasGain: 0.55
  },
  lensWeights: {
    human: 0.22,
    predictive: 0.26,
    systemic: 0.26,
    harmonic: 0.26
  },
  metricSmoothing: 0.2
};
