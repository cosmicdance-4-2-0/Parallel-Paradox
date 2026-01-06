import { BiasField } from "./bias-field.js";
import { CONFIG } from "./config.js";
import { DelayLine } from "./delay-line.js";
import { LensFusion } from "./lens.js";
import { PhaseGrid } from "./grid.js";
import { average, copyField } from "./utils.js";

export class MultiGridSwarm {
  constructor(userConfig = {}) {
    this.config = {
      ...CONFIG,
      ...userConfig,
      grid: { ...CONFIG.grid, ...(userConfig.grid || {}) },
      bias: { ...CONFIG.bias, ...(userConfig.bias || {}) },
      delay: { ...CONFIG.delay, ...(userConfig.delay || {}) },
      swarm: { ...CONFIG.swarm, ...(userConfig.swarm || {}) },
      lens: { ...CONFIG.lens, ...(userConfig.lens || {}) },
    };

    const size = this.config.grid.size;
    this.biasField = new BiasField(size, this.config.bias);
    this.delayLine = new DelayLine(
      this.config.delay.length,
      this.config.delay.decay
    );
    this.core = new PhaseGrid(size, this.config.grid);
    this.echo = new PhaseGrid(size, this.config.grid);
    this.memory = new PhaseGrid(size, this.config.grid);
    this.lens = new LensFusion(this.config.lens);
    this.previousMetrics = {
      energy: 0.2,
      coherence: 0.5,
      divergence: 0.2,
    };
  }

  injectBias(pulse) {
    this.biasField.injectPulse({
      x: pulse.x % this.config.grid.size,
      y: pulse.y % this.config.grid.size,
      z: pulse.z % this.config.grid.size,
      strength: pulse.strength ?? this.config.bias.injectionStrength,
      radius: pulse.radius ?? this.config.bias.radius,
    });
  }

  computeCrossTalkFields(crossTalkGain) {
    const length = this.core.liquid.length;
    const coreView = this.core.liquid;
    const echoView = this.echo.liquid;
    const memoryView = this.memory.liquid;

    const empty = () => new Float32Array(length);
    const coreBias = empty();
    const echoBias = empty();
    const memoryBias = empty();

    for (let i = 0; i < length; i += 1) {
      const echoMemoryAvg = (echoView[i] + memoryView[i]) * 0.5;
      const coreEchoAvg = (coreView[i] + echoView[i]) * 0.5;
      const coreMemoryAvg = (coreView[i] + memoryView[i]) * 0.5;

      coreBias[i] = echoMemoryAvg * crossTalkGain;
      echoBias[i] = coreMemoryAvg * crossTalkGain;
      memoryBias[i] = coreEchoAvg * crossTalkGain;
    }
    return { coreBias, echoBias, memoryBias };
  }

  composeBiasField(extraFields = [], gain = 1) {
    const base = copyField(this.biasField.view());
    for (const { field, weight } of extraFields) {
      if (!field) continue;
      const scaled = weight ?? gain;
      for (let i = 0; i < base.length; i += 1) {
        base[i] += field[i] * scaled;
      }
    }
    return base;
  }

  smoothMetrics(current) {
    const blend = this.config.swarm.metricSmoothing;
    const smoothed = {
      energy: current.energy * blend + this.previousMetrics.energy * (1 - blend),
      coherence:
        current.coherence * blend + this.previousMetrics.coherence * (1 - blend),
      divergence:
        current.divergence * blend + this.previousMetrics.divergence * (1 - blend),
    };
    this.previousMetrics = smoothed;
    return smoothed;
  }

  step() {
    this.biasField.tick();

    const baselineMetrics = this.smoothMetrics(
      this.measureAggregateMetrics()
    );
    // TODO: Add audio/file bias drivers to translate external signals into bounded pulses (per SV3/SV7).
    const lensControls = this.lens.deriveControls(baselineMetrics);
    const { coreBias, echoBias, memoryBias } = this.computeCrossTalkFields(
      this.config.swarm.crossTalk + lensControls.crossTalkGain
    );

    const delayField = this.delayLine.compose();
    const baseBiasFields = [{ field: delayField, weight: this.config.delay.gain }];

    const coreBiasField = this.composeBiasField(
      [{ field: coreBias, weight: 1 }, ...baseBiasFields],
      lensControls.biasGain
    );
    const echoBiasField = this.composeBiasField(
      [{ field: echoBias, weight: 1 }, ...baseBiasFields],
      lensControls.biasGain
    );
    const memoryBiasField = this.composeBiasField(
      [
        { field: memoryBias, weight: this.config.swarm.memoryBiasGain },
        ...baseBiasFields,
      ],
      lensControls.biasGain
    );

    const coreMetrics = this.core.step(coreBiasField, lensControls);
    const echoMetrics = this.echo.step(echoBiasField, lensControls);
    const memoryMetrics = this.memory.step(memoryBiasField, lensControls);

    const compositeBias = this.composeBiasField(
      [
        { field: this.core.liquid, weight: 0.15 },
        { field: this.echo.liquid, weight: 0.15 },
        { field: this.memory.liquid, weight: 0.25 },
      ],
      this.config.delay.gain
    );
    this.delayLine.push(compositeBias);

    return {
      lensControls,
      coreMetrics,
      echoMetrics,
      memoryMetrics,
      aggregate: this.measureAggregateMetrics(),
    };
  }

  measureAggregateMetrics() {
    const energy = average([
      this.measureEnergy(this.core.liquid),
      this.measureEnergy(this.echo.liquid),
      this.measureEnergy(this.memory.liquid),
    ]);
    const coherence = average([
      this.measureCoherence(this.core.liquid),
      this.measureCoherence(this.echo.liquid),
      this.measureCoherence(this.memory.liquid),
    ]);
    const divergence = average([
      this.measureDivergence(this.core.liquid, this.echo.liquid),
      this.measureDivergence(this.core.liquid, this.memory.liquid),
      this.measureDivergence(this.echo.liquid, this.memory.liquid),
    ]);
    return { energy, coherence, divergence };
  }

  measureEnergy(field) {
    let acc = 0;
    for (let i = 0; i < field.length; i += 1) {
      acc += Math.abs(field[i]);
    }
    return acc / field.length;
  }

  measureCoherence(field) {
    const mean = this.measureMean(field);
    let acc = 0;
    for (let i = 0; i < field.length; i += 1) {
      const diff = field[i] - mean;
      acc += diff * diff;
    }
    return 1 - Math.min(acc / field.length, 1);
  }

  measureDivergence(a, b) {
    let acc = 0;
    for (let i = 0; i < a.length; i += 1) {
      acc += Math.abs(a[i] - b[i]);
    }
    return Math.min(acc / a.length, 1);
  }

  measureMean(field) {
    let acc = 0;
    for (let i = 0; i < field.length; i += 1) {
      acc += field[i];
    }
    return acc / field.length;
  }
}
