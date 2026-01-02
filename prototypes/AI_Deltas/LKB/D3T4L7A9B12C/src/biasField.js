import { clamp } from './utils.js';

export class BiasField {
  constructor(size, decay = 0.96) {
    this.size = size;
    this.length = size * size * size;
    this.decayRate = decay;
    this.field = new Float32Array(this.length);
  }

  decay() {
    for (let i = 0; i < this.length; i += 1) {
      this.field[i] *= this.decayRate;
    }
  }

  injectUniform(value) {
    for (let i = 0; i < this.length; i += 1) {
      this.field[i] += value;
    }
  }

  injectAt(index, value) {
    if (index >= 0 && index < this.length) {
      this.field[index] += value;
    }
  }

  injectSphere(centerIndex, radius, value) {
    const size = this.size;
    const centerZ = Math.floor(centerIndex / (size * size));
    const remainder = centerIndex % (size * size);
    const centerY = Math.floor(remainder / size);
    const centerX = remainder % size;
    const r2 = radius * radius;
    for (let z = 0; z < size; z += 1) {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dz = z - centerZ;
          if ((dx * dx + dy * dy + dz * dz) <= r2) {
            const idx = (z * size * size) + (y * size) + x;
            this.field[idx] += value;
          }
        }
      }
    }
  }

  cloneData() {
    return new Float32Array(this.field);
  }

  blend(otherField, weight = 0.5) {
    const w = clamp(weight, 0, 1);
    for (let i = 0; i < this.length; i += 1) {
      this.field[i] = this.field[i] * (1 - w) + otherField.field[i] * w;
    }
  }
}
