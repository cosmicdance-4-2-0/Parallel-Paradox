export const DELTA_ID = '260102193929_BUCPOW8V';

export const defaultConfig = {
  gridSize: 14,
  steps: 240,
  fpsTarget: 60,
  randomSeed: null, // TODO: plug in deterministic RNG if repeatability is required.
  phases: {
    flipProbability: 0.016,
    parityProbability: 0.006,
    basePathB: 0.7,
    pathBClamp: [0.52, 0.92],
    alpha: 0.16,
    forgiveness: 0.5
  },
  bias: {
    strength: 0.12,
    decay: 0.93,
    radius: 3.25,
    pulses: [
      { time: 5, depth: 0.15, pan: -0.2, amplitude: 0.8 },
      { time: 20, depth: 0.8, pan: 0.25, amplitude: 0.65 },
      { time: 60, depth: 0.45, pan: 0.0, amplitude: 0.9 },
      { time: 120, depth: 0.25, pan: -0.35, amplitude: 0.7 }
    ]
  },
  lens: {
    weights: {
      human: 0.25,
      predictive: 0.25,
      systemic: 0.25,
      harmonic: 0.25
    },
    biasGain: 0.08,
    forgivenessFloor: 0.25,
    dispersionThreshold: 0.35
  }
};

export function withConfig(overrides = {}) {
  return {
    ...defaultConfig,
    ...overrides,
    phases: { ...defaultConfig.phases, ...(overrides.phases || {}) },
    bias: { ...defaultConfig.bias, ...(overrides.bias || {}) },
    lens: { ...defaultConfig.lens, ...(overrides.lens || {}) }
  };
}
