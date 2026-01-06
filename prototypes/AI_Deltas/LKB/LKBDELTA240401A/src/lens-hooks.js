import { clamp } from "./utils.js";

export function harmonicLensAdjustments(metrics, config) {
  const { harmonicBoost, exploratoryBoost } = config.lens;
  const variance = metrics.localVariance || 0;
  const biasEnergy = metrics.biasEnergy || 0;

  const dampingBonus = clamp(variance * harmonicBoost, 0, 0.25);
  const explorationShift = clamp(biasEnergy * exploratoryBoost, 0, 0.25);

  return {
    forgivenessBoost: dampingBonus,
    pathBlendShift: explorationShift
  };
}
