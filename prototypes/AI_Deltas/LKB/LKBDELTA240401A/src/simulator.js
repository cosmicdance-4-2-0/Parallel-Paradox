import { BiasField } from "./bias-field.js";
import { PhaseGrid } from "./phase-grid.js";
import { withOverrides } from "./config.js";

export function createSimulator(configOverrides = {}) {
  const config = withOverrides(configOverrides);
  const grid = new PhaseGrid(config);
  const bias = new BiasField(config.gridSize, config);

  function pulseBias(step) {
    const center = Math.floor(config.gridSize / 2);
    const offset = (step % 2 === 0 ? 1 : -1) * (step % config.gridSize);
    bias.inject({ x: center, y: center, z: (center + offset + config.gridSize) % config.gridSize });
  }

  function step(stepIndex) {
    grid.perturb();
    if (stepIndex % config.run.biasPulseEvery === 0) {
      pulseBias(stepIndex);
    }
    bias.decayAndDiffuse();
    grid.step(bias);
    return {
      step: stepIndex,
      forgivenessEvents: grid.forgivenessEvents,
      meanLiquid: average(grid.liquid),
      meanBias: average(bias.field)
    };
  }

  return { config, grid, bias, step };
}

function average(arr) {
  let total = 0;
  for (const val of arr) total += val;
  return arr.length ? total / arr.length : 0;
}

// TODO: Add audio/file bias driver to pulseBias once a browser/WebAudio surface is available.
