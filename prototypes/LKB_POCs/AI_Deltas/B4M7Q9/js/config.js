export const DeltaID = "B4M7Q9";

export const defaultConfig = {
  gridSize: 16,
  flipProb: 0.02,
  parityProb: 0.01,
  pathBWeight: 0.55,
  parityBoost: 0.13,
  alpha: 0.18,
  forgivenessThreshold: 0.35,
  forgivenessDamping: 0.35,
  biasDecay: 0.9,
  biasStrength: 0.35,
  couplingWeight: 0.15,
  pointSize: 4.5,
  scale: 26,
  fov: Math.PI / 4,
  cameraZ: 420,
  bg: "#0b0c10",
};

export function createConfig(overrides = {}) {
  return { ...defaultConfig, ...overrides, DeltaID };
}
