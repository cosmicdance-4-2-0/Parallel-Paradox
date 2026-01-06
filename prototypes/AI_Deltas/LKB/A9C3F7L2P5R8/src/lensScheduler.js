export class LensScheduler {
  constructor(presets, script, options = {}) {
    this.presets = presets;
    this.script = script;
    this.stepCounter = 0;
    this.segmentIndex = 0;
    this.overridePreset = options.preset;
    this.cache = {};
  }

  currentTarget() {
    const entry =
      this.overridePreset && this.presets[this.overridePreset]
        ? { preset: this.overridePreset, steps: Infinity }
        : this.script[this.segmentIndex % this.script.length];
    return this.presets[entry.preset] || this.presets.balanced;
  }

  nextTarget() {
    const nextIndex = (this.segmentIndex + 1) % this.script.length;
    return this.presets[this.script[nextIndex].preset] || this.presets.balanced;
  }

  blendWeights(current, target, t) {
    const key = `${current}-${target}-${t.toFixed(2)}`;
    if (this.cache[key]) return this.cache[key];
    const blendValue = (a, b) => a * (1 - t) + b * t;
    const blended = {
      human: blendValue(current.human, target.human),
      predictive: blendValue(current.predictive, target.predictive),
      systemic: blendValue(current.systemic, target.systemic),
      harmonic: blendValue(current.harmonic, target.harmonic)
    };
    this.cache[key] = blended;
    return blended;
  }

  step() {
    const segment = this.script[this.segmentIndex % this.script.length];
    const target = this.currentTarget();
    const next = this.nextTarget();
    const t = Math.min(1, this.stepCounter / Math.max(1, segment.steps));

    const blended = this.blendWeights(target, next, t);
    this.stepCounter += 1;
    if (this.stepCounter >= segment.steps) {
      this.segmentIndex += 1;
      this.stepCounter = 0;
    }
    return { ...blended };
  }
}
