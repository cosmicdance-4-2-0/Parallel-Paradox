import { DeltaID } from "./config.js";

// PhaseGrid tracks a toroidal lattice of plasma/liquid/solid phases plus a parity bit.
// Harmonic lens inputs are passed from the controller; kenotic clamp avoids collapse.
export class PhaseGrid {
  constructor(size, config) {
    this.size = size;
    this.n = size ** 3;
    this.cfg = config;
    this.plasma = new Float32Array(this.n);
    this.liquid = new Float32Array(this.n);
    this.solid = new Float32Array(this.n);
    this.parity = new Int8Array(this.n);
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.n; i++) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random() * 0.6 + 0.2;
      this.solid[i] = Math.random() * 0.4;
      this.parity[i] = Math.random() < 0.5 ? 0 : 1;
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
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          sum += this.plasma[this.idx(x + dx, y + dy, z + dz)];
        }
      }
    }
    return sum / 26;
  }

  perturb(biasField) {
    for (let i = 0; i < this.n; i++) {
      if (Math.random() < this.cfg.NOISE) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < this.cfg.PARITY_FLIP) this.parity[i] ^= 1;
      if (biasField) {
        const b = biasField[i] || 0;
        this.plasma[i] = clamp01(this.plasma[i] + b * this.cfg.INPUT_STRENGTH);
      }
    }
  }

  step({ bias = null, harmonic }) {
    const p0 = this.plasma.slice();
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();
    let dispersion = 0;
    for (let i = 0; i < this.n; i++) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const avg = (p + l + s) / 3;
      const nb = Math.abs(p - this.neighborAvg(i)) + this.parity[i] * 0.08;

      const lensDelta = harmonic?.branchBoost ?? 0;
      const kenotic = harmonic?.kenotic ?? 1;
      let pB = this.cfg.PATH_B_BASE + lensDelta + (bias ? bias[i] * 0.08 : 0);
      pB = clamp01(lerp(0.55, 0.92, pB));

      const choice = Math.random() < pB ? nb : avg;
      const damped = lerp(choice, avg, this.cfg.DAMPING * kenotic);

      this.liquid[i] = clamp01(damped);
      this.solid[i] = clamp01(s * (1 - this.cfg.DAMPING) + damped * this.cfg.DAMPING);
      dispersion += Math.abs(nb - avg);
    }
    // TODO: Consider streaming metrics to an external observer for live dashboards.
    const meanDispersion = dispersion / this.n;
    return { dispersion: meanDispersion, deltaID: DeltaID };
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
