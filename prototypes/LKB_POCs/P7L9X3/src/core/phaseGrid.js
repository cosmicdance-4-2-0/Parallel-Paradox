// PhaseGrid implements the ternary-phase lattice with harmonic forgiveness damping.
export class PhaseGrid {
  constructor(config) {
    this.config = config;
    this.size = config.GRID;
    this.n = this.size ** 3;
    this.plasma = new Float32Array(this.n);
    this.liquid = new Float32Array(this.n);
    this.solid = new Float32Array(this.n);
    this.parity = new Int8Array(this.n);
    this.positions = new Float32Array(this.n * 3);
    this.seed();
    this.precomputePositions();
  }

  seed() {
    for (let i = 0; i < this.n; i++) {
      this.plasma[i] = Math.random() * 0.8 + 0.1;
      this.liquid[i] = Math.random() * 0.6 + 0.2;
      this.solid[i] = Math.random() * 0.3;
      this.parity[i] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  precomputePositions() {
    const half = (this.size - 1) / 2;
    let ptr = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          this.positions[ptr++] = (x - half) * this.config.SCALE;
          this.positions[ptr++] = (y - half) * this.config.SCALE;
          this.positions[ptr++] = (z - half) * this.config.SCALE;
        }
      }
    }
  }

  idx(x, y, z) {
    const s = this.size;
    return ((x + s) % s) + ((y + s) % s) * s + ((z + s) % s) * s * s;
  }

  neighborAvg(i, plasma) {
    const s = this.size;
    const x = i % s;
    const y = Math.floor(i / s) % s;
    const z = Math.floor(i / (s * s));
    let sum = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          sum += plasma[this.idx(x + dx, y + dy, z + dz)];
        }
      }
    }
    return sum / 26;
  }

  perturb(bias) {
    const { FLIP_P, PARITY_P, DREAM_JITTER } = this.config;
    for (let i = 0; i < this.n; i++) {
      if (Math.random() < FLIP_P) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < PARITY_P) this.parity[i] ^= 1;
      const jitter = DREAM_JITTER * (Math.random() * 0.5 + 0.5);
      this.liquid[i] += this.parity[i] ? jitter : -jitter;
      this.liquid[i] = clamp01(this.liquid[i]);
      if (bias) {
        const b = bias[i];
        // Audio injects micro adjustments without overriding.
        this.plasma[i] = clamp01(this.plasma[i] + b * 0.01);
        const audioJitter = Math.abs(b) > 0.03 ? jitter * (1 + Math.abs(b) * 3) : 0;
        this.liquid[i] = clamp01(this.liquid[i] + (this.parity[i] ? audioJitter : -audioJitter));
      }
    }
  }

  forgivenessOperator(diff) {
    // Damp divergence when dispersion spikes; future variants could be lens-aware.
    // TODO: Route lens weights here for reason: harmonize Path B emphasis per lens preset.
    const { FORGIVENESS } = this.config;
    return diff * (1 - FORGIVENESS * Math.min(1, diff));
  }

  step(bias) {
    const { BASE_PATH_B_P, ALPHA } = this.config;
    const p0 = this.plasma.slice();
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();
    for (let i = 0; i < this.n; i++) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const avg = (p + l + s) / 3;
      const neighborDelta = Math.abs(p - this.neighborAvg(i, p0)) + this.parity[i] * 0.08;
      let probB = BASE_PATH_B_P + (bias ? bias[i] * 0.08 : 0);
      probB = clamp(probB, 0.55, 0.92);
      const chosen = Math.random() < probB ? neighborDelta : avg;
      const damped = this.forgivenessOperator(chosen);
      this.liquid[i] = clamp01(damped);
      this.solid[i] = s * (1 - ALPHA) + damped * ALPHA;
    }
  }
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
