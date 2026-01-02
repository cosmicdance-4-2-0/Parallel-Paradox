export const CONFIG = {
  deltaId: "LKBX24M9Q7P1",
  grid: {
    size: 10,
    plasmaNoise: 0.07,
    liquidCoupling: 0.16,
    biasGain: 0.45,
    pathBlend: 0.22,
    forgivenessThreshold: 0.34,
    forgivenessDamping: 0.6,
    traceBlend: 0.08,
    solidBlend: 0.035,
    plasticityProbability: 0.05,
  },
  bias: {
    decay: 0.9,
    diffusion: 0.12,
    injectionStrength: 0.9,
    radius: 1,
  },
  delay: {
    length: 6,
    decay: 0.82,
    gain: 0.35,
  },
  swarm: {
    crossTalk: 0.18,
    memoryBiasGain: 0.25,
    metricSmoothing: 0.2,
  },
  lens: {
    baseWeights: {
      human: 0.25,
      predictive: 0.25,
      systemic: 0.25,
      harmonic: 0.25,
    },
    maxBiasGain: 0.65,
    maxCrossTalkGain: 0.3,
    forgivenessBoost: 0.35,
    pathBlendBoost: 0.2,
  },
};
