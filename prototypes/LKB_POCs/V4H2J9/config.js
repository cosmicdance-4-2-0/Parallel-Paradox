// PhaseCube Delta configuration (DeltaID: V4H2J9)
// Centralized tunables to keep the POC modular, human-readable, and easily extendable.

export const DEFAULT_CONFIG = {
  gridSize: 14, // Grid dimension (cube). Keep modest for CPU; scale cautiously.
  scale: 22, // Spatial scale for projection.
  alpha: 0.2, // Solid-phase damping (forgiveness-like persistence).
  flipProbability: 0.025, // Random plasma flips to prevent collapse.
  parityProbability: 0.01, // Parity toggles to maintain asymmetry.
  pathBProbability: 0.58, // Probability of difference-amplifying branch.
  delay: {
    length: 18, // Frames retained in the delay line.
    decay: 0.9, // How quickly historical influence fades.
    gain: 0.35 // Strength of reinjected history.
  },
  coupling: {
    coreToEcho: 0.16, // Cross-talk weight from core → echo.
    echoToCore: 0.12 // Cross-talk weight from echo → core.
  },
  plasticity: {
    rewireProbability: 0.002, // Chance per frame to rewire a neighbor edge.
    window: 96 // Interval (frames) between plasticity passes.
  },
  renderer: {
    pointSize: 4,
    strokeAlpha: 0.3,
    bg: '#050608'
  }
};

export function withOverrides(config, overrides) {
  // Merge overrides shallowly for ease of use; deep merge is unnecessary for this POC.
  return { ...config, ...overrides, delay: { ...config.delay, ...(overrides?.delay || {}) }, coupling: { ...config.coupling, ...(overrides?.coupling || {}) }, plasticity: { ...config.plasticity, ...(overrides?.plasticity || {}) }, renderer: { ...config.renderer, ...(overrides?.renderer || {}) } };
}
