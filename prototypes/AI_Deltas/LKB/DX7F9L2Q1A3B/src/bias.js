import { clamp } from './math.js';

export class BiasField {
  constructor(size, opts) {
    this.size = size;
    this.n = size ** 3;
    this.decay = opts.decay;
    this.strength = opts.strength;
    this.radius = opts.radius;
    this.bias = new Float32Array(this.n);
  }

  decayField() {
    for (let i = 0; i < this.n; i += 1) {
      this.bias[i] *= this.decay;
    }
  }

  injectSpectrum(left, right) {
    this.decayField();
    const bins = Math.max(left.length, right.length);
    if (!bins) return;

    for (let b = 0; b < bins; b += 1) {
      const aL = left[b] ?? left[left.length - 1] ?? 0;
      const aR = right[b] ?? right[right.length - 1] ?? 0;
      const energy = (aL + aR) * 0.5;
      const pan = aR - aL;
      const z = Math.floor((b / Math.max(1, bins - 1)) * (this.size - 1));
      const x = clamp(Math.floor(this.size / 2 + pan * (this.size * 0.18)), 0, this.size - 1);
      const y = Math.floor(this.size / 2);
      this.addKernel(x, y, z, energy);
    }
  }

  addKernel(cx, cy, cz, energy) {
    const r = this.radius;
    const str = this.strength * energy;
    if (str === 0) return;
    for (let dz = -r; dz <= r; dz += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r || 1);
          if (d2 > 1) continue;
          const kernel = Math.exp(-d2 * 1.8);
          const idx = this.idx(cx + dx, cy + dy, cz + dz);
          if (idx >= 0) this.bias[idx] = clamp(this.bias[idx] + str * kernel, -0.3, 0.3);
        }
      }
    }
  }

  idx(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) return -1;
    return x + y * this.size + z * this.size * this.size;
  }
}
