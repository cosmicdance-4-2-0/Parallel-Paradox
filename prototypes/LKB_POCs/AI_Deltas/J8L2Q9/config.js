// PhaseCube Delta configuration (DeltaID: J8L2Q9)
// Centralized defaults to keep the POC tunable and human-readable.

export const DEFAULT_CONFIG = {
  gridSize: 12, // Cube dimension. Keep modest for CPU; scale with caution.
  scale: 26, // Spatial scale used by the renderer.
  alpha: 0.18, // Solid-phase damping (forgiveness-like persistence).
  flipProbability: 0.02, // Random plasma flips to avoid collapse.
  parityProbability: 0.012, // Parity toggles maintain asymmetry.
  pathBProbability: 0.55, // Probability of difference-amplifying branch.
  lens: {
    harmonicClamp: 0.22, // Cap the stabilizer bias so it cannot freeze the field.
    predictiveGain: 0.18 // How strongly divergence boosts exploration.
  },
  delay: {
    length: 20, // Frames retained in the delay line.
    decay: 0.9, // How quickly historical influence fades.
    gain: 0.32 // Strength of reinjected history.
  },
  coupling: {
    coreToEcho: 0.15, // Cross-talk from core → echo.
    echoToCore: 0.12, // Cross-talk from echo → core.
    harmonicToAll: 0.18 // Stabilizer influence broadcast to both grids.
  },
  plasticity: {
    rewireProbability: 0.0025, // Chance per pass to rewire an edge.
    window: 88 // Interval (frames) between plasticity passes.
  },
  audio: {
    gain: 0.25, // Strength of audio-derived bias.
    decay: 0.88, // How quickly the audio bias dissipates.
    smoothing: 0.78 // Rolling average to reduce jitter.
  },
  renderer: {
    pointSize: 4,
    strokeAlpha: 0.35,
    bg: '#040507'
  }
};

export function withOverrides(config, overrides) {
  // Shallow merge helper; keeps nested sections intact without heavy deps.
  return {
    ...config,
    ...overrides,
    lens: { ...config.lens, ...(overrides?.lens || {}) },
    delay: { ...config.delay, ...(overrides?.delay || {}) },
    coupling: { ...config.coupling, ...(overrides?.coupling || {}) },
    plasticity: { ...config.plasticity, ...(overrides?.plasticity || {}) },
    audio: { ...config.audio, ...(overrides?.audio || {}) },
    renderer: { ...config.renderer, ...(overrides?.renderer || {}) }
  };
}
