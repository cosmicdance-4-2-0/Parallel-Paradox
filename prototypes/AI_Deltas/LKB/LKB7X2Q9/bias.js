import { hashNoise, lerp } from "./utils.js";

export class BiasField {
  constructor(size, config) {
    this.size = size;
    this.count = size * size * size;
    this.cfg = config;
    this.pointer = { x: 0, y: 0 };
    this.values = new Float32Array(this.count);
    this._time = 0;
  }

  updatePointer(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  sample(dt) {
    this._time += dt * this.cfg.pulseSpeed;
    const { pointerTilt, driftSpeed } = this.cfg;
    const driftPhase = this._time * driftSpeed;

    for (let i = 0; i < this.count; i += 1) {
      const z = Math.floor(i / (this.size * this.size));
      const y = Math.floor((i - z * this.size * this.size) / this.size);
      const x = i - y * this.size - z * this.size * this.size;

      const pulse = Math.sin((x + y + z) * 0.25 + this._time);
      const drift = hashNoise(x + driftPhase, y - driftPhase, z + driftPhase) * 0.4;
      const tilt = ((x / this.size - 0.5) * this.pointer.x + (y / this.size - 0.5) * this.pointer.y) * pointerTilt;

      this.values[i] = lerp(drift, pulse, 0.5) + tilt;
    }

    return this.values;
  }
}
