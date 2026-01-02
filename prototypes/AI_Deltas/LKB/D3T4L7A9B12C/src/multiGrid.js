import { BiasField } from './biasField.js';
import { DelayLine } from './delayLine.js';
import { PhaseGrid } from './phaseGrid.js';

export class MultiGridSwarm {
  constructor(config, lensController, rng = Math) {
    this.config = config;
    this.lensController = lensController;
    this.biasField = new BiasField(config.gridSize, config.bias.decay);
    this.delayLine = new DelayLine(config.delay.length, config.delay.decay);
    this.core = new PhaseGrid(config.gridSize, config, rng);
    this.echo = new PhaseGrid(config.gridSize, config, rng);
    this.memory = new PhaseGrid(config.gridSize, config, rng);
    this.metrics = [];
  }

  injectPulse({ value = 0.2, radius = 1 } = {}) {
    const centerIndex = Math.floor(this.biasField.length / 2);
    this.biasField.injectSphere(centerIndex, radius, value);
  }

  tick(externalBiasValue = 0) {
    this.biasField.decay();
    if (externalBiasValue) {
      this.biasField.injectUniform(externalBiasValue);
    }

    this.delayLine.push(this.biasField.field);
    const delayBias = this.delayLine.mix();

    const lensWeights = this.lensController.tick();

    // Step echo and memory first to capture auxiliary influence.
    const echoMetrics = this._stepGrid(this.echo, delayBias, lensWeights);
    const memoryMetrics = this._stepGrid(this.memory, delayBias, lensWeights);

    // Cross-talk into bias field respecting coupling weights.
    for (let i = 0; i < this.biasField.length; i += 1) {
      this.biasField.field[i] += this.echo.liquid[i] * this.config.coupling.echoToCore;
      this.biasField.field[i] += this.memory.liquid[i] * this.config.coupling.memoryToCore;
    }

    const coreMetrics = this._stepGrid(this.core, delayBias, lensWeights);

    const snapshot = {
      lensWeights,
      core: coreMetrics,
      echo: echoMetrics,
      memory: memoryMetrics
    };
    this.metrics.push(snapshot);
    return snapshot;
  }

  _stepGrid(grid, delayBias, lensWeights) {
    grid.perturb();
    return grid.step(this.biasField, lensWeights, { delayBias });
  }
}
