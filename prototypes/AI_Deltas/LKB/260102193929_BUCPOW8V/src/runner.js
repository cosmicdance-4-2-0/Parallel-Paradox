import { withConfig } from './config.js';
import { BiasField } from './bias.js';
import { computeLensWeights } from './lens.js';
import { PhaseLattice } from './lattice.js';

function meanAbs(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) sum += Math.abs(array[i]);
  return sum / array.length;
}

export function runSession(options = {}) {
  const config = withConfig(options.config || {});
  const lattice = new PhaseLattice(config.gridSize, config.phases);
  const biasField = new BiasField(config.gridSize, config.bias);

  const frames = [];
  for (let step = 0; step < config.steps; step++) {
    const bias = biasField.tick(step);
    const biasEnergy = meanAbs(bias);
    const metrics = lattice.metrics(biasEnergy);
    const lensWeights = computeLensWeights(metrics, config);

    lattice.perturb(bias);
    lattice.step(bias, lensWeights);

    if (step % 60 === 0 || step === config.steps - 1) {
      frames.push({
        step,
        energy: Number(metrics.energy.toFixed(3)),
        dispersion: Number(metrics.dispersion.toFixed(3)),
        biasEnergy: Number(biasEnergy.toFixed(4)),
        basePathB: Number(lensWeights.basePathB.toFixed(3)),
        forgiveness: Number(lensWeights.forgiveness.toFixed(3))
      });
    }
  }

  const finalBias = meanAbs(biasField.bias);
  const finalMetrics = lattice.metrics(finalBias);
  const lensWeights = computeLensWeights(finalMetrics, config);

  return {
    deltaId: config.deltaId || '260102193929_BUCPOW8V',
    gridSize: config.gridSize,
    steps: config.steps,
    lensWeights,
    finalMetrics: {
      energy: Number(finalMetrics.energy.toFixed(4)),
      dispersion: Number(finalMetrics.dispersion.toFixed(4)),
      biasEnergy: Number(finalMetrics.biasEnergy.toFixed(4))
    },
    frames,
    witness: lattice.witness(6)
  };
}
