// Configuration and tunables for Delta K5N3Q8.
// Values are intentionally centralized for quick experimentation.

export const CONFIG = {
  grid: 18, // keeps performance reasonable in CPU-only mode.
  canvas: { width: 1280, height: 800 },
  noise: {
    flipProbability: 0.018,
    parityProbability: 0.012,
    jitter: 0.003, // small random jitter to avoid lockstep.
  },
  bias: {
    weight: 1.0,
    diffusion: 0.12,
    decay: 0.015,
    microphoneSmoothing: 0.2,
    proceduralSpeed: 0.35,
  },
  harmonic: {
    forgivenessStrength: 0.35,
    forgivenessThreshold: 0.18,
  },
  trace: {
    depth: 0.55, // controls how much past activity lingers.
  },
  render: {
    pointSize: 5.5,
    pointGain: 7.0,
    background: '#020209',
    rotationSpeed: 0.0025,
  },
};

// TODO: Add presets for the four-lens model (human, predictive, systemic, harmonic)
// to map lens weights onto plasma/liquid/solid blending in the grid update.
