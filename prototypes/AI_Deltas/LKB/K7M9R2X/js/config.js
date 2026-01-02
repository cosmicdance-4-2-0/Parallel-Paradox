export const DeltaID = "K7M9R2X";

export const defaults = {
  gridSize: 14,
  scale: 22,
  camera: {
    distance: 420,
    elevation: 0.8,
    orbitSpeed: 0.0006,
  },
  noise: {
    flip: 0.012,
    parity: 0.003,
  },
};

export const tunables = {
  pathBWeight: 0.58,
  forgiveness: 0.22,
  crossTalk: 0.14,
  biasStrength: 0.26,
  memoryBlend: 0.18,
  noise: defaults.noise.flip,
};

export const biasConfig = {
  decay: 0.94,
  pulseRadius: 2,
  pulseStrength: 0.35,
  drift: 0.1,
};

export const traceConfig = {
  length: 24,
  fade: 0.9,
};

export const presets = {
  stable: {
    pathBWeight: 0.45,
    forgiveness: 0.32,
    crossTalk: 0.08,
    biasStrength: 0.18,
    memoryBlend: 0.24,
    noise: 0.008,
  },
  exploratory: {
    pathBWeight: 0.7,
    forgiveness: 0.15,
    crossTalk: 0.2,
    biasStrength: 0.3,
    memoryBlend: 0.12,
    noise: 0.016,
  },
};
