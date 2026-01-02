import { BiasField } from './biasField.js';
import { LensController } from './lenses.js';
import { PhaseGrid } from './phaseGrid.js';
import { clamp } from './util.js';

export const buildSimulation = (config) => {
  const grid = new PhaseGrid(config.gridSize, config);
  const biasField = new BiasField(config.gridSize, config.bias);
  const lenses = new LensController(config.lenses);

  return { grid, biasField, lenses };
};

export const stepSimulation = (sim, config, stepCount) => {
  const biasPulse = stepCount % config.bias.pulseInterval === 0;
  if (biasPulse) {
    const center = Math.floor(config.gridSize / 2);
    sim.biasField.addPulse({ x: center, y: center, z: center }, config.bias.pulseMagnitude);
  }

  sim.biasField.decayAndDiffuse();
  sim.grid.perturb();

  const variance = sim.grid.variance();
  const lensMix = sim.lenses.harmonize({
    variance,
    biasEnergy: clamp(sim.biasField.energy(), 0, 1),
    basePathB: config.pathBProbability
  });

  const forgivenessEvents = sim.grid.step(lensMix, sim.biasField, config.forgiveness);
  return { variance, lensMix, forgivenessEvents, biasEnergy: sim.biasField.energy() };
};

export const runSimulation = (config) => {
  const sim = buildSimulation(config);
  const forgivenessLog = [];
  let lastLensMix = null;
  let lastVariance = 0;
  let lastBiasEnergy = 0;

  for (let step = 1; step <= config.steps; step += 1) {
    const result = stepSimulation(sim, config, step);
    lastLensMix = result.lensMix;
    lastVariance = result.variance;
    lastBiasEnergy = result.biasEnergy;
    forgivenessLog.push(...result.forgivenessEvents);
  }

  return {
    summary: {
      steps: config.steps,
      variance: lastVariance,
      biasEnergy: lastBiasEnergy,
      lensMix: lastLensMix,
      forgivenessEvents: forgivenessLog.length
    },
    forgivenessLog,
    sim
  };
};
