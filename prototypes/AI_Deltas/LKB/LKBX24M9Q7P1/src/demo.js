import { MultiGridSwarm } from "./swarm.js";

function runDemo(steps = 12) {
  const swarm = new MultiGridSwarm();
  for (let i = 0; i < steps; i += 1) {
    if (i % 3 === 0) {
      swarm.injectBias({
        x: i % swarm.config.grid.size,
        y: (i * 2) % swarm.config.grid.size,
        z: (i * 3) % swarm.config.grid.size,
        strength: swarm.config.bias.injectionStrength * 0.8,
        radius: swarm.config.bias.radius,
      });
    }
    const result = swarm.step();
    const { energy, coherence, divergence } = result.aggregate;
    // eslint-disable-next-line no-console
    console.log(
      `step ${i + 1}`.padEnd(9),
      `energy=${energy.toFixed(3)}`,
      `coherence=${coherence.toFixed(3)}`,
      `divergence=${divergence.toFixed(3)}`
    );
  }
}

runDemo();
