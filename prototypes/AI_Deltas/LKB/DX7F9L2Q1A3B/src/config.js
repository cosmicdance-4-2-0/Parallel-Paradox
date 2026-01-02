export const DeltaID = 'DX7F9L2Q1A3B';

export const baseConfig = {
  gridSize: 10,
  basePathBias: 0.7,
  alpha: 0.2,
  noiseFlip: 0.012,
  parityFlip: 0.005,
  parityWeight: 0.08,
  biasGain: 0.12,
  harmonicClamp: 0.18,
  decay: 0.94,
  biasRadius: 2,
  biasStrength: 0.07,
  biasBins: 24,
  lens: {
    predictiveWeight: 0.6,
    harmonicWeight: 0.45,
    energyFloor: 0.18,
    energyCeil: 0.82,
    divergenceTarget: 0.12
  },
  render: {
    pointSize: 4,
    scale: 22,
    visThreshold: 0.015
  }
};

export function mergeConfig(overrides = {}) {
  return {
    ...baseConfig,
    ...overrides,
    lens: { ...baseConfig.lens, ...(overrides.lens || {}) },
    render: { ...baseConfig.render, ...(overrides.render || {}) }
  };
}
