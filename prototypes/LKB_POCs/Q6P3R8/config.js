// PhaseCube Memory-Biased Upgrade — DeltaID: Q6P3R8
// Centralized configuration so tunables stay discoverable and shareable.

export const DeltaID = "Q6P3R8";

export function createConfig(overrides = {}) {
  // Note: keep defaults modest to run on commodity laptops without GPU.
  const base = {
    gridSize: 14, // 14^3 = 2744 agents per grid keeps tri-grid comfortable.
    scale: 26,
    pointSize: 4,
    flipProbability: 0.018,
    parityProbability: 0.011,
    pathBProbability: 0.6, // Exploration bias.
    alpha: 0.2, // Persistence damping.
    biasWeight: 0.28,
    memoryWeight: 0.2,
    crosstalkWeight: 0.16,
    plasticityProbability: 0.002,
    forgivenessThreshold: 0.17,
    forgivenessDamping: 0.4,
    delayLength: 32,
    delayDecay: 0.94,
    maxBiasMagnitude: 0.85,
    fpsCap: 60,
  };
  return { ...base, ...overrides };
}
