import { clamp, idx, wrapIndex } from "./utils.js";

export class BiasField {
  constructor(size, { decay, diffusion }) {
    this.size = size;
    this.decay = decay;
    this.diffusion = diffusion;
    this.field = new Float32Array(size * size * size);
  }

  injectPulse({ x, y, z, strength, radius }) {
    const clampedStrength = clamp(strength, -2, 2);
    const r = Math.max(0, radius);
    for (let dz = -r; dz <= r; dz += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          const px = wrapIndex(x + dx, this.size);
          const py = wrapIndex(y + dy, this.size);
          const pz = wrapIndex(z + dz, this.size);
          const distance = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
          const falloff = 1 - distance / (r + 1 || 1);
          const pos = idx(px, py, pz, this.size);
          this.field[pos] += clampedStrength * falloff;
        }
      }
    }
  }

  tick() {
    const next = new Float32Array(this.field.length);
    const { size, diffusion, decay } = this;
    for (let z = 0; z < size; z += 1) {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const pos = idx(x, y, z, size);
          let sum = 0;
          let neighbors = 0;
          const offsets = [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
          ];
          for (const [dx, dy, dz] of offsets) {
            const nx = wrapIndex(x + dx, size);
            const ny = wrapIndex(y + dy, size);
            const nz = wrapIndex(z + dz, size);
            const npos = idx(nx, ny, nz, size);
            sum += this.field[npos];
            neighbors += 1;
          }
          const diffusionTerm = (sum / neighbors - this.field[pos]) * diffusion;
          next[pos] = (this.field[pos] + diffusionTerm) * decay;
        }
      }
    }
    this.field = next;
  }

  merge(source, gain = 1) {
    for (let i = 0; i < this.field.length; i += 1) {
      this.field[i] += source[i] * gain;
    }
  }

  view() {
    return this.field;
  }
}
