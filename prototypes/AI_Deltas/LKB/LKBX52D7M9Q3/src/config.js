export const deltaId = "LKBX52D7M9Q3";

export const config = {
  gridSize: 12,
  steps: 180,
  flipProbability: 0.02,
  parityProbability: 0.01,
  alpha: 0.18,
  traceAlpha: 0.12,
  basePathB: 0.62,
  pathBRange: [0.25, 0.85],
  bias: {
    decay: 0.07,
    strength: 0.55,
    radius: 2.4
  },
  forgiveness: {
    dispersionThreshold: 0.18,
    floor: 0.55
  },
  lensWeights: {
    human: 0.24,
    predictive: 0.26,
    systemic: 0.25,
    harmonic: 0.25
  },
  biasGain: {
    base: 0.35,
    boost: 0.35
  },
  pulseSchedule: [
    { step: 14, amplitude: 0.6, pan: -0.45, depth: 0.8 },
    { step: 52, amplitude: 0.55, pan: 0.35, depth: 0.35 },
    { step: 104, amplitude: 0.65, pan: 0.05, depth: 0.55 },
    { step: 142, amplitude: 0.5, pan: -0.1, depth: 0.25 }
  ]
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function idxFromCoord(x, y, z, size) {
  return ((x % size + size) % size) + ((y % size + size) % size) * size + ((z % size + size) % size) * size * size;
}

export function coordFromIndex(i, size) {
  const s = size;
  const x = i % s;
  const y = Math.floor(i / s) % s;
  const z = Math.floor(i / (s * s));
  return { x, y, z };
}
