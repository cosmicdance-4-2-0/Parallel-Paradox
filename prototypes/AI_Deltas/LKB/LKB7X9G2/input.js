import { clamp, mix, seededRandom } from "./utils.js";

export class InputBridge {
  constructor(config) {
    this.config = config.INPUT;
    this.mode = "muted";
    this.t = 0;
    this.rand = seededRandom(42);
    this.lastStrength = 0;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setStrength(value) {
    this.config.strength = clamp(value, 0, 2);
  }

  /**
   * Generates a coarse bias vector for the InputField to ingest.
   * Modes: muted (0), orbit (procedural), jitter (stochastic microbursts).
   */
  sample(dt) {
    this.t += dt * 0.001;
    if (this.mode === "muted") {
      this.lastStrength = mix(this.lastStrength, 0, 0.25);
      return { strength: 0, center: [0, 0, 0], parityBias: 0 };
    }

    if (this.mode === "orbit") {
      const orbit = Math.sin(this.t * 0.7) * 0.5 + 0.5;
      const swing = Math.cos(this.t * 0.4) * 0.5 + 0.5;
      const strength = this.config.strength * (0.4 + orbit * 0.6);
      this.lastStrength = strength;
      return {
        strength,
        center: [orbit - 0.5, swing - 0.5, Math.sin(this.t * 0.3)],
        parityBias: Math.sin(this.t) * 0.5,
      };
    }

    // jitter
    const burst = this.rand() * this.config.strength;
    const dir = [this.rand() - 0.5, this.rand() - 0.5, this.rand() - 0.5];
    this.lastStrength = burst;
    return { strength: burst, center: dir, parityBias: (this.rand() - 0.5) * 0.6 };
  }
}

export class InputField {
  constructor(size, config) {
    this.size = size;
    this.count = size * size * size;
    this.decay = config.INPUT.decay;
    this.diffusion = config.INPUT.diffusion;
    this.grid = new Float32Array(this.count);
  }

  inject({ strength, center }) {
    if (!strength) return;
    const cx = Math.floor((center[0] * 0.5 + 0.5) * this.size) % this.size;
    const cy = Math.floor((center[1] * 0.5 + 0.5) * this.size) % this.size;
    const cz = Math.floor((center[2] * 0.5 + 0.5) * this.size) % this.size;
    const idx = ((cx + this.size) % this.size) + ((cy + this.size) % this.size) * this.size + ((cz + this.size) % this.size) * this.size * this.size;
    this.grid[idx] += strength;
  }

  step() {
    const next = new Float32Array(this.count);
    const s = this.size;
    for (let z = 0; z < s; z++) {
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const i = x + y * s + z * s * s;
          let acc = this.grid[i] * this.decay;
          // simple 6-neighbor diffusion
          const dx = (x + 1) % s + y * s + z * s * s;
          const sx = (x - 1 + s) % s + y * s + z * s * s;
          const dy = x + ((y + 1) % s) * s + z * s * s;
          const sy = x + ((y - 1 + s) % s) * s + z * s * s;
          const dz = x + y * s + ((z + 1) % s) * s * s;
          const sz = x + y * s + ((z - 1 + s) % s) * s * s;
          acc += this.grid[dx] * this.diffusion;
          acc += this.grid[sx] * this.diffusion;
          acc += this.grid[dy] * this.diffusion;
          acc += this.grid[sy] * this.diffusion;
          acc += this.grid[dz] * this.diffusion;
          acc += this.grid[sz] * this.diffusion;
          next[i] = acc;
        }
      }
    }
    this.grid = next;
  }

  sample(x, y, z) {
    const s = this.size;
    const idx = ((x + s) % s) + ((y + s) % s) * s + ((z + s) % s) * s * s;
    return this.grid[idx];
  }
}
