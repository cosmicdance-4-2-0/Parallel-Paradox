export const DELTA_ID = "M8K3Z1";

export const GRID_SIZE = {
  x: 18,
  y: 14,
  z: 10,
};

export const DEFAULTS = {
  lensWeights: {
    human: 0.4,
    predictive: 0.35,
    systemic: 0.35,
    harmonic: 0.5,
  },
  bias: {
    strength: 0.28,
    radius: 3,
    decay: 0.12,
  },
  simulation: {
    flipProb: 0.03,
    parityProb: 0.02,
    damping: 0.1,
    forgiveness: 0.18,
    solidBlend: 0.12,
  },
};

export const RENDER = {
  cellSize: 14,
  zParallax: 0.5,
};

export const MEMORY = {
  historyLength: 120, // ~2 seconds at 60 fps
  influence: 0.08, // how much the rolling memory biases liquid excitation
};

export const COUPLING = {
  echoMix: 0.35, // how much the echo grid returns to the primary
  biasShare: 0.45, // fraction of bias routed to the echo grid when enabled
};

// TODO: expose GRID_SIZE and RENDER mappings via UI for rapid prototyping across device sizes.
