export class PhaseGrid {
  constructor(size, config, tag = "core") {
    this.size = size;
    this.config = config;
    this.tag = tag;
    const total = size * size * size;
    this.plasma = new Float32Array(total);
    this.liquid = new Float32Array(total);
    this.solid = new Float32Array(total);
    this.parity = new Int8Array(total);
    for (let i = 0; i < total; i++) {
      // Seed with gentle randomness to avoid lockstep starts.
      const seed = Math.random() * 0.5;
      this.plasma[i] = seed;
      this.liquid[i] = seed;
      this.solid[i] = seed * 0.5;
    }
  }

  index(x, y, z) {
    const n = this.size;
    const wrap = (v) => ((v % n) + n) % n;
    return wrap(x) * n * n + wrap(y) * n + wrap(z);
  }

  neighborAvg(idx, plasmaView) {
    const n = this.size;
    const z = idx % n;
    const y = Math.floor(idx / n) % n;
    const x = Math.floor(idx / (n * n));
    const xm = this.index(x - 1, y, z);
    const xp = this.index(x + 1, y, z);
    const ym = this.index(x, y - 1, z);
    const yp = this.index(x, y + 1, z);
    const zm = this.index(x, y, z - 1);
    const zp = this.index(x, y, z + 1);
    return (
      (plasmaView[xm] +
        plasmaView[xp] +
        plasmaView[ym] +
        plasmaView[yp] +
        plasmaView[zm] +
        plasmaView[zp]) /
      6
    );
  }

  perturb() {
    const { flipProb, parityProb } = this.config;
    for (let i = 0; i < this.plasma.length; i++) {
      if (Math.random() < flipProb) this.plasma[i] = Math.random();
      if (Math.random() < parityProb) this.parity[i] = this.parity[i] === 0 ? 1 : 0;
    }
  }

  step({ biasField, couplingView }) {
    const {
      pathBWeight,
      parityBoost,
      alpha,
      forgivenessThreshold,
      forgivenessDamping,
      biasStrength,
      couplingWeight,
    } = this.config;

    const p = this.plasma;
    const l = this.liquid;
    const s = this.solid;

    for (let i = 0; i < p.length; i++) {
      const baseAvg = (p[i] + l[i] + s[i]) / 3;
      const nb = Math.abs(p[i] - this.neighborAvg(i, p)) + this.parity[i] * parityBoost;

      // Blend Path A (consensus) and Path B (difference) with a tunable weight.
      let mix = baseAvg * (1 - pathBWeight) + nb * pathBWeight;

      // Influence from coupled grid (echo/memory) remains soft; never overwrites state.
      if (couplingView) {
        mix += couplingView[i] * couplingWeight;
      }

      // Influence from transient bias remains bounded.
      if (biasField) {
        mix += biasField.sample(i) * biasStrength;
      }

      // Harmonic forgiveness: soften updates when dispersion spikes.
      const dispersion = Math.abs(mix - l[i]);
      if (dispersion > forgivenessThreshold) {
        mix = mix * (1 - forgivenessDamping) + l[i] * forgivenessDamping;
      }

      l[i] = mix;
      s[i] = s[i] * (1 - alpha) + mix * alpha;
    }
  }

  stats() {
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < this.liquid.length; i++) {
      const v = this.liquid[i];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / this.liquid.length;
    const variance = sumSq / this.liquid.length - mean * mean;
    return { mean, variance };
  }

  resize(newSize) {
    // TODO: Support structural plasticity (rewiring) when resize requests dynamic edges, for experiments.
    this.size = newSize;
    const total = newSize * newSize * newSize;
    this.plasma = new Float32Array(total);
    this.liquid = new Float32Array(total);
    this.solid = new Float32Array(total);
    this.parity = new Int8Array(total);
    for (let i = 0; i < total; i++) {
      const seed = Math.random() * 0.5;
      this.plasma[i] = seed;
      this.liquid[i] = seed;
      this.solid[i] = seed * 0.5;
    }
  }
}
