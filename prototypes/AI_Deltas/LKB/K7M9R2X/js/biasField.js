import { clamp01, modulo } from "./utils.js";

export class BiasField {
  constructor(size, decay = 0.94, drift = 0.08) {
    this.size = size;
    this.decay = decay;
    this.drift = drift;
    this.field = new Float32Array(size * size * size);
    this._temp = new Float32Array(size * size * size);
  }

  index(x, y, z) {
    const n = this.size;
    const nx = modulo(x, n);
    const ny = modulo(y, n);
    const nz = modulo(z, n);
    return nx + ny * n + nz * n * n;
  }

  pulse({ x, y, z, radius = 2, strength = 0.25 }) {
    const n = this.size;
    const r2 = radius * radius;
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const dist2 = dx * dx + dy * dy + dz * dz;
          if (dist2 > r2) continue;
          const weight = clamp01(1 - dist2 / r2);
          const idx = this.index(x + dx, y + dy, z + dz);
          this.field[idx] += strength * weight;
        }
      }
    }
  }

  tick(time) {
    const len = this.field.length;
    const decay = this.decay;
    const drift = this.drift;
    const field = this.field;
    for (let i = 0; i < len; i++) {
      field[i] *= decay;
      // Add gentle breathing to avoid stasis when no pulses occur.
      field[i] += Math.sin(time * 0.001 + i * 0.013) * drift * 0.0005;
    }
  }

  copyTo(target) {
    target.set(this.field);
  }
}
