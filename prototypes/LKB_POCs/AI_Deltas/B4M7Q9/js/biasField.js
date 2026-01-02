export class BiasField {
  constructor(size, decay = 0.9) {
    this.size = size;
    this.decay = decay;
    this.field = new Float32Array(size * size * size);
  }

  index(x, y, z) {
    const n = this.size;
    const wrap = (v) => ((v % n) + n) % n;
    return wrap(x) * n * n + wrap(y) * n + wrap(z);
  }

  injectPulse(x, y, z, radius, strength) {
    // Simple radial falloff; bias is always influence-only and decays each frame.
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist <= radius) {
            const idx = this.index(x + dx, y + dy, z + dz);
            const falloff = 1 - dist / Math.max(radius, 1);
            this.field[idx] += strength * falloff;
          }
        }
      }
    }
  }

  decayField() {
    for (let i = 0; i < this.field.length; i++) {
      this.field[i] *= this.decay;
    }
  }

  sample(idx) {
    return this.field[idx] || 0;
  }

  resize(newSize) {
    this.size = newSize;
    this.field = new Float32Array(newSize * newSize * newSize);
  }
}
