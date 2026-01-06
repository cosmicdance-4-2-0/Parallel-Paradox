import { cloneField, indexFromCoord } from "./utils.js";
import { clamp } from "./utils.js";

export class BiasField {
  constructor(dims, decay = 0.95, maxStrength = 0.5) {
    this.dims = dims;
    this.decay = decay;
    this.maxStrength = maxStrength;
    this.field = new Float32Array(dims.x * dims.y * dims.z);
  }

  applyDecay() {
    for (let i = 0; i < this.field.length; i += 1) {
      this.field[i] *= this.decay;
    }
  }

  injectSphere(center, radius, strength) {
    const clampedStrength = clamp(strength, -this.maxStrength, this.maxStrength);
    for (let z = -radius; z <= radius; z += 1) {
      for (let y = -radius; y <= radius; y += 1) {
        for (let x = -radius; x <= radius; x += 1) {
          const dist2 = x * x + y * y + z * z;
          if (dist2 <= radius * radius) {
            const idx = indexFromCoord(center.x + x, center.y + y, center.z + z, this.dims);
            const falloff = 1 - dist2 / (radius * radius + 1e-6);
            this.field[idx] = clamp(
              this.field[idx] + clampedStrength * falloff,
              -this.maxStrength,
              this.maxStrength
            );
          }
        }
      }
    }
  }

  normalized() {
    return cloneField(this.field);
  }
}
