import { clamp } from './utils.js';

export class LensProfile {
  constructor(weights) {
    this.weights = normalize(weights);
  }

  blend(other, t = 0.5) {
    const a = this.weights;
    const b = normalize(other);
    return new LensProfile({
      cognitive: lerp(a.cognitive, b.cognitive, t),
      predictive: lerp(a.predictive, b.predictive, t),
      systemic: lerp(a.systemic, b.systemic, t),
      harmonic: lerp(a.harmonic, b.harmonic, t)
    });
  }
}

export class LensController {
  constructor(presets, schedule = ['harmonic', 'exploratory', 'stable'], dwellSteps = 300, blendSpeed = 0.05) {
    this.presets = presets;
    this.schedule = schedule;
    this.dwellSteps = dwellSteps;
    this.blendSpeed = blendSpeed;
    this.currentIndex = 0;
    this.stepsIntoPreset = 0;
    this.activeProfile = new LensProfile(presets[schedule[0]]);
    this.targetProfile = new LensProfile(presets[schedule[0]]);
  }

  tick() {
    this.stepsIntoPreset += 1;
    if (this.stepsIntoPreset >= this.dwellSteps) {
      this.stepsIntoPreset = 0;
      this.currentIndex = (this.currentIndex + 1) % this.schedule.length;
      this.targetProfile = new LensProfile(this.presets[this.schedule[this.currentIndex]]);
    }
    const blended = this.activeProfile.blend(this.targetProfile.weights, this.blendSpeed);
    this.activeProfile = blended;
    return blended.weights;
  }

  override(weights) {
    this.activeProfile = new LensProfile(weights);
    this.targetProfile = new LensProfile(weights);
    this.stepsIntoPreset = 0;
  }
}

function normalize(weights) {
  const total = ['cognitive', 'predictive', 'systemic', 'harmonic']
    .map((key) => Math.max(0, weights[key] ?? 0))
    .reduce((acc, v) => acc + v, 0) || 1;
  return {
    cognitive: clamp((weights.cognitive ?? 0) / total, 0, 1),
    predictive: clamp((weights.predictive ?? 0) / total, 0, 1),
    systemic: clamp((weights.systemic ?? 0) / total, 0, 1),
    harmonic: clamp((weights.harmonic ?? 0) / total, 0, 1)
  };
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}
