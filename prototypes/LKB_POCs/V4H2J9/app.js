// PhaseCube Delta — Memory-Biased Dual Swarm (DeltaID: V4H2J9)
// This ES module keeps the POC modular, human-readable, and tuned for easy iteration.
// TODO: Thing, for reasons — swap canvas renderer for WebGL instancing when scaling agent counts.

import { DEFAULT_CONFIG, withOverrides } from './config.js';

const DELTA_ID = 'V4H2J9';
const TWO_PI = Math.PI * 2;

function wrap01(value) {
  const v = value % 1;
  return v < 0 ? v + 1 : v;
}

class DelayLine {
  constructor(length, decay, gain) {
    this.buffer = new Float32Array(Math.max(1, length));
    this.decay = decay;
    this.gain = gain;
    this.index = 0;
  }

  push(value) {
    // Store newest value and advance index.
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.buffer.length;

    // Return decayed sum as a gentle historical bias.
    let influence = 0;
    let weight = 1;
    for (let i = 0; i < this.buffer.length; i++) {
      const idx = (this.index + i) % this.buffer.length;
      influence += this.buffer[idx] * weight;
      weight *= this.decay;
    }
    return influence * this.gain / this.buffer.length;
  }
}

class NeighborGraph {
  constructor(size) {
    this.size = size;
    this.count = size * size * size;
    this.edges = new Int32Array(this.count * 6); // 6 neighbors per cell.
    this._seedCardinal();
  }

  _seedCardinal() {
    const { size } = this;
    const idx = (x, y, z) => ((x * size + y) * size + z);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const base = idx(x, y, z) * 6;
          this.edges[base + 0] = idx((x + 1) % size, y, z);
          this.edges[base + 1] = idx((x + size - 1) % size, y, z);
          this.edges[base + 2] = idx(x, (y + 1) % size, z);
          this.edges[base + 3] = idx(x, (y + size - 1) % size, z);
          this.edges[base + 4] = idx(x, y, (z + 1) % size);
          this.edges[base + 5] = idx(x, y, (z + size - 1) % size);
        }
      }
    }
  }

  neighborIndices(cellIndex) {
    const start = cellIndex * 6;
    return this.edges.subarray(start, start + 6);
  }

  rewireRandomEdge() {
    // Minimal structural plasticity: reassign one neighbor edge at random.
    const cell = Math.floor(Math.random() * this.count);
    const edgeSlot = Math.floor(Math.random() * 6);
    const target = Math.floor(Math.random() * this.count);
    this.edges[cell * 6 + edgeSlot] = target;
  }
}

class PlasticityManager {
  constructor(config, graph) {
    this.config = config;
    this.graph = graph;
    this.frameCounter = 0;
  }

  tick() {
    this.frameCounter++;
    if (this.frameCounter % this.config.window !== 0) return;
    if (Math.random() < this.config.rewireProbability) {
      this.graph.rewireRandomEdge();
    }
  }
}

class PhaseGrid {
  constructor(size, config, graph) {
    this.size = size;
    this.count = size * size * size;
    this.graph = graph;
    this.config = config;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this._seed();
  }

  _seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random();
      this.parity[i] = 0;
    }
  }

  perturb(noise) {
    // Inject bounded noise to avoid collapse.
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < noise) {
        this.plasma[i] = wrap01(this.plasma[i] + (Math.random() - 0.5) * 0.25);
      }
      if (Math.random() < this.config.parityProbability) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  step(biasField = 0, crossBias = 0) {
    const { alpha, pathBProbability } = this.config;
    const newLiquid = new Float32Array(this.count);
    const newSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];

      const neighbors = this.graph.neighborIndices(i);
      let neighborMean = 0;
      for (let n = 0; n < neighbors.length; n++) neighborMean += this.plasma[neighbors[n]];
      neighborMean /= neighbors.length;

      const avg = (p + l + s) / 3;
      const nb = Math.abs(p - neighborMean) + this.parity[i] * 0.12 + crossBias;
      const mix = Math.random() < pathBProbability ? nb : avg;
      const blended = mix + biasField;

      newLiquid[i] = wrap01(blended);
      newSolid[i] = wrap01(s * (1 - alpha) + mix * alpha);
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
  }

  metrics() {
    // Compute simple observability metrics for overlays.
    let energy = 0;
    let coherence = 0;
    for (let i = 0; i < this.count; i++) {
      energy += this.plasma[i];
      const neighbors = this.graph.neighborIndices(i);
      let local = 0;
      for (let n = 0; n < neighbors.length; n++) local += this.plasma[neighbors[n]];
      coherence += 1 - Math.abs(this.plasma[i] - local / neighbors.length);
    }
    return {
      energy: energy / this.count,
      coherence: coherence / this.count
    };
  }
}

class MultiGridSwarm {
  constructor(config) {
    this.config = config;
    this.graph = new NeighborGraph(config.gridSize);
    this.plasticity = new PlasticityManager(config.plasticity, this.graph);
    this.core = new PhaseGrid(config.gridSize, config, this.graph);
    this.echo = new PhaseGrid(config.gridSize, config, this.graph);
    this.delay = new DelayLine(config.delay.length, config.delay.decay, config.delay.gain);
    this.frame = 0;
  }

  step(noise) {
    this.frame++;
    this.plasticity.tick();

    this.core.perturb(noise);
    this.echo.perturb(noise * 0.9);

    const coreMetrics = this.core.metrics();
    const echoMetrics = this.echo.metrics();
    const historyBias = this.delay.push(coreMetrics.energy);

    const crossEcho = this.config.coupling.echoToCore * (echoMetrics.energy - coreMetrics.energy);
    const crossCore = this.config.coupling.coreToEcho * (coreMetrics.energy - echoMetrics.energy);

    this.core.step(historyBias, crossEcho);
    this.echo.step(historyBias * 0.6, crossCore);

    return { coreMetrics, echoMetrics, historyBias };
  }
}

class Renderer {
  constructor(canvas, size, scale, rendererConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.scale = scale;
    this.rendererConfig = rendererConfig;
    this.time = 0;
    this.rotateX = 0.35;
    this.rotateY = 0.65;
    this.positions = this._buildPositions();
  }

  _buildPositions() {
    const half = (this.size - 1) / 2;
    const positions = new Float32Array(this.size * this.size * this.size * 3);
    let idx = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          positions[idx++] = (x - half) * this.scale;
          positions[idx++] = (y - half) * this.scale;
          positions[idx++] = (z - half) * this.scale;
        }
      }
    }
    return positions;
  }

  project(posX, posY, posZ) {
    // Simple perspective projection with Y then X rotation.
    const cosY = Math.cos(this.rotateY);
    const sinY = Math.sin(this.rotateY);
    const cosX = Math.cos(this.rotateX);
    const sinX = Math.sin(this.rotateX);

    const x1 = posX * cosY - posZ * sinY;
    const z1 = posX * sinY + posZ * cosY;
    const y1 = posY * cosX - z1 * sinX;
    const z2 = posY * sinX + z1 * cosX + 300; // Camera offset.

    const f = 400 / (400 + z2);
    return {
      x: this.canvas.width / 2 + x1 * f,
      y: this.canvas.height / 2 + y1 * f,
      depth: z2
    };
  }

  draw(gridA, gridB, metrics) {
    this.time += 1;
    const { pointSize, strokeAlpha, bg } = this.rendererConfig;
    const ctx = this.ctx;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render both grids; slight tinting distinguishes them.
    const renderGrid = (grid, hueOffset, alphaScale) => {
      const len = grid.plasma.length;
      for (let i = 0, p = 0; i < len; i++, p += 3) {
        const pos = this.project(this.positions[p], this.positions[p + 1], this.positions[p + 2]);
        const plasma = grid.plasma[i];
        const hue = (this.time * 0.001 + hueOffset + plasma) % 1;
        const r = Math.sin(hue * TWO_PI) * 127 + 128;
        const g = Math.sin(hue * TWO_PI + 2) * 127 + 128;
        const b = Math.sin(hue * TWO_PI + 4) * 127 + 128;
        const alpha = 0.2 + plasma * alphaScale;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(3)})`;
        ctx.arc(pos.x, pos.y, pointSize + plasma * 4, 0, TWO_PI);
        ctx.fill();
      }
    };

    renderGrid(gridA, 0.0, 0.6);
    renderGrid(gridB, 0.3, 0.4);

    // Overlay metrics for interpretability.
    ctx.fillStyle = `rgba(255,255,255,${strokeAlpha})`;
    ctx.font = '14px monospace';
    const lines = [
      `Delta ${DELTA_ID}`,
      `Core Energy: ${metrics.core.energy.toFixed(3)}`,
      `Echo Energy: ${metrics.echo.energy.toFixed(3)}`,
      `Core Coherence: ${metrics.core.coherence.toFixed(3)}`,
      `Echo Coherence: ${metrics.echo.coherence.toFixed(3)}`,
      `Divergence: ${metrics.divergence.toFixed(3)}`,
      `History Bias: ${metrics.historyBias.toFixed(3)}`
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 12, 20 + i * 16);
    }
  }
}

class ControlPanel {
  constructor(container, config, onChange) {
    this.container = container;
    this.config = config;
    this.onChange = onChange;
    this._build();
  }

  _build() {
    this.container.innerHTML = `
      <label>Noise <input id="noise" type="range" min="0" max="0.08" step="0.001" value="${this.config.flipProbability}" /></label>
      <label>Cross-talk <input id="cross" type="range" min="0" max="0.5" step="0.01" value="${this.config.coupling.coreToEcho}" /></label>
      <label>Plasticity <input id="plastic" type="range" min="0" max="0.01" step="0.0005" value="${this.config.plasticity.rewireProbability}" /></label>
      <label>Delay Gain <input id="delay" type="range" min="0" max="1" step="0.01" value="${this.config.delay.gain}" /></label>
    `;

    const bind = (id, handler) => {
      const el = this.container.querySelector(`#${id}`);
      el.addEventListener('input', () => handler(parseFloat(el.value)));
    };

    bind('noise', (v) => this.onChange({ flipProbability: v }));
    bind('cross', (v) => this.onChange({ coupling: { ...this.config.coupling, coreToEcho: v, echoToCore: v * 0.75 } }));
    bind('plastic', (v) => this.onChange({ plasticity: { ...this.config.plasticity, rewireProbability: v } }));
    bind('delay', (v) => this.onChange({ delay: { ...this.config.delay, gain: v } }));
  }
}

function init() {
  let config = { ...DEFAULT_CONFIG };
  const canvas = document.getElementById('viewport');
  const panel = document.getElementById('controls');
  const renderer = new Renderer(canvas, config.gridSize, config.scale, config.renderer);
  let swarm = new MultiGridSwarm(config);
  let paused = false;

  const panelUI = new ControlPanel(panel, config, (overrides) => {
    config = withOverrides(config, overrides);
    swarm = new MultiGridSwarm(config);
  });
  // Reference panelUI to avoid unused linting; expandable for future callbacks.
  void panelUI;

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') paused = !paused;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    renderer.rotateY = nx * Math.PI * 0.8;
    renderer.rotateX = ny * Math.PI * 0.8;
  });

  function loop() {
    if (!paused) {
      const { coreMetrics, echoMetrics, historyBias } = swarm.step(config.flipProbability);
      const divergence = Math.abs(coreMetrics.energy - echoMetrics.energy);
      renderer.draw(swarm.core, swarm.echo, {
        core: coreMetrics,
        echo: echoMetrics,
        divergence,
        historyBias
      });
    }
    requestAnimationFrame(loop);
  }

  loop();
}

window.addEventListener('DOMContentLoaded', init);
