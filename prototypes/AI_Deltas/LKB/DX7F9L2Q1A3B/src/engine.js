import { BiasField } from './bias.js';
import { PhaseGrid } from './grid.js';
import { deriveLensMix, applyLensToProb } from './lens.js';
import { clamp } from './math.js';

export class TriGridEngine {
  constructor(config) {
    this.cfg = config;
    this.gridA = new PhaseGrid(config.gridSize);
    this.gridB = new PhaseGrid(config.gridSize);
    this.gridHarmonic = new PhaseGrid(config.gridSize);
    this.bias = new BiasField(config.gridSize, {
      decay: config.decay,
      strength: config.biasStrength,
      radius: config.biasRadius
    });
    this.syntheticPhase = 0;
  }

  tick(externalSpectrum) {
    const biasFrame = this.prepareBias(externalSpectrum);
    const mergedMetrics = this.mergeMetrics();
    const lensMix = deriveLensMix(mergedMetrics, this.cfg.lens);

    this.gridA.perturb(this.cfg.noiseFlip, this.cfg.parityFlip, biasFrame);
    this.gridB.perturb(this.cfg.noiseFlip * 0.8, this.cfg.parityFlip, null);
    this.gridHarmonic.perturb(this.cfg.noiseFlip * 0.6, this.cfg.parityFlip * 0.5, biasFrame);

    const base = applyLensToProb(this.cfg.basePathBias, lensMix);
    const harmonicBase = clamp(base - 0.1, 0.05, 0.9);
    const echoBase = clamp(base + 0.05, 0.05, 0.95);

    this.gridA.step({
      basePath: base,
      alpha: this.cfg.alpha,
      parityWeight: this.cfg.parityWeight,
      biasField: biasFrame,
      biasGain: this.cfg.biasGain,
      lensMix,
      harmonicClamp: this.cfg.harmonicClamp
    });

    this.gridB.step({
      basePath: echoBase,
      alpha: this.cfg.alpha * 0.9,
      parityWeight: this.cfg.parityWeight * 0.8,
      biasField: null,
      biasGain: 0,
      lensMix,
      harmonicClamp: this.cfg.harmonicClamp * 0.6
    });

    this.gridHarmonic.step({
      basePath: harmonicBase,
      alpha: this.cfg.alpha * 1.1,
      parityWeight: this.cfg.parityWeight * 0.4,
      biasField: biasFrame,
      biasGain: this.cfg.biasGain * -0.5,
      lensMix: { ...lensMix, pathBoost: -Math.abs(lensMix.pathBoost), damping: Math.max(lensMix.damping, 0.1) },
      harmonicClamp: this.cfg.harmonicClamp
    });

    return {
      lensMix,
      metrics: this.mergeMetrics(),
      biasSample: biasFrame ? biasFrame.slice(0, 16) : null
    };
  }

  prepareBias(externalSpectrum) {
    // TODO: wire real audio input; keep synthetic fallback to stay dependency-light in this delta.
    const left = externalSpectrum?.left ?? this.syntheticBand();
    const right = externalSpectrum?.right ?? this.syntheticBand(true);
    this.bias.injectSpectrum(left, right);
    return this.bias.bias;
  }

  syntheticBand(offset = false) {
    const bins = this.cfg.biasBins;
    const out = new Float32Array(bins);
    this.syntheticPhase += 0.07;
    for (let i = 0; i < bins; i += 1) {
      const phase = this.syntheticPhase + (offset ? Math.PI / 3 : 0);
      out[i] = 0.5 + 0.4 * Math.sin(phase + i * 0.18);
    }
    return out;
  }

  mergeMetrics() {
    const mA = this.gridA.metrics();
    const mB = this.gridB.metrics();
    const mH = this.gridHarmonic.metrics();
    return {
      energy: (mA.energy + mB.energy + mH.energy) / 3,
      coherence: (mA.coherence + mB.coherence + mH.coherence) / 3,
      divergence: (mA.divergence + mB.divergence + mH.divergence) / 3
    };
  }
}
