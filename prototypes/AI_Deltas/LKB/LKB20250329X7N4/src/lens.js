import { clamp } from "./utils.js";

export function computeLensControls(metrics, config) {
  const { energy, dispersion, biasLevel } = metrics;
  const { lensWeights, pathB, coupling, forgiveness } = config;

  const explorationPush = lensWeights.predictive * (0.15 + biasLevel * 0.4);
  const humanResponse = lensWeights.human * Math.min(biasLevel * 1.2, 0.35);
  const systemicBrake = lensWeights.systemic * clamp(dispersion - 0.22, 0, 0.6);
  const harmonicBrake = lensWeights.harmonic * clamp(dispersion - forgiveness.threshold, 0, 0.6);

  const pathBProb = clamp(
    pathB.base + explorationPush + humanResponse - systemicBrake - harmonicBrake,
    pathB.clamp[0],
    pathB.clamp[1]
  );

  const damping = clamp(forgiveness.damp + harmonicBrake * 0.5, 0, 0.95);
  const echoGain = clamp(coupling.echoGain + systemicBrake * 0.4, 0, 0.7);
  const biasGain = clamp(coupling.biasGain + energy * 0.1 + biasLevel * 0.25, 0, 1);

  return { pathBProb, damping, echoGain, biasGain };
}
