import { createSimulator } from "./simulator.js";

const simulator = createSimulator();

console.log(`LKBDELTA240401A :: grid=${simulator.config.gridSize} steps=${simulator.config.run.steps}`);

for (let i = 0; i < simulator.config.run.steps; i++) {
  const metrics = simulator.step(i);
  if (i % 8 === 0) {
    console.log(
      [
        `step=${metrics.step}`,
        `meanLiquid=${metrics.meanLiquid.toFixed(3)}`,
        `meanBias=${metrics.meanBias.toFixed(3)}`,
        `forgiveness=${metrics.forgivenessEvents}`
      ].join(" | ")
    );
  }
}

console.log("Simulation complete. Final forgiveness count:", simulator.grid.forgivenessEvents);
