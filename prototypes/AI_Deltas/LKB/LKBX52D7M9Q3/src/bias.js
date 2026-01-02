import { idxFromCoord } from "./config.js";

export class BiasField {
  constructor(size, decay, radius) {
    this.size = size;
    this.decay = decay;
    this.radius = radius;
    this.field = new Float32Array(size * size * size);
  }

  decayField() {
    const factor = Math.max(0, 1 - this.decay);
    for (let i = 0; i < this.field.length; i += 1) {
      this.field[i] *= factor;
    }
  }

  valueAtIndex(i) {
    return this.field[i];
  }

  average() {
    let total = 0;
    for (let i = 0; i < this.field.length; i += 1) {
      total += this.field[i];
    }
    return total / this.field.length;
  }

  applyPulse({ x, y, z, amplitude }) {
    const s = this.size;
    const maxDist = Math.max(1, this.radius);

    for (let ix = 0; ix < s; ix += 1) {
      for (let iy = 0; iy < s; iy += 1) {
        for (let iz = 0; iz < s; iz += 1) {
          const dx = this.wrapDistance(ix, x, s);
          const dy = this.wrapDistance(iy, y, s);
          const dz = this.wrapDistance(iz, z, s);
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist <= maxDist) {
            const falloff = 1 - dist / maxDist;
            const idx = idxFromCoord(ix, iy, iz, s);
            this.field[idx] += amplitude * falloff;
          }
        }
      }
    }
  }

  wrapDistance(a, b, size) {
    const direct = Math.abs(a - b);
    const wrap = size - direct;
    return Math.min(direct, wrap);
  }
}
