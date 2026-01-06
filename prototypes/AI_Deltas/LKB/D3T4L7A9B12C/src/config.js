export const DELTA_ID = 'D3T4L7A9B12C';

export const defaultConfig = {
  deltaId: DELTA_ID,
  gridSize: 16,
  flipProbability: 0.02,
  parityProbability: 0.01,
  pathBProbability: 0.65,
  alpha: 0.18,
  forgiveness: {
    threshold: 0.35,
    strength: 0.42
  },
  bias: {
    decay: 0.965,
    gain: 0.18
  },
  delay: {
    length: 6,
    decay: 0.82
  },
  coupling: {
    echoToCore: 0.07,
    memoryToCore: 0.05
  },
  plasticityProbability: 0.001,
  lensPresets: {
    harmonic: { cognitive: 0.35, predictive: 0.35, systemic: 0.2, harmonic: 0.55 },
    exploratory: { cognitive: 0.18, predictive: 0.65, systemic: 0.25, harmonic: 0.25 },
    stable: { cognitive: 0.42, predictive: 0.18, systemic: 0.28, harmonic: 0.52 }
  }
};

export function mergeConfig(overrides = {}) {
  return {
    ...defaultConfig,
    ...overrides,
    forgiveness: { ...defaultConfig.forgiveness, ...(overrides.forgiveness || {}) },
    bias: { ...defaultConfig.bias, ...(overrides.bias || {}) },
    delay: { ...defaultConfig.delay, ...(overrides.delay || {}) },
    coupling: { ...defaultConfig.coupling, ...(overrides.coupling || {}) },
    lensPresets: { ...defaultConfig.lensPresets, ...(overrides.lensPresets || {}) }
  };
}
