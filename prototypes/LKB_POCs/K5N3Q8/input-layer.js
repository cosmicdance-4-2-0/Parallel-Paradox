import { CONFIG } from './config.js';
import { clamp, hashNoise, index3D, lerp } from './utils.js';

// Bias fields influence the grid without seizing control. Audio is optional;
// a procedural field keeps the lattice responsive if permissions fail.
export class InputLayer {
  constructor(size) {
    this.size = size;
    this.count = size * size * size;
    this.biasField = new Float32Array(this.count);
    this.audio = null;
    this.phase = 0;
  }

  async enableMicrophone() {
    if (!navigator?.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      const data = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      this.audio = { ctx, analyser, data };
      return true;
    } catch (err) {
      console.warn('Microphone unavailable, falling back to procedural bias.', err);
      return false;
    }
  }

  update(time) {
    if (this.audio) {
      this._ingestAudio();
    } else {
      this._procedural(time);
    }
    this._diffuseAndDecay();
    return this.biasField;
  }

  _ingestAudio() {
    const { analyser, data } = this.audio;
    analyser.getByteFrequencyData(data);

    // Aggregate low/mid/high bands to avoid biasing a single axis.
    const third = Math.floor(data.length / 3);
    const low = this._bandEnergy(data, 0, third);
    const mid = this._bandEnergy(data, third, third * 2);
    const high = this._bandEnergy(data, third * 2, data.length);

    // Map to axes: low → Z, mid → Y, high → X.
    const s = this.size;
    for (let z = 0; z < s; z += 1) {
      const zWeight = low * (z / s);
      for (let y = 0; y < s; y += 1) {
        const yWeight = mid * (y / s);
        for (let x = 0; x < s; x += 1) {
          const xWeight = high * (x / s);
          const idx = index3D(x, y, z, s);
          const bias = (xWeight + yWeight + zWeight) * CONFIG.bias.microphoneSmoothing;
          this.biasField[idx] = clamp(this.biasField[idx] + bias, 0, 1.5);
        }
      }
    }
  }

  _procedural(time) {
    // Smoothly rotating bias hotspot that never becomes dominant.
    const { proceduralSpeed } = CONFIG.bias;
    this.phase += proceduralSpeed;
    const s = this.size;
    const half = (s - 1) * 0.5;
    const r = half * 0.6;
    const cx = half + Math.sin(this.phase * 0.01) * r;
    const cy = half + Math.cos(this.phase * 0.012) * r;
    const cz = half + Math.sin(this.phase * 0.014 + 1.3) * r;

    for (let z = 0; z < s; z += 1) {
      for (let y = 0; y < s; y += 1) {
        for (let x = 0; x < s; x += 1) {
          const dx = x - cx;
          const dy = y - cy;
          const dz = z - cz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-3;
          const falloff = Math.max(0, 1 - dist / (r * 1.5));
          const noise = hashNoise(time * 0.0007 + dist * 0.17);
          const idx = index3D(x, y, z, s);
          const value = falloff * 0.8 + noise * 0.2;
          this.biasField[idx] = clamp(this.biasField[idx] + value * 0.02, 0, 1.5);
        }
      }
    }
  }

  _diffuseAndDecay() {
    // Simple diffusion + decay to keep bias fields from sticking around forever.
    const { diffusion, decay } = CONFIG.bias;
    const s = this.size;
    const scratch = new Float32Array(this.count);

    for (let z = 0; z < s; z += 1) {
      for (let y = 0; y < s; y += 1) {
        for (let x = 0; x < s; x += 1) {
          const idx = index3D(x, y, z, s);
          const value = this.biasField[idx];
          const nb =
            this.biasField[index3D((x + 1) % s, y, z, s)] +
            this.biasField[index3D((x - 1 + s) % s, y, z, s)] +
            this.biasField[index3D(x, (y + 1) % s, z, s)] +
            this.biasField[index3D(x, (y - 1 + s) % s, z, s)] +
            this.biasField[index3D(x, y, (z + 1) % s, s)] +
            this.biasField[index3D(x, y, (z - 1 + s) % s, s)];
          const diffused = lerp(value, nb / 6, diffusion);
          scratch[idx] = clamp(diffused * (1 - decay), 0, 1.5);
        }
      }
    }

    this.biasField.set(scratch);
  }

  _bandEnergy(data, start, end) {
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += data[i];
    }
    return sum / ((end - start) * 255 || 1);
  }
}

// TODO: Allow swapping in alternative bias drivers (text embeddings, sensor feeds)
// while keeping the influence-only contract intact.
