// Lens suite for PhaseCube Delta (DeltaID: A6P9Q4)
// Encodes human/predictive/systemic/harmonic modulators as tunable weights.

export class LensSuite {
  constructor(weights, gains) {
    this.weights = weights;
    this.gains = gains;
  }

  updateWeights(next) {
    this.weights = { ...this.weights, ...next };
  }

  evaluate(state) {
    const { metrics, historyBias, divergence } = state;
    const meanCoherence = (metrics.core.coherence + metrics.echo.coherence + metrics.scout.coherence) / 3;
    const energySpread = Math.abs(metrics.core.energy - metrics.echo.energy) + Math.abs(metrics.scout.energy - metrics.core.energy);

    // Human lens: reward smoothness/coherence as gentle bias.
    const humanBias = this.weights.human * (meanCoherence - 0.5) * this.gains.bias;

    // Predictive lens: favor exploratory branch shifts when divergence is high.
    const predictiveMixShift = this.weights.predictive * divergence * this.gains.mixShift;

    // Systemic lens: regulate cross-grid coupling when energies drift apart.
    const systemicCross = this.weights.systemic * energySpread * 0.5;

    // Harmonic lens: emphasize memory blending when history accumulates.
    const harmonicMemory = 1 + this.weights.harmonic * historyBias * this.gains.memoryGain;

    const globalBias = humanBias + historyBias * 0.25;
    const crossBiases = {
      core: systemicCross * (metrics.echo.energy - metrics.core.energy),
      echo: systemicCross * (metrics.scout.energy - metrics.echo.energy),
      scout: systemicCross * (metrics.core.energy - metrics.scout.energy)
    };

    const noiseScale = this.gains.noiseFloor + this.weights.predictive * 0.45;
    return {
      globalBias,
      mixShift: predictiveMixShift,
      memoryBlend: harmonicMemory,
      crossBiases,
      noiseScale,
      label: `Lens blend H${this.weights.human.toFixed(2)} P${this.weights.predictive.toFixed(2)} S${this.weights.systemic.toFixed(2)} E${this.weights.harmonic.toFixed(2)}`
    };
  }
}
