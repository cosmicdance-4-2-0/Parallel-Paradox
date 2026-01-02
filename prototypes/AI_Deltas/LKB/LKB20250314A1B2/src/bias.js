import { config } from "./config.js";
import { clamp } from "./lens.js";

export class BiasField {
  constructor(size, { decay = config.biasDecay, strength = config.biasStrength, radius = config.biasRadius } = {}) {
    this.size = size;
    this.n = size ** 3;
    this.decay = decay;
    this.strength = strength;
    this.radius = radius;
    this.bias = new Float32Array(this.n);
    this.offset = 0;
  }

  tick() {
    for (let i = 0; i < this.n; i++) {
      this.bias[i] *= this.decay;
    }
  }

  injectRadial(center, intensity) {
    const { x, y, z } = center;
    const r = this.radius;
    for (let dz = -r; dz <= r; dz++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r || 1);
          if (d2 > 1) continue;
          const kernel = Math.exp(-d2 * 2.4);
          const idx = this.idx(x + dx, y + dy, z + dz);
          if (idx >= 0) {
            this.bias[idx] = clamp(this.bias[idx] + intensity * this.strength * kernel, -0.3, 0.3);
          }
        }
      }
    }
  }

  idx(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) return -1;
    return x + y * this.size + z * this.size * this.size;
  }

  getBias() {
    return this.bias;
  }

  biasAmplitude() {
    let sum = 0;
    for (let i = 0; i < this.n; i++) sum += Math.abs(this.bias[i]);
    return sum / this.n;
  }
}
