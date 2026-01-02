import { idx3d, clamp01, wrapIndex } from "./utils.js";

export class BiasField {
  constructor(size, decay) {
    this.size = size;
    this.decay = decay;
    this.field = new Float32Array(size.x * size.y * size.z);
  }

  update() {
    const decayFactor = 1 - this.decay;
    for (let i = 0; i < this.field.length; i += 1) {
      this.field[i] *= decayFactor;
    }
  }

  get(x, y, z) {
    const idx = idx3d(wrapIndex(x, this.size.x), wrapIndex(y, this.size.y), wrapIndex(z, this.size.z), this.size);
    return this.field[idx];
  }

  injectSphere(center, radius, strength) {
    const r2 = radius * radius;
    for (let dz = -radius; dz <= radius; dz += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const dist2 = dx * dx + dy * dy + dz * dz;
          if (dist2 > r2) continue;
          const x = wrapIndex(center.x + dx, this.size.x);
          const y = wrapIndex(center.y + dy, this.size.y);
          const z = wrapIndex(center.z + dz, this.size.z);
          const idx = idx3d(x, y, z, this.size);
          const falloff = 1 - dist2 / r2;
          const delta = clamp01(strength * falloff);
          this.field[idx] = clamp01(this.field[idx] + delta);
        }
      }
    }
  }
}

// TODO: allow non-spherical injection shapes (planes, diagonals) for routing multi-sense input (e.g., audio vs. touch).
