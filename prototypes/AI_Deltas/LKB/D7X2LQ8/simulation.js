// PhaseCube Delta D7X2LQ8
// Lens-tuned harmonic memory experiment. Keep it human-readable and tunable.

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

export const DEFAULT_CONFIG = {
  gridSize: 14,
  scale: 26,
  pointSize: 4.5,
  flipProb: 0.012,
  parityProb: 0.004,
  basePathB: 0.68,
  parityKick: 0.07,
  alpha: 0.22,
  camera: { z: 420, fov: Math.PI / 4 },
  lensWeights: { human: 0.25, predictive: 0.25, systemic: 0.25, harmonic: 0.25 },
  bias: { strength: 0.08, decay: 0.95, radius: 3 },
  feedback: { memory: 32, forgiveness: 0.18, driftGain: 0.6 },
  autopulse: { period: 8, strength: 0.08, radius: 3 },
};

class BiasField {
  constructor(size, config) {
    this.size = size;
    this.n = size ** 3;
    this.bias = new Float32Array(this.n);
    this.config = { ...config };
  }

  tick(decayOverride) {
    const decay = decayOverride ?? this.config.decay;
    for (let i = 0; i < this.n; i++) this.bias[i] *= decay;
  }

  pulse(strength = this.config.strength, radius = this.config.radius, center = null) {
    // Influence, not command: add soft, decaying bias.
    const cx = center?.x ?? Math.floor(this.size / 2 + (Math.random() - 0.5) * this.size * 0.4);
    const cy = center?.y ?? Math.floor(this.size / 2);
    const cz = center?.z ?? Math.floor(this.size / 2 + (Math.random() - 0.5) * this.size * 0.4);
    const r = Math.max(1, radius);
    for (let dz = -r; dz <= r; dz++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r);
          if (d2 > 1) continue;
          const k = Math.exp(-d2 * 2.4);
          const x = cx + dx, y = cy + dy, z = cz + dz;
          if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) continue;
          const idx = x + y * this.size + z * this.size * this.size;
          this.bias[idx] = clamp(this.bias[idx] + strength * k, -0.3, 0.3);
        }
      }
    }
  }
}

class PhaseGrid {
  constructor(size, config) {
    this.size = size;
    this.config = config;
    this.n = size ** 3;
    this.plasma = new Float32Array(this.n);
    this.liquid = new Float32Array(this.n);
    this.solid = new Float32Array(this.n);
    this.parity = new Int8Array(this.n);
    this.reset();
  }

  reset() {
    for (let i = 0; i < this.n; i++) {
      this.plasma[i] = Math.random() * 0.6 + 0.2;
      this.liquid[i] = Math.random() * 0.6 + 0.2;
      this.solid[i] = Math.random() * 0.3;
      this.parity[i] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  idx(x, y, z) {
    const s = this.size;
    return ((x + s) % s) + ((y + s) % s) * s + ((z + s) % s) * s * s;
  }

  neighborAvg(i) {
    const s = this.size;
    const x = i % s;
    const y = Math.floor(i / s) % s;
    const z = Math.floor(i / (s * s));
    let sum = 0;
    sum += this.plasma[this.idx(x + 1, y, z)];
    sum += this.plasma[this.idx(x - 1, y, z)];
    sum += this.plasma[this.idx(x, y + 1, z)];
    sum += this.plasma[this.idx(x, y - 1, z)];
    sum += this.plasma[this.idx(x, y, z + 1)];
    sum += this.plasma[this.idx(x, y, z - 1)];
    return sum / 6;
  }

  perturb(noise, parityProb) {
    for (let i = 0; i < this.n; i++) {
      if (Math.random() < noise) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < parityProb) this.parity[i] ^= 1;
      // Soft dream jitter keeps things alive even without bias.
      const jitter = (Math.random() - 0.5) * 0.004;
      this.liquid[i] = clamp(this.liquid[i] + jitter, 0, 1);
    }
  }

  step(biasField, lensWeights, feedback, config) {
    const { basePathB, parityKick, alpha } = config;
    const weights = lensWeights;
    const wSum = weights.human + weights.predictive + weights.systemic + weights.harmonic;
    const wb = wSum > 0 ? 1 / wSum : 1;

    const p0 = this.plasma;
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();

    for (let i = 0; i < this.n; i++) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const nb = this.neighborAvg(i);
      const diff = Math.abs(p - nb) + this.parity[i] * parityKick;
      const consensus = (p + l + s) / 3;
      const external = biasField ? biasField[i] : 0;

      // Lens channels: human = consensus leaning; predictive = difference seeking; systemic = neighbor-trusting; harmonic = memory + forgiveness.
      const chHuman = consensus + external * 0.35;
      const chPredictive = diff * (1 + feedback.drift * 0.5);
      const chSystemic = nb + external * 0.2;
      const chHarmonic = (s * (1 - alpha) + consensus * alpha) - feedback.forgiveness;

      const mix = (chHuman * weights.human + chPredictive * weights.predictive + chSystemic * weights.systemic + chHarmonic * weights.harmonic) * wb;
      const pathRoll = Math.random() < basePathB ? diff : consensus;
      const blended = 0.6 * mix + 0.3 * pathRoll + 0.1 * external;

      this.liquid[i] = clamp(blended, 0, 1);
      this.solid[i] = clamp(s * (1 - alpha) + mix * alpha, 0, 1);
      // Plasma drifts toward liquid for gentle coherence.
      this.plasma[i] = clamp(p * 0.96 + this.liquid[i] * 0.04, 0, 1);
    }
  }
}

export class Simulation {
  constructor(canvas, config = DEFAULT_CONFIG) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = JSON.parse(JSON.stringify(config));
    this.grid = new PhaseGrid(this.config.gridSize, this.config);
    this.biasField = new BiasField(this.config.gridSize, this.config.bias);
    this.lensWeights = { ...this.config.lensWeights };
    this.memory = new Float32Array(this.config.feedback.memory);
    this.memoryPtr = 0;
    this.metrics = { fps: 0, variance: 0, entropy: 0, bias: 0, lens: this.lensWeights };
    this.rotation = { x: -0.5, y: 0.9 };
    this.paused = false;
    this.showMesh = false;
    this.autopulse = true;
    this.autopulsePeriod = this.config.autopulse.period;
    this.lastPulse = 0;
    this.time = 0;
    this.lastFrame = performance.now();
    this.positions = this.buildPositions();

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  buildPositions() {
    const total = this.config.gridSize ** 3;
    const positions = new Float32Array(total * 3);
    const half = (this.config.gridSize - 1) / 2;
    let ptr = 0;
    for (let x = 0; x < this.config.gridSize; x++) {
      for (let y = 0; y < this.config.gridSize; y++) {
        for (let z = 0; z < this.config.gridSize; z++) {
          positions[ptr++] = (x - half) * this.config.scale;
          positions[ptr++] = (y - half) * this.config.scale;
          positions[ptr++] = (z - half) * this.config.scale;
        }
      }
    }
    return positions;
  }

  handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
  }

  setLensWeights(weights) {
    const { human, predictive, systemic, harmonic } = weights;
    const sum = human + predictive + systemic + harmonic;
    const norm = sum > 0 ? 1 / sum : 0.25;
    this.lensWeights = {
      human: human * norm,
      predictive: predictive * norm,
      systemic: systemic * norm,
      harmonic: harmonic * norm,
    };
  }

  setNoise(noise) { this.config.flipProb = noise; }
  setForgiveness(value) { this.config.feedback.forgiveness = value; }
  setAutopulsePeriod(value) { this.autopulsePeriod = value; }
  toggleAutopulse(enabled) { this.autopulse = enabled; }
  toggleMesh(enabled) { this.showMesh = enabled; }

  reset() {
    this.grid.reset();
    this.biasField = new BiasField(this.config.gridSize, this.config.bias);
    this.memory.fill(0);
    this.memoryPtr = 0;
    this.lastPulse = 0;
  }

  pulse(strength = this.config.autopulse.strength, radius = this.config.autopulse.radius) {
    this.biasField.pulse(strength, radius);
  }

  computeFeedback(avgLiquid) {
    const oldest = this.memory[this.memoryPtr];
    this.memory[this.memoryPtr] = avgLiquid;
    this.memoryPtr = (this.memoryPtr + 1) % this.memory.length;
    const drift = (avgLiquid - oldest) * this.config.feedback.driftGain;
    const forgiveness = Math.abs(avgLiquid - oldest) * this.config.feedback.forgiveness;
    return { drift, forgiveness };
  }

  computeMetrics() {
    const n = this.grid.n;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += this.grid.liquid[i];
    const avg = sum / n;
    let varSum = 0;
    for (let i = 0; i < n; i++) {
      const d = this.grid.liquid[i] - avg;
      varSum += d * d;
    }
    const variance = varSum / n;

    // Simple histogram entropy for interpretability (not rigorous).
    const buckets = 16;
    const hist = new Array(buckets).fill(0);
    for (let i = 0; i < n; i++) hist[Math.min(buckets - 1, Math.floor(this.grid.liquid[i] * buckets))]++;
    let entropy = 0;
    for (const h of hist) {
      if (h === 0) continue;
      const p = h / n;
      entropy -= p * Math.log2(p);
    }

    let biasMag = 0;
    for (let i = 0; i < n; i++) biasMag += Math.abs(this.biasField.bias[i]);
    biasMag /= n;

    return { variance, entropy, bias: biasMag, avg };
  }

  draw() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const camZ = this.config.camera.z;
    const fov = this.config.camera.fov;
    const f = 1 / Math.tan(fov / 2);
    const aspect = width / height;
    const cx = Math.cos(this.rotation.x), sx = Math.sin(this.rotation.x);
    const cy = Math.cos(this.rotation.y), sy = Math.sin(this.rotation.y);

    const points = [];
    for (let i = 0, p = 0; i < this.positions.length / 3; i++, p += 3) {
      let x = this.positions[p], y = this.positions[p + 1], z = this.positions[p + 2];
      const rx = cy * x + sy * z;
      const rz = -sy * x + cy * z;
      const ry = cx * y - sx * rz;
      const rz2 = sx * y + cx * rz;
      const cz = camZ - rz2;
      if (cz < 1) continue;
      const ndcX = (f / aspect) * (rx / cz);
      const ndcY = f * (ry / cz);
      points.push({
        i,
        z: cz,
        x: (ndcX * 0.5 + 0.5) * width,
        y: (ndcY * 0.5 + 0.5) * height,
      });
    }

    points.sort((a, b) => b.z - a.z);
    const hueBase = this.time * 0.07;
    for (const pt of points) {
      const l = this.grid.liquid[pt.i];
      if (l < 0.01) continue;
      const p = this.grid.plasma[pt.i];
      const par = this.grid.parity[pt.i];
      const h = (hueBase + p + par * 0.12) % 1;
      const t = h * Math.PI * 2;
      const r = Math.abs(Math.sin(t)) * 255;
      const g = Math.abs(Math.sin(t + 2)) * 255;
      const b = Math.abs(Math.sin(t + 4)) * 255;
      const alpha = 0.3 + 0.7 * l;
      const size = this.config.pointSize + 7 * l;
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.showMesh) this.drawMesh();
  }

  drawMesh() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.strokeStyle = 'rgba(120,150,200,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    // TODO: Add perspective cube mesh for depth cues, for better interpretability.
  }

  update() {
    const now = performance.now();
    const dt = (now - this.lastFrame) / 1000;
    this.lastFrame = now;
    if (!this.paused) {
      this.time += dt;
      this.rotation.y += dt * 0.25;
      this.biasField.tick();

      if (this.autopulse && (now - this.lastPulse) / 1000 > this.autopulsePeriod) {
        this.pulse();
        this.lastPulse = now;
      }

      this.grid.perturb(this.config.flipProb, this.config.parityProb);
      const preMetrics = this.computeMetrics();
      const feedback = this.computeFeedback(preMetrics.avg);
      this.grid.step(this.biasField.bias, this.lensWeights, feedback, this.config);
      const postMetrics = this.computeMetrics();
      this.metrics = { ...postMetrics, fps: this.metrics.fps * 0.9 + (dt > 0 ? 0.1 * (1 / dt) : 0), lens: { ...this.lensWeights } };
    }

    this.draw();
    requestAnimationFrame(() => this.update());
  }
}
