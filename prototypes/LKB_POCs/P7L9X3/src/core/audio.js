// Audio driver exposes consistent left/right spectral arrays plus synthetic fallbacks.
export function createAudioDriver(config) {
  const state = { ctx: null, analyserL: null, analyserR: null, source: null, mode: 'idle' };

  async function ensureCtx() {
    if (!state.ctx) {
      state.ctx = new (window.AudioContext || window.webkitAudioContext)();
      state.analyserL = state.ctx.createAnalyser();
      state.analyserR = state.ctx.createAnalyser();
      state.analyserL.fftSize = state.analyserR.fftSize = config.FFT_SIZE;
      state.analyserL.smoothingTimeConstant = state.analyserR.smoothingTimeConstant = 0.85;
    }
    if (state.ctx.state === 'suspended') await state.ctx.resume();
  }

  function connect(node) {
    const splitter = state.ctx.createChannelSplitter(2);
    node.connect(splitter);
    splitter.connect(state.analyserL, 0);
    splitter.connect(state.analyserR, 1);
    node.connect(state.ctx.destination);
    state.source = node;
  }

  async function useLive() {
    await ensureCtx();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 2 } });
    const src = state.ctx.createMediaStreamSource(stream);
    connect(src);
    state.mode = 'live';
  }

  function usePulse() {
    // Synthetic driver: slow heartbeat + gentle stereo wobble for demo without mic.
    const length = config.BIN_COUNT;
    let t = 0;
    state.mode = 'pulse';
    return () => {
      t += 0.03;
      const left = new Float32Array(length);
      const right = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const beat = 0.5 + 0.5 * Math.sin(t + i * 0.08);
        const wobble = 0.5 + 0.5 * Math.sin(t * 0.37 + i * 0.04);
        left[i] = clamp01(0.3 * beat);
        right[i] = clamp01(0.3 * beat * wobble);
      }
      return { left, right };
    };
  }

  function useIdle() {
    const length = config.BIN_COUNT;
    state.mode = 'idle';
    return () => {
      const left = new Float32Array(length);
      const right = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const drift = Math.random() * 0.05;
        left[i] = drift;
        right[i] = drift;
      }
      return { left, right };
    };
  }

  function sampleAnalyser(analyser) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const out = new Float32Array(config.BIN_COUNT);
    const sr = state.ctx ? state.ctx.sampleRate : 44100;
    // TODO: Add mel-scaling option for reason: better psychoacoustic mapping.
    for (let i = 0; i < config.BIN_COUNT; i++) {
      const f = 20 * Math.pow(20000 / 20, i / (config.BIN_COUNT - 1 || 1));
      const bin = Math.floor((f / (sr / 2)) * data.length);
      out[i] = data[Math.min(data.length - 1, bin)] / 255;
    }
    return out;
  }

  function liveSampler() {
    return {
      left: sampleAnalyser(state.analyserL),
      right: sampleAnalyser(state.analyserR),
    };
  }

  async function switchMode(mode) {
    // Returns a sampler function producing {left,right} Float32Arrays.
    if (state.source && state.source.stop) state.source.stop();
    if (mode === 'live') {
      await useLive();
      return liveSampler;
    }
    if (mode === 'pulse') return usePulse();
    return useIdle();
  }

  return { switchMode, state };
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
