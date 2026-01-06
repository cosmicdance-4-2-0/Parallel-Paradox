export const defaultConfig = {
  gridSize: 12,
  scale: 20,
  pointSize: 4,
  flipProbability: 0.012,
  parityProbability: 0.006,
  parityKick: 0.12,
  pathBlend: 0.68,
  solidBlend: 0.18,
  forgivenessThreshold: 0.22,
  forgivenessDamping: 0.6,
  biasGain: 0.12,
  bias: {
    decay: 0.06,
    diffusion: 0.18,
    radius: 2,
    strength: 0.12
  },
  lens: {
    harmonicBoost: 0.08,
    exploratoryBoost: 0.1
  },
  run: {
    steps: 64,
    biasPulseEvery: 6
  },
  deltaId: "LKBDELTA240401A"
};

export function withOverrides(overrides = {}) {
  return structuredClone({
    ...defaultConfig,
    ...overrides,
    bias: { ...defaultConfig.bias, ...(overrides.bias || {}) },
    lens: { ...defaultConfig.lens, ...(overrides.lens || {}) },
    run: { ...defaultConfig.run, ...(overrides.run || {}) }
  });
}
