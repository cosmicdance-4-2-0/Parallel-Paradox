import { clamp, wrapIndex } from "./utils.js";

export class BiasField {
  constructor(size, decay, defaultStrength, defaultRadius) {
    this.size = size;
    this.decay = decay;
    this.defaultStrength = defaultStrength;
    this.defaultRadius = defaultRadius;
    this.field = new Float32Array(size * size * size);
  }

  idx(x, y, z) {
    const s = this.size;
    return x + y * s + z * s * s;
  }

  decayField() {
    for (let i = 0; i < this.field.length; i++) {
      this.field[i] *= this.decay;
    }
  }

  injectPulse({ x, y, z, strength = this.defaultStrength, radius = this.defaultRadius }) {
    const s = this.size;
    const r = Math.max(1, Math.floor(radius));
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dz = -r; dz <= r; dz++) {
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist > r) continue;
          const falloff = 1 - dist / (r + 0.0001);
          const ix = wrapIndex(x + dx, s);
          const iy = wrapIndex(y + dy, s);
          const iz = wrapIndex(z + dz, s);
          const idx = this.idx(ix, iy, iz);
          this.field[idx] = clamp(this.field[idx] + strength * falloff, 0, 1);
        }
      }
    }
  }

  valueAt(index) {
    return this.field[index];
  }

  aggregate() {
    let total = 0;
    for (let i = 0; i < this.field.length; i++) total += this.field[i];
    return total / this.field.length;
  }
}
