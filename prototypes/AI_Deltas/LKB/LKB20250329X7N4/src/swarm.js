import { BiasField } from "./bias-field.js";
import { PhaseGrid } from "./grid.js";
import { computeLensControls } from "./lens.js";
import { clamp } from "./utils.js";

export class DualSwarm {
  constructor(config) {
    this.config = config;
    this.core = new PhaseGrid(config.gridSize, config.alpha);
    this.echo = new PhaseGrid(config.gridSize, config.alpha);
    this.bias = new BiasField(
      config.gridSize,
      config.bias.decay,
      config.bias.strength,
      config.bias.radius
    );
    this.metricsState = null;
  }

  applyPulses(pulses) {
    const s = this.config.gridSize;
    pulses.forEach((pulse) => {
      const x = clamp(Math.round((pulse.x ?? 0.5) * (s - 1)), 0, s - 1);
      const y = clamp(Math.round((pulse.y ?? 0.5) * (s - 1)), 0, s - 1);
      const z = clamp(Math.round((pulse.z ?? 0.5) * (s - 1)), 0, s - 1);
      this.bias.injectPulse({
        x,
        y,
        z,
        strength: pulse.strength,
        radius: pulse.radius
      });
    });
  }

  step(pulses = []) {
    this.bias.decayField();
    this.applyPulses(pulses);

    this.core.perturb(this.config.flipProbability, this.config.parityProbability);
    this.echo.perturb(this.config.flipProbability, this.config.parityProbability);

    const instantaneousMetrics = this.core.metrics();
    const biasLevel = this.bias.aggregate();
    const metrics = this._smoothMetrics({ ...instantaneousMetrics, biasLevel });

    const controls = computeLensControls(metrics, this.config);

    this.core.step({
      pathBProb: controls.pathBProb,
      damping: controls.damping,
      forgiveness: this.config.forgiveness,
      biasField: this.bias,
      biasGain: controls.biasGain,
      echoField: this.echo.liquid,
      echoGain: controls.echoGain
    });

    this.echo.step({
      pathBProb: clamp(controls.pathBProb * 0.85, this.config.pathB.clamp[0], this.config.pathB.clamp[1]),
      damping: controls.damping * 0.8,
      forgiveness: this.config.forgiveness,
      biasField: this.bias,
      biasGain: controls.biasGain * 0.6,
      echoField: this.core.liquid,
      echoGain: controls.echoGain * 0.5
    });

    return { ...metrics, controls };
  }

  _smoothMetrics(newMetrics) {
    if (!this.metricsState) {
      this.metricsState = newMetrics;
      return newMetrics;
    }
    const k = this.config.metricSmoothing;
    const smooth = (key) =>
      this.metricsState[key] * k + newMetrics[key] * (1 - k);
    const blended = {
      energy: smooth("energy"),
      dispersion: smooth("dispersion"),
      biasLevel: smooth("biasLevel")
    };
    this.metricsState = blended;
    return blended;
  }
}
