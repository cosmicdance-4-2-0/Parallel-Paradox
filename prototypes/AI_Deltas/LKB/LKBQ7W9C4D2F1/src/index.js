import { SIM_CONFIG, DELTA_ID } from './config.js';
import { runSimulation } from './simulation.js';

const main = () => {
  const result = runSimulation(SIM_CONFIG);
  const { summary } = result;

  const lines = [
    `Delta ${DELTA_ID} — Lens-Governed Harmonic Core`,
    `Steps: ${summary.steps}`,
    `Variance: ${summary.variance.toFixed(4)}`,
    `Bias energy: ${summary.biasEnergy.toFixed(4)}`,
    `PathB weight: ${summary.lensMix.pathBWeight.toFixed(3)} (harmonic brake ${summary.lensMix.harmonicBrake.toFixed(3)})`,
    `Forgiveness events: ${summary.forgivenessEvents}`
  ];

  console.log(lines.join('\n'));
};

main();
