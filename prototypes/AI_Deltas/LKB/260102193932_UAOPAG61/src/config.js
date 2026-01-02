export const DeltaID = "260102193932_UAOPAG61";

const baseConfig = {
  gridSize: 12,
  flipProbability: 0.018,
  parityProbability: 0.01,
  alpha: 0.2,
  memoryAlpha: 0.14,
  traceAlpha: 0.08,
  path: {
    baseB: 0.62,
    min: 0.55,
    max: 0.9
  },
  bias: {
    decay: 0.93,
    strength: 0.14,
    radius: 2,
    maxMagnitude: 0.8
  },
  lensWeights: {
    human: 0.25,
    predictive: 0.25,
    systemic: 0.25,
    harmonic: 0.25
  },
  forgiveness: {
    dispersionThreshold: 0.18,
    floor: 0.45
  },
  delay: {
    length: 24,
    decay: 0.92
  },
  memoryWeight: 0.2,
  crosstalkWeight: 0.12,
  steps: 120,
  sampleCount: 16,
  pulses: [
    { step: 5, pan: -0.25, depth: 0.8, amplitude: 0.6 },
    { step: 28, pan: 0.35, depth: 0.35, amplitude: 0.8 },
    { step: 54, pan: -0.1, depth: 0.6, amplitude: 0.5 }
  ]
};

export function createConfig(overrides = {}) {
  return deepMerge(baseConfig, overrides);
}

function deepMerge(base, overrides) {
  const result = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overrides || {})) {
    const override = overrides[key];
    if (
      override &&
      typeof override === "object" &&
      !Array.isArray(override) &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], override);
    } else {
      result[key] = override;
    }
  }
  return result;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function gridVolume(size) {
  return size * size * size;
}
