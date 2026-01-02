// Input driver (DeltaID: Q4X9Z2)
// Handles microphone requests with a safe fallback to procedural oscillators.

export class InputDriver {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.buffer = new Uint8Array(256);
    this.mode = 'procedural';
    this.phase = 0;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._ensureProcedural();
  }

  async enableMic() {
    if (!this.ctx) await this.init();
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.ctx.createMediaStreamSource(stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);
      this.mode = 'mic';
      return true;
    } catch (err) {
      console.warn('Mic request failed, staying procedural', err);
      return false;
    }
  }

  _ensureProcedural() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.gain.value = 0.0005; // Near-silent; human-audible output is not desired.
    osc.type = 'sine';
    osc.frequency.value = 111;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    gain.connect(this.analyser);
  }

  sample(deltaTime = 0.016) {
    if (!this.ctx || !this.analyser) {
      // Simple fallback when AudioContext is unavailable.
      this.phase += deltaTime * 0.5;
      const strength = 0.1 + 0.05 * Math.sin(this.phase);
      return { strength, focus: { x: 0.5 + 0.2 * Math.sin(this.phase), y: 0.4, z: 0.5 } };
    }

    this.analyser.getByteFrequencyData(this.buffer);
    let energy = 0;
    let centroid = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      const v = this.buffer[i] / 255;
      energy += v;
      centroid += v * i;
    }
    energy /= this.buffer.length;
    centroid = centroid / Math.max(1e-5, energy * this.buffer.length);
    const normCentroid = Math.min(1, centroid / this.buffer.length);

    // Map spectral centroid to X, energy to Y, and time to Z.
    this.phase += deltaTime;
    const focus = {
      x: normCentroid,
      y: Math.min(1, energy * 2),
      z: (Math.sin(this.phase * 0.5) + 1) * 0.5
    };
    const strength = energy * 0.6 + 0.05; // Keep influence gentle.
    return { strength, focus };
  }
}
