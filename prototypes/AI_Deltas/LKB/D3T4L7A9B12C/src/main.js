#!/usr/bin/env node
import { mergeConfig } from './config.js';
import { LensController } from './lenses.js';
import { MultiGridSwarm } from './multiGrid.js';
import { RNG } from './utils.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { steps: 200, seed: 1337, bias: 0 };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--steps' && args[i + 1]) options.steps = Number(args[i + 1]);
    if (arg === '--seed' && args[i + 1]) options.seed = Number(args[i + 1]);
    if (arg === '--bias' && args[i + 1]) options.bias = Number(args[i + 1]);
  }
  return options;
}

function formatMetrics(step, snapshot) {
  const { core, echo, memory, lensWeights } = snapshot;
  return {
    step,
    lens: lensWeights,
    coreEnergy: Number(core.averageEnergy.toFixed(4)),
    coreDivergence: Number(core.averageDivergence.toFixed(4)),
    echoEnergy: Number(echo.averageEnergy.toFixed(4)),
    memoryEnergy: Number(memory.averageEnergy.toFixed(4))
  };
}

function run() {
  const options = parseArgs();
  const config = mergeConfig();
  const rng = new RNG(options.seed);
  rng.random = rng.next.bind(rng);
  const lensController = new LensController(config.lensPresets);
  const swarm = new MultiGridSwarm(config, lensController, rng);

  const reports = [];
  for (let step = 1; step <= options.steps; step += 1) {
    const snapshot = swarm.tick(options.bias);
    if (step % 20 === 0 || step === options.steps) {
      reports.push(formatMetrics(step, snapshot));
    }
  }

  console.log(JSON.stringify({ deltaId: config.deltaId, reports }, null, 2));
}

run();
