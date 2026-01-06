// BiasField stores influence-only nudges; DelayLine replays recent bias softly.

export class BiasField {
  constructor(size, decay) {
    this.size = size;
    this.n = size ** 3;
    this.decay = decay;
    this.field = new Float32Array(this.n);
  }

  decayField() {
    for (let i = 0; i < this.n; i++) {
      this.field[i] *= this.decay;
    }
  }

  injectKernel({ x, y, z, radius, strength }) {
    const r = radius;
    for (let dz = -r; dz <= r; dz++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r || 1);
          if (d2 > 1) continue;
          const k = Math.exp(-d2 * 2.2); // soft bump
          const idx = this.index(x + dx, y + dy, z + dz);
          if (idx >= 0 && idx < this.n) this.field[idx] += strength * k;
        }
      }
    }
  }

  index(x, y, z) {
    const s = this.size;
    return (x + s) % s + ((y + s) % s) * s + ((z + s) % s) * s * s;
  }
}

export class DelayLine {
  constructor(size, frames, strength, decay) {
    this.size = size;
    this.frames = frames;
    this.strength = strength;
    this.decay = decay;
    this.buffer = Array.from({ length: frames }, () => new Float32Array(size ** 3));
    this.ptr = 0;
  }

  push(field) {
    this.buffer[this.ptr].set(field);
    this.ptr = (this.ptr + 1) % this.frames;
  }

  mix(outField) {
    outField.fill(0);
    const weight = this.strength / this.frames;
    for (let i = 0; i < this.frames; i++) {
      const buf = this.buffer[i];
      for (let j = 0; j < buf.length; j++) {
        outField[j] += buf[j] * weight;
      }
    }
    // decay after mixing to avoid runaway memory
    for (let i = 0; i < this.buffer.length; i++) {
      const buf = this.buffer[i];
      for (let j = 0; j < buf.length; j++) buf[j] *= this.decay;
    }
  }
}
