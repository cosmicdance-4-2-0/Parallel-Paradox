import { BiasField } from "./bias.js";
import { config, deltaId } from "./config.js";
import { PhaseLattice } from "./grid.js";
import { mixLens } from "./lens.js";

function planPulses(size, schedule) {
  return schedule.map((pulse) => {
    const x = Math.floor(((pulse.pan + 1) / 2) * (size - 1));
    const z = Math.floor(pulse.depth * (size - 1));
    const y = Math.floor((0.25 + pulse.amplitude * 0.5) * (size - 1));
    return { ...pulse, coord: { x, y, z } };
  });
}

function applyScheduledPulses(biasField, planned, step, strength) {
  planned
    .filter((p) => p.step === step)
    .forEach((p) => {
      const { x, y, z } = p.coord;
      biasField.applyPulse({ x, y, z, amplitude: p.amplitude * strength });
    });
}

export function runSession(custom = {}) {
  const settings = { ...config, ...custom };
  const lattice = new PhaseLattice({ size: settings.gridSize, alpha: settings.alpha, traceAlpha: settings.traceAlpha });
  const biasField = new BiasField(settings.gridSize, settings.bias.decay, settings.bias.radius);
  const plannedPulses = planPulses(settings.gridSize, settings.pulseSchedule);

  const metricsLog = [];
  const witnessLog = [];
  let forgivenessEvents = 0;

  for (let step = 0; step < settings.steps; step += 1) {
    biasField.decayField();
    applyScheduledPulses(biasField, plannedPulses, step, settings.bias.strength);

    const metrics = lattice.metrics(biasField);
    // TODO: Inject real audio/file-derived pulses when available to replace procedural schedule (keep bias influence-only).
    const lensMix = mixLens(metrics, settings);

    if (lensMix.forgivenessActive) {
      forgivenessEvents += 1;
    }

    lattice.perturb({ flipProbability: settings.flipProbability, parityProbability: settings.parityProbability });
    lattice.step(lensMix, biasField);

    if (step % 12 === 0) {
      const oracle = lattice.selectOracle();
      witnessLog.push({ step, oracle });
    }

    metricsLog.push({ step, lensMix, ...lattice.metrics(biasField) });
  }

  return {
    deltaId,
    config: settings,
    metricsLog,
    witnessLog,
    forgivenessEvents
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runSession();
  const last = result.metricsLog.at(-1) ?? {};
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        deltaId,
        steps: result.metricsLog.length,
        forgivenessEvents: result.forgivenessEvents,
        finalEnergy: last.energy,
        finalDispersion: last.dispersion,
        witnessFrames: result.witnessLog.length
      },
      null,
      2
    )
  );
}
