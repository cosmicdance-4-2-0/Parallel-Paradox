function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class BiasField {
  constructor(size, config) {
    this.size = size;
    this.count = size ** 3;
    this.decay = config.decay;
    this.radius = config.radius;
    this.strength = config.strength;
    this.bias = new Float32Array(this.count);
    this.schedule = config.pulses || [];
  }

  clear() {
    this.bias.fill(0);
  }

  stepDecay() {
    for (let i = 0; i < this.count; i++) {
      this.bias[i] *= this.decay;
    }
  }

  applyPulse(pulse) {
    const { depth = 0.5, pan = 0, amplitude = 1 } = pulse;
    const r = Math.max(1, this.radius);
    const centerX = clamp(Math.floor((this.size - 1) / 2 + pan * this.size * 0.4), 0, this.size - 1);
    const centerY = Math.floor((this.size - 1) / 2);
    const centerZ = clamp(Math.floor(depth * (this.size - 1)), 0, this.size - 1);

    for (let dz = -Math.ceil(r); dz <= Math.ceil(r); dz++) {
      for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
        for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r);
          if (d2 > 1) continue;
          const kernel = Math.exp(-d2 * 2.4);
          const x = centerX + dx;
          const y = centerY + dy;
          const z = centerZ + dz;
          if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) continue;
          const idx = x + y * this.size + z * this.size * this.size;
          const delta = amplitude * this.strength * kernel;
          this.bias[idx] = clamp(this.bias[idx] + delta, -0.25, 0.25);
        }
      }
    }
  }

  tick(timeStep) {
    this.stepDecay();
    for (const pulse of this.schedule) {
      if (Math.abs(timeStep - pulse.time) < 1e-6 || timeStep === pulse.time) {
        this.applyPulse(pulse);
      }
    }
    return this.bias;
  }
}
