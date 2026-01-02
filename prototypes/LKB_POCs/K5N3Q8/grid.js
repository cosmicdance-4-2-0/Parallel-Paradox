import { CONFIG } from './config.js';
import { clamp, index3D, rollingAverage } from './utils.js';

// PhaseGrid models a plasma/liquid/solid lattice with harmonic forgiveness
// and trace memory. Bias fields influence but never overwrite the state.
export class PhaseGrid {
  constructor(size = CONFIG.grid) {
    this.size = size;
    this.count = size * size * size;

    // Phases
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.trace = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);

    // Coordinates are cached for rendering convenience.
    this.positions = new Float32Array(this.count * 3);
    this._seed();
  }

  _seed() {
    const half = (this.size - 1) * 0.5;
    let idx = 0;
    for (let z = 0; z < this.size; z += 1) {
      for (let y = 0; y < this.size; y += 1) {
        for (let x = 0; x < this.size; x += 1, idx += 1) {
          this.plasma[idx] = Math.random() * 0.5;
          this.liquid[idx] = Math.random() * 0.5;
          this.solid[idx] = Math.random() * 0.5;
          this.trace[idx] = 0;
          this.parity[idx] = Math.random() > 0.5 ? 1 : 0;

          // Position centered around origin for projection.
          this.positions[idx * 3 + 0] = (x - half) * 18;
          this.positions[idx * 3 + 1] = (y - half) * 18;
          this.positions[idx * 3 + 2] = (z - half) * 18;
        }
      }
    }
  }

  perturbNoise() {
    const { flipProbability, parityProbability, jitter } = CONFIG.noise;
    for (let i = 0; i < this.count; i += 1) {
      if (Math.random() < flipProbability) {
        this.plasma[i] = Math.random();
      }
      if (Math.random() < parityProbability) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
      // Tiny jitter avoids numerical lockstep when variance is low.
      this.plasma[i] = clamp(this.plasma[i] + (Math.random() - 0.5) * jitter, 0, 1);
    }
  }

  neighborAverage(target, x, y, z) {
    // Toroidal wrapping keeps the lattice closed and avoids edges collapsing.
    const s = this.size;
    const xm = x === 0 ? s - 1 : x - 1;
    const xp = x === s - 1 ? 0 : x + 1;
    const ym = y === 0 ? s - 1 : y - 1;
    const yp = y === s - 1 ? 0 : y + 1;
    const zm = z === 0 ? s - 1 : z - 1;
    const zp = z === s - 1 ? 0 : z + 1;

    const sum =
      target[index3D(xm, y, z, s)] +
      target[index3D(xp, y, z, s)] +
      target[index3D(x, ym, z, s)] +
      target[index3D(x, yp, z, s)] +
      target[index3D(x, y, zm, s)] +
      target[index3D(x, y, zp, s)];
    return sum / 6;
  }

  step({ biasField, biasWeight, forgivenessStrength, forgivenessThreshold, traceDepth }) {
    const s = this.size;
    const jitter = CONFIG.noise.jitter;
    for (let z = 0; z < s; z += 1) {
      for (let y = 0; y < s; y += 1) {
        for (let x = 0; x < s; x += 1) {
          const idx = index3D(x, y, z, s);
          const p = this.plasma[idx];
          const l = this.liquid[idx];
          const solid = this.solid[idx];
          const nb = this.neighborAverage(this.plasma, x, y, z);

          const parityPush = this.parity[idx] ? 0.08 : -0.05;
          const pathA = (p + l + solid) / 3;
          const diff = Math.abs(p - nb) + parityPush;
          const bias = biasField ? biasField[idx] * biasWeight : 0;

          const exploratory = pathA + diff * 0.5 + bias;
          const variance = Math.abs(diff - pathA);
          const forgiveness = variance > forgivenessThreshold ? clamp((variance - forgivenessThreshold) * forgivenessStrength, 0, 0.85) : 0;

          // Harmonic damping leans back toward pathA when variance spikes.
          const harmonicBlend = pathA * forgiveness + exploratory * (1 - forgiveness);

          const noise = (Math.random() - 0.5) * jitter * 2;
          this.liquid[idx] = harmonicBlend + noise;
          this.solid[idx] = rollingAverage(solid, harmonicBlend, 0.12 + traceDepth * 0.35);
          this.trace[idx] = rollingAverage(this.trace[idx], harmonicBlend, traceDepth);
          this.plasma[idx] = clamp(p + bias * 0.25 + noise, 0, 1);
        }
      }
    }
  }
}

// TODO: Add optional GPU/WebGL-backed stepping for larger grids without sacrificing the CPU path.
// TODO: Add cross-grid coupling hooks so multiple PhaseGrid instances can exchange bias/trace slices.
