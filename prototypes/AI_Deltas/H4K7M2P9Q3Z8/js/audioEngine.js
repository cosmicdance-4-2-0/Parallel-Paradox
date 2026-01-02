import { logWarn } from './utils.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyserL = null;
    this.analyserR = null;
    this.source = null;
    this.mode = 'synth';
    this.binCount = 128;
    this.dataL = new Float32Array(this.binCount);
    this.dataR = new Float32Array(this.binCount);
    this.synthNodes = [];
  }

  async initContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async useSynth() {
    await this.initContext();
    this.stop();
    const ctx = this.ctx;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    noise.buffer = buffer;
    noise.loop = true;

    oscA.type = 'sine';
    oscB.type = 'triangle';
    oscA.frequency.value = 196;
    oscB.frequency.value = 342;
    noise.playbackRate.value = 0.9;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 32;
    lfo.connect(lfoGain).connect(oscA.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    oscA.connect(gain);
    oscB.connect(gain);
    noise.connect(gain);

    const merger = ctx.createChannelMerger(2);
    gain.connect(merger, 0, 0);
    gain.connect(merger, 0, 1);

    this.setupAnalyzers(merger);
    oscA.start();
    oscB.start();
    noise.start();

    this.synthNodes = [oscA, oscB, noise, lfo, lfoGain, gain, merger];
    this.source = merger;
    this.mode = 'synth';
  }

  async useMic() {
    await this.initContext();
    this.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const input = this.ctx.createMediaStreamSource(stream);
      this.setupAnalyzers(input);
      this.source = input;
      this.mode = 'mic';
    } catch (err) {
      logWarn('Microphone access failed; falling back to synth.', err);
      await this.useSynth();
    }
  }

  async useFile(file) {
    await this.initContext();
    this.stop();
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.loop = true;
    const source = this.ctx.createMediaElementSource(audio);
    this.setupAnalyzers(source);
    audio.play();
    this.source = source;
    this.mode = 'file';
  }

  setupAnalyzers(node) {
    const ctx = this.ctx;
    this.analyserL = ctx.createAnalyser();
    this.analyserR = ctx.createAnalyser();
    this.analyserL.fftSize = 256;
    this.analyserR.fftSize = 256;
    this.binCount = this.analyserL.frequencyBinCount;
    this.dataL = new Float32Array(this.binCount);
    this.dataR = new Float32Array(this.binCount);

    const splitter = ctx.createChannelSplitter(2);
    node.connect(splitter);
    splitter.connect(this.analyserL, 0);
    splitter.connect(this.analyserR, 1);

    const gain = ctx.createGain();
    gain.gain.value = 0.8;
    this.analyserL.connect(gain);
    this.analyserR.connect(gain);
    gain.connect(ctx.destination);
  }

  sample() {
    if (!this.analyserL) return { left: [], right: [], mix: 0 };
    this.analyserL.getFloatFrequencyData(this.dataL);
    this.analyserR.getFloatFrequencyData(this.dataR);
    const normalize = (v) => Math.max(0, (v + 90) / 90);
    let mix = 0;
    for (let i = 0; i < this.binCount; i++) {
      this.dataL[i] = normalize(this.dataL[i]);
      this.dataR[i] = normalize(this.dataR[i]);
      mix += this.dataL[i] + this.dataR[i];
    }
    return { left: this.dataL, right: this.dataR, mix: mix / (this.binCount * 2) };
  }

  stop() {
    // TODO: track mic stream and revoke object URLs when multiple sources are used at once.
    if (this.synthNodes.length) {
      this.synthNodes.forEach((n) => {
        try {
          n.stop?.();
          n.disconnect?.();
        } catch (err) {
          logWarn('Synth node stop failed', err);
        }
      });
      this.synthNodes = [];
    }
  }
}
