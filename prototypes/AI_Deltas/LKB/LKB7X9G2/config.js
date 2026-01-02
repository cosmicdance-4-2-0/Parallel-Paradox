export const CONFIG = {
  DELTA_ID: "LKB7X9G2",
  GRID_SIZE: 20,
  STEP_INTERVAL_MS: 16,
  CANVAS_SCALE: 18,
  PLASMA: {
    noise: 0.35,
    decay: 0.9,
    biasGain: 0.4,
    flipThreshold: 0.78,
  },
  PATHS: {
    baseA: 0.18,
    baseB: 0.22,
    biasWeight: 0.35,
    randomFlip: 0.01,
  },
  SOLID: {
    blend: 0.08,
    damping: 0.985,
  },
  INPUT: {
    decay: 0.94,
    diffusion: 0.16,
    strength: 0.42,
    centerDrift: 0.12,
  },
  LENSES: {
    human: 0.24,
    predictive: 0.26,
    systemic: 0.22,
    harmonic: 0.28,
  },
  THEME: {
    background: "#05060a",
    palette: ["#2dd4bf", "#7c3aed", "#22d3ee", "#f472b6", "#f59e0b"],
  },
};
