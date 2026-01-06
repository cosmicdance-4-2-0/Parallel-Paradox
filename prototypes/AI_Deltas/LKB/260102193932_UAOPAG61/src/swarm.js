import { BiasField, blendBiasFields } from "./bias.js";
import { DelayLine } from "./delay.js";
import { LensMixer } from "./lens.js";
import { PhaseGrid } from "./grid.js";

export class TriGridSwarm {
  constructor(config) {
    this.config = config;
    this.biasField = new BiasField(config.gridSize, config.bias);
    this.delayLine = new DelayLine(config.delay.length, config.delay.decay, config.gridSize);
    this.lensMixer = new LensMixer(config);
    this.core = new PhaseGrid(config.gridSize, config);
    this.echo = new PhaseGrid(config.gridSize, {
      ...config,
      alpha: config.alpha * 0.9,
      traceAlpha: config.traceAlpha * 0.8
    });
    this.memory = new PhaseGrid(config.gridSize, {
      ...config,
      alpha: config.memoryAlpha,
      traceAlpha: config.traceAlpha * 1.2
    });
  }

  step(stepIndex, pulses = []) {
    this.biasField.decayField();
    for (const pulse of pulses) this.biasField.ingestPulse(pulse);

    const memoryBias = this.delayLine.mix();
    const blendedBias = blendBiasFields({
      base: this.biasField.values,
      memory: memoryBias,
      crosstalk: this.echo.liquid,
      memoryWeight: this.config.memoryWeight,
      crosstalkWeight: this.config.crosstalkWeight,
      maxMagnitude: this.config.bias.maxMagnitude
    });

    const lensMix = this.lensMixer.mix(this.core.metrics(this.biasField));

    this.core.perturb(1);
    this.echo.perturb(0.8);
    this.memory.perturb(0.6);

    this.core.step(lensMix, blendedBias);
    this.echo.step({ ...lensMix, damping: Math.min(1, lensMix.damping + 0.05) }, blendedBias);
    this.memory.step({ ...lensMix, damping: Math.min(1, lensMix.damping + 0.1) }, blendedBias);

    this.delayLine.push(this.core.liquid);

    const metrics = this.core.metrics(this.biasField);
    const oracle = this.core.oracle(this.config.sampleCount);

    return {
      step: stepIndex,
      energy: metrics.energy,
      dispersion: metrics.dispersion,
      biasLoad: metrics.biasLoad,
      traceMean: metrics.traceMean,
      oracle
    };
  }
}
