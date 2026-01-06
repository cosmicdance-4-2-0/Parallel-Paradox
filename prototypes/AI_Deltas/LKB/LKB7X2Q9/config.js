export const DeltaID = "LKB7X2Q9";

export const baseConfig = {
  gridSize: 16,
  scale: 20,
  plasmaFlip: 0.015,
  parityFlip: 0.0035,
  basePathBias: 0.55,
  alpha: 0.18,
  echoBlend: 0.32,
  echoDecay: 0.92,
  harmonicClamp: { min: 0.12, max: 0.78 },
  bias: {
    gain: 0.35,
    pulseSpeed: 0.32,
    driftSpeed: 0.05,
    pointerTilt: 0.2,
  },
  camera: {
    distance: 120,
    fov: 0.95,
    rotateSpeed: 0.0025,
  },
  ui: {
    sliders: {
      noise: { min: 0.0, max: 0.05, step: 0.001 },
      pathBias: { min: 0.0, max: 1.0, step: 0.01 },
      biasGain: { min: 0.0, max: 1.0, step: 0.01 },
      echoBlend: { min: 0.0, max: 1.0, step: 0.01 },
    },
    lens: { min: 0.0, max: 2.0, step: 0.05 },
  },
};

export const palette = {
  plasma: "#f6c90e",
  liquid: "#6ec5ff",
  solid: "#c86bfa",
  parity: "#ff6b6b",
  hud: "#a0aec0",
};
