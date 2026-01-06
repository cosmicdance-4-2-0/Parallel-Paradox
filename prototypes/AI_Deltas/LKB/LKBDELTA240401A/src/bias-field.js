import { clamp, idx3D } from "./utils.js";

export class BiasField {
  constructor(size, config) {
    this.size = size;
    this.config = config;
    this.field = new Float32Array(size * size * size);
  }

  clear() {
    this.field.fill(0);
  }

  inject(point, strength = this.config.bias.strength, radius = this.config.bias.radius) {
    const { x, y, z } = point;
    const s = this.size;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
          if (dist > radius) continue;
          const falloff = 1 - dist / Math.max(radius, 1);
          const idx = idx3D(x + dx, y + dy, z + dz, s);
          this.field[idx] = clamp(this.field[idx] + strength * falloff, 0, 1);
        }
      }
    }
  }

  decayAndDiffuse() {
    const { decay, diffusion } = this.config.bias;
    const next = new Float32Array(this.field.length);
    const s = this.size;
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        for (let z = 0; z < s; z++) {
          const idx = idx3D(x, y, z, s);
          let sum = this.field[idx] * (1 - decay);
          let count = 1;
          const neighbors = [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1]
          ];
          for (const [dx, dy, dz] of neighbors) {
            sum += this.field[idx3D(x + dx, y + dy, z + dz, s)] * diffusion;
            count += diffusion;
          }
          next[idx] = clamp(sum / count, 0, 1);
        }
      }
    }
    this.field = next;
  }
}
