export const SIM_CONFIG = {
  gridSize: 10,
  flipProbability: 0.02,
  parityProbability: 0.01,
  pathBProbability: 0.6,
  alpha: 0.2,
  bias: {
    decay: 0.93,
    diffusionRate: 0.18,
    pulseMagnitude: 0.4,
    pulseInterval: 25
  },
  forgiveness: {
    varianceThreshold: 0.12,
    dampening: 0.6
  },
  lenses: {
    human: 0.25,
    predictive: 0.3,
    systemic: 0.25,
    harmonic: 0.2
  },
  steps: 180
};

export const DELTA_ID = "LKBQ7W9C4D2F1";
