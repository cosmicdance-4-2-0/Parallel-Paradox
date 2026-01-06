import { BiasField } from "./biasField.js";
import { PhaseGrid } from "./phaseGrid.js";
import { cloneField } from "./utils.js";

export class MultiGridSwarm {
  constructor(dims, baseConfig) {
    this.dims = dims;
    this.config = baseConfig;
    this.biasField = new BiasField(dims, baseConfig.bias.decay, baseConfig.bias.maxStrength);
    this.delayQueue = [];

    this.core = new PhaseGrid(dims, {
      alpha: baseConfig.alpha,
      noise: baseConfig.noise,
      forgiveness: baseConfig.forgiveness
    });
    this.echo = new PhaseGrid(dims, {
      alpha: baseConfig.alpha,
      noise: baseConfig.noise,
      forgiveness: baseConfig.forgiveness
    });
    this.memory = new PhaseGrid(dims, {
      alpha: baseConfig.alpha,
      noise: baseConfig.noise,
      forgiveness: baseConfig.forgiveness
    });

    this.echoBuffer = new Float32Array(dims.x * dims.y * dims.z);
  }

  enqueueDelaySnapshot(field) {
    const snapshot = cloneField(field);
    this.delayQueue.push(snapshot);
    if (this.delayQueue.length > this.config.delayDepth) {
      this.delayQueue.shift();
    }
  }

  delayedBias() {
    if (this.delayQueue.length === 0) return new Float32Array(this.biasField.field.length);
    return this.delayQueue[0];
  }

  injectRandomPulse(rng, strength = 0.25) {
    const center = {
      x: Math.floor(rng.nextFloat() * this.dims.x),
      y: Math.floor(rng.nextFloat() * this.dims.y),
      z: Math.floor(rng.nextFloat() * this.dims.z)
    };
    const radius = 1 + Math.floor(rng.nextFloat() * 2);
    this.biasField.injectSphere(center, radius, strength);
  }

  step(lensParams, rng) {
    this.biasField.applyDecay();
    if (rng.nextFloat() < 0.35) {
      this.injectRandomPulse(rng, this.config.bias.maxStrength * 0.6);
    }

    // Maintain echo buffer of recent bias (echo bias bus)
    for (let i = 0; i < this.echoBuffer.length; i += 1) {
      this.echoBuffer[i] =
        this.echoBuffer[i] * this.config.bias.decay +
        this.biasField.field[i] * this.config.bias.echoReturn;
    }

    // Delay line for memory grid
    this.enqueueDelaySnapshot(this.biasField.field);
    const delayed = this.delayedBias();

    // Coupling fields
    const toCore = new Float32Array(this.core.liquid.length);
    const toEcho = new Float32Array(this.core.liquid.length);
    const toMemory = new Float32Array(this.core.liquid.length);
    for (let i = 0; i < this.core.liquid.length; i += 1) {
      toCore[i] =
        this.config.coupling.coreFromEcho * this.echo.liquid[i] +
        this.config.coupling.coreFromMemory * this.memory.liquid[i] +
        this.echoBuffer[i];
      toEcho[i] = this.config.coupling.echoFromCore * this.core.liquid[i];
      toMemory[i] =
        this.config.coupling.memoryFromCore * this.core.liquid[i] +
        this.config.coupling.memoryFromEcho * this.echo.liquid[i] +
        delayed[i] * this.config.bias.delayWeight;
    }

    this.core.maybeRewire(rng, this.config.plasticityRate);
    this.echo.maybeRewire(rng, this.config.plasticityRate);
    this.memory.maybeRewire(rng, this.config.plasticityRate * 0.5);

    const coreMetrics = this.core.step(lensParams, this.biasField.field, toCore, rng);
    const echoMetrics = this.echo.step(lensParams, this.biasField.field, toEcho, rng);
    const memoryMetrics = this.memory.step(lensParams, delayed, toMemory, rng);

    return {
      core: coreMetrics,
      echo: echoMetrics,
      memory: memoryMetrics
    };
  }
}
