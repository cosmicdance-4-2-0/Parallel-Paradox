// HarmonicLens observes coherence/divergence and returns modulation knobs.
// It embodies the "soft steering" ethos: adjust weights, never overwrite state.

export class HarmonicLens {
  constructor(gain = 0.4, kenoticClamp = 0.3) {
    this.gain = gain;
    this.kenoticClamp = kenoticClamp;
    this.lastDispersion = 0;
  }

  observe({ dispersion }) {
    this.lastDispersion = dispersion;
  }

  sample() {
    // map dispersion into a branch boost; higher dispersion pushes toward averaging
    const centered = Math.tanh(this.lastDispersion - 0.18);
    const branchBoost = -centered * this.gain; // push against runaway divergence
    const kenotic = 1 + this.kenoticClamp * centered; // soften damping when calm
    return { branchBoost, kenotic };
  }
}
