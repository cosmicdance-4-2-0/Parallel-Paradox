import { defaultConfig, deltaId } from "./config.js";
import { DualSwarm } from "./swarm.js";
import { buildScenario, pulsesForStep } from "./scenario.js";

function mergeConfig(overrides = {}) {
  return {
    ...defaultConfig,
    ...overrides,
    pathB: { ...defaultConfig.pathB, ...(overrides.pathB || {}) },
    bias: { ...defaultConfig.bias, ...(overrides.bias || {}) },
    coupling: { ...defaultConfig.coupling, ...(overrides.coupling || {}) },
    lensWeights: { ...defaultConfig.lensWeights, ...(overrides.lensWeights || {}) },
    forgiveness: { ...defaultConfig.forgiveness, ...(overrides.forgiveness || {}) }
  };
}

export function runSession(configOverrides = {}, { captureEvery = 30 } = {}) {
  const config = mergeConfig(configOverrides);
  const swarm = new DualSwarm(config);
  const scenario = buildScenario(config.steps);
  const samples = [];
  let latest = null;

  for (let step = 0; step < config.steps; step++) {
    const pulses = pulsesForStep(step, scenario);
    latest = swarm.step(pulses);
    if (step % captureEvery === 0) {
      samples.push({ step, metrics: latest });
    }
  }

  return { deltaId, config, latestMetrics: latest, samples };
}

if (import.meta.url === (process?.argv[1] && new URL(`file://${process.argv[1]}`).href)) {
  const result = runSession();
  console.log(`Delta ${deltaId} session complete.`);
  console.table(
    result.samples.map((s) => ({
      step: s.step,
      energy: s.metrics.energy.toFixed(3),
      dispersion: s.metrics.dispersion.toFixed(3),
      bias: s.metrics.biasLevel.toFixed(3),
      pathB: s.metrics.controls.pathBProb.toFixed(3),
      damping: s.metrics.controls.damping.toFixed(3)
    }))
  );
}
