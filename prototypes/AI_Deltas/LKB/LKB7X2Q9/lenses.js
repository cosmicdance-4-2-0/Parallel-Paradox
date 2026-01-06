import { clamp } from "./utils.js";

export function computeLensAdjustments(metrics, weights) {
  const { meanEnergy, variance, parityBias } = metrics;
  const safeWeights = normalize(weights);

  const human = humanLens(meanEnergy) * safeWeights.human;
  const predictive = predictiveLens(variance) * safeWeights.predictive;
  const systemic = systemicLens(parityBias) * safeWeights.systemic;
  const harmonic = harmonicLens(metrics) * safeWeights.harmonic;

  const pathBiasShift = clamp(human + predictive + systemic + harmonic, -0.25, 0.35);
  const echoBoost = clamp(predictive * 0.4 + harmonic * 0.3, -0.15, 0.2);
  const dampingBoost = clamp(Math.abs(harmonic) * 0.25, 0, 0.25);

  return { pathBiasShift, echoBoost, dampingBoost };
}

function normalize(weights) {
  const total = weights.human + weights.predictive + weights.systemic + weights.harmonic || 1;
  return {
    human: weights.human / total,
    predictive: weights.predictive / total,
    systemic: weights.systemic / total,
    harmonic: weights.harmonic / total,
  };
}

function humanLens(meanEnergy) {
  // Human lens calms spikes: lower path bias when energy climbs.
  return clamp(0.2 - meanEnergy * 0.3, -0.15, 0.1);
}

function predictiveLens(variance) {
  // Predictive lens favors exploration when variance is low.
  return clamp(variance < 0.12 ? 0.15 : -0.05, -0.1, 0.2);
}

function systemicLens(parityBias) {
  // Systemic lens pushes toward balance when parity drifts.
  const drift = Math.abs(parityBias - 0.5);
  return clamp(drift * -0.25, -0.1, 0);
}

function harmonicLens(metrics) {
  // Harmonic lens damps extremes and nudges toward mid-energy.
  const bias = metrics.meanEnergy - 0.5;
  return clamp(-bias * 0.2, -0.12, 0.12);
}
