// PhaseCube Delta — Lens-Fused Memory Swarm (DeltaID: 51YQ1R77CF89)
// Minimal ES module: grid dynamics, lens fusion, memory shadow, renderer, and controls.
// TODO: Promote harmonic lens into an explicit module to plug alternative ethics/goal shapers.

import { DEFAULT_CONFIG, withOverrides } from './config.js';

const DELTA_ID = '51YQ1R77CF89';
const TWO_PI = Math.PI * 2;

function wrap01(value) {
  const v = value % 1;
  return v < 0 ? v + 1 : v;
}

class BiasPulse {
  constructor(config) {
    this.config = config;
    this.phase = 0;
  }

  sample() {
    const { amplitude, period, jitter } = this.config;
    this.phase = (this.phase + 1) % period;
    const base = Math.sin((this.phase / period) * TWO_PI);
    const noise = (Math.random() - 0.5) * jitter;
    return (base + noise) * amplitude;
  }

  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
}

class MemoryShadow {
  constructor(count, { decay, gain }) {
    this.decay = decay;
    this.gain = gain;
    this.shadow = new Float32Array(count);
  }

  blend(source) {
    const out = this.shadow;
    for (let i = 0; i < out.length; i++) {
      out[i] = out[i] * this.decay + source[i] * (1 - this.decay);
    }
    return out;
  }

  scaled(i) {
    return this.shadow[i] * this.gain;
  }

  updateConfig(cfg) {
    this.decay = cfg.decay;
    this.gain = cfg.gain;
  }
}

class PhaseGrid {
  constructor(size, config) {
    this.size = size;
    this.count = size * size * size;
    this.config = config;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this.neighbors = this._buildNeighbors();
    this.memory = new MemoryShadow(this.count, config.memory);
    this._seed();
  }

  _seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random();
      this.parity[i] = Math.random() < 0.5 ? 0 : 1;
    }
  }

  _buildNeighbors() {
    const n = new Int32Array(this.count * 6);
    const { size } = this;
    const idx = (x, y, z) => ((x * size + y) * size + z);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const base = idx(x, y, z) * 6;
          n[base + 0] = idx((x + 1) % size, y, z);
          n[base + 1] = idx((x + size - 1) % size, y, z);
          n[base + 2] = idx(x, (y + 1) % size, z);
          n[base + 3] = idx(x, (y + size - 1) % size, z);
          n[base + 4] = idx(x, y, (z + 1) % size);
          n[base + 5] = idx(x, y, (z + size - 1) % size);
        }
      }
    }
    return n;
  }

  neighborSlice(index) {
    const start = index * 6;
    return this.neighbors.subarray(start, start + 6);
  }

  perturb(noise) {
    const { parityProbability } = this.config;
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < noise) {
        this.plasma[i] = wrap01(this.plasma[i] + (Math.random() - 0.5) * 0.3);
      }
      if (Math.random() < parityProbability) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  metrics() {
    let mean = 0;
    let variance = 0;
    let coherence = 0;

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const delta = p - mean;
      mean += delta / (i + 1);
      variance += delta * (p - mean);

      const n = this.neighborSlice(i);
      let local = 0;
      for (let k = 0; k < 6; k++) local += this.plasma[n[k]];
      coherence += 1 - Math.abs(p - local / 6);
    }

    return {
      energy: mean,
      variance: variance / this.count,
      coherence: coherence / this.count
    };
  }

  updateConfig(config) {
    this.config = config;
    this.memory.updateConfig(config.memory);
  }

  forgivenessFactor(variance) {
    const { varianceSoftCap, minDamp, maxBoost } = this.config.forgiveness;
    const ratio = variance / Math.max(varianceSoftCap, 1e-5);
    if (ratio > 1) {
      const damp = 1 / (1 + (ratio - 1));
      return Math.max(minDamp, damp);
    }
    return Math.min(maxBoost, 1 + (1 - ratio) * 0.15);
  }

  step({ noise, lensWeights, bias }) {
    this.perturb(noise);
    const metrics = this.metrics();
    const forgiveness = this.forgivenessFactor(metrics.variance);
    const memField = this.memory.blend(this.liquid);

    const w = lensWeights;
    const weightSum = w.human + w.predictive + w.systemic + w.harmonic;
    const newLiquid = new Float32Array(this.count);
    const newSolid = new Float32Array(this.count);
    const newPlasma = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const neighbors = this.neighborSlice(i);

      let neighborMean = 0;
      for (let k = 0; k < 6; k++) neighborMean += this.plasma[neighbors[k]];
      neighborMean /= 6;

      const human = (p + l + s) / 3;
      const predictive = Math.abs(p - neighborMean) + this.parity[i] * 0.11;
      const systemic = metrics.energy;
      const harmonic = this.memory.scaled(i);

      const mixed = (human * w.human + predictive * w.predictive + systemic * w.systemic + harmonic * w.harmonic * forgiveness) / weightSum;
      const injected = wrap01(mixed + bias);

      newLiquid[i] = injected;
      newSolid[i] = wrap01(s * (1 - this.config.alpha) + mixed * this.config.alpha);
      newPlasma[i] = wrap01(p * 0.6 + injected * 0.4 + bias * 0.5);
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
    this.plasma = newPlasma;

    return {
      energy: metrics.energy,
      coherence: metrics.coherence,
      variance: metrics.variance,
      forgiveness
    };
  }
}

class Renderer {
  constructor(canvas, size, scale, rendererConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.scale = scale;
    this.config = rendererConfig;
    this.rotX = 0.4;
    this.rotY = 0.6;
    this.positions = this._positions();
    this.time = 0;
  }

  _positions() {
    const half = (this.size - 1) / 2;
    const list = new Float32Array(this.size * this.size * this.size * 3);
    let idx = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          list[idx++] = (x - half) * this.scale;
          list[idx++] = (y - half) * this.scale;
          list[idx++] = (z - half) * this.scale;
        }
      }
    }
    return list;
  }

  project(px, py, pz) {
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const x1 = px * cosY - pz * sinY;
    const z1 = px * sinY + pz * cosY;
    const y1 = py * cosX - z1 * sinX;
    const z2 = py * sinX + z1 * cosX + 320;

    const f = 420 / (420 + z2);
    return {
      x: this.canvas.width / 2 + x1 * f,
      y: this.canvas.height / 2 + y1 * f,
      depth: z2
    };
  }

  draw(grid, meta) {
    this.time += 1;
    const { ctx } = this;
    ctx.fillStyle = this.config.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const len = grid.plasma.length;
    for (let i = 0, p = 0; i < len; i++, p += 3) {
      const pos = this.project(this.positions[p], this.positions[p + 1], this.positions[p + 2]);
      const plasma = grid.plasma[i];
      const hue = (this.time * 0.003 + plasma + grid.parity[i] * 0.2) % 1;
      const r = Math.sin(hue * TWO_PI) * 127 + 128;
      const g = Math.sin(hue * TWO_PI + 2) * 127 + 128;
      const b = Math.sin(hue * TWO_PI + 4) * 127 + 128;
      const alpha = 0.22 + plasma * 0.6;
      const radius = this.config.pointSize + plasma * 5;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(3)})`;
      ctx.arc(pos.x, pos.y, radius, 0, TWO_PI);
      ctx.fill();
    }

    ctx.fillStyle = this.config.stroke;
    ctx.font = '14px monospace';
    const lines = [
      `Delta ${DELTA_ID}`,
      `Energy: ${meta.energy.toFixed(3)}`,
      `Coherence: ${meta.coherence.toFixed(3)}`,
      `Variance: ${meta.variance.toFixed(4)}`,
      `Harmonic damp: ${meta.forgiveness.toFixed(3)}`,
      `Bias: ${meta.bias.toFixed(3)}`,
      `Memory gain: ${meta.memoryGain.toFixed(3)}`
    ];
    for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], 16, 22 + i * 16);
  }
}

class ControlPanel {
  constructor(container, config, onChange) {
    this.container = container;
    this.config = config;
    this.onChange = onChange;
    this.render();
  }

  slider({ id, label, min, max, step, value }) {
    return `
      <label>${label}
        <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      </label>
    `;
  }

  render() {
    const { lenses, bias, memory, flipProbability } = this.config;
    this.container.innerHTML = `
      ${this.slider({ id: 'noise', label: 'Noise', min: 0, max: 0.05, step: 0.001, value: flipProbability })}
      ${this.slider({ id: 'bias', label: 'Bias', min: 0, max: 0.2, step: 0.005, value: bias.amplitude })}
      ${this.slider({ id: 'memory', label: 'Memory', min: 0, max: 1, step: 0.01, value: memory.gain })}
      <hr />
      ${this.slider({ id: 'human', label: 'Human Lens', min: 0, max: 1, step: 0.01, value: lenses.human })}
      ${this.slider({ id: 'predictive', label: 'Predictive Lens', min: 0, max: 1, step: 0.01, value: lenses.predictive })}
      ${this.slider({ id: 'systemic', label: 'Systemic Lens', min: 0, max: 1, step: 0.01, value: lenses.systemic })}
      ${this.slider({ id: 'harmonic', label: 'Harmonic Lens', min: 0, max: 1, step: 0.01, value: lenses.harmonic })}
    `;

    const bind = (id, handler) => {
      const el = this.container.querySelector(`#${id}`);
      el.addEventListener('input', () => handler(parseFloat(el.value)));
    };

    bind('noise', (v) => this.onChange({ flipProbability: v }));
    bind('bias', (v) => this.onChange({ bias: { ...this.config.bias, amplitude: v } }));
    bind('memory', (v) => this.onChange({ memory: { ...this.config.memory, gain: v } }));
    bind('human', (v) => this.onChange({ lenses: { ...this.config.lenses, human: v } }));
    bind('predictive', (v) => this.onChange({ lenses: { ...this.config.lenses, predictive: v } }));
    bind('systemic', (v) => this.onChange({ lenses: { ...this.config.lenses, systemic: v } }));
    bind('harmonic', (v) => this.onChange({ lenses: { ...this.config.lenses, harmonic: v } }));
  }
}

function main() {
  const canvas = document.getElementById('viewport');
  let config = structuredClone(DEFAULT_CONFIG);
  let grid = new PhaseGrid(config.gridSize, config);
  let pulse = new BiasPulse(config.bias);
  const renderer = new Renderer(canvas, config.gridSize, config.scale, config.renderer);
  let paused = false;

  const panel = new ControlPanel(document.getElementById('controls'), config, (overrides) => {
    config = withOverrides(config, overrides);
    grid.updateConfig(config);
    pulse.updateConfig(config.bias);
  });
  // TODO: Wire live preset buttons for quick lens profiles (calm, exploratory, consensus).
  void panel;

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') paused = !paused;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    renderer.rotY = nx * Math.PI;
    renderer.rotX = ny * Math.PI * 0.8;
  });

  function loop() {
    if (!paused) {
      const bias = pulse.sample();
      const stats = grid.step({
        noise: config.flipProbability,
        lensWeights: config.lenses,
        bias
      });
      renderer.draw(grid, { ...stats, bias, memoryGain: config.memory.gain });
    }
    requestAnimationFrame(loop);
  }

  loop();
}

window.addEventListener('DOMContentLoaded', main);
