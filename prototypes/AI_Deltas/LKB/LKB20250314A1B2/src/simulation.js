import { BiasField } from "./bias.js";
import { PhaseGrid } from "./grid.js";
import { DeltaID, config } from "./config.js";
import { lensMixer } from "./lens.js";

/**
 * Minimal headless runner inspired by PhaseCube and prior deltas.
 * Run with `npm start` to view metrics for a short session.
 */
function runSession(steps = 120) {
  const grid = new PhaseGrid();
  const bias = new BiasField(grid.size);
  console.log(`Starting delta ${DeltaID} with grid ${grid.size}^3`);

  for (let t = 0; t < steps; t++) {
    bias.tick();

    // Procedural bias pulse that echoes prior liquid history
    const amp = 0.5 + 0.5 * Math.sin(t * 0.15);
    const center = Math.floor(grid.size / 2 + Math.sin(t * 0.08) * 2);
    bias.injectRadial({ x: center, y: center, z: center }, amp);

    const biasAmplitude = bias.biasAmplitude();
    const metrics = grid.metrics(biasAmplitude);
    const lens = lensMixer(metrics, config.lensWeights);

    grid.perturb(bias.getBias());
    grid.step({ bias: bias.getBias(), lens });

    if (t % 20 === 0) {
      console.log(
        `t=${t.toString().padStart(3, "0")}` +
          ` energy=${metrics.energy.toFixed(3)}` +
          ` dispersion=${metrics.dispersion.toFixed(3)}` +
          ` bias=${biasAmplitude.toFixed(3)}` +
          ` pathB=${lens.pathB.toFixed(3)}` +
          ` damping=${lens.damping.toFixed(3)}`
      );
    }
  }

  const delayed = grid.delayedBlend();
  const sample = Array.from(delayed.slice(0, 6)).map((v) => v.toFixed(3));
  console.log(`Delayed blend sample: [${sample.join(", ")}]`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSession();
}

export { runSession };
