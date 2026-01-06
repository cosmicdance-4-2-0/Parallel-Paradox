import { createConfig, DeltaID } from "./config.js";
import { TriGridSwarm } from "./swarm.js";

export async function runSession(overrides = {}) {
  const config = createConfig(overrides);
  const swarm = new TriGridSwarm(config);
  const frames = [];

  for (let step = 0; step < config.steps; step += 1) {
    const pulses = (config.pulses || []).filter((p) => p.step === step);
    frames.push(swarm.step(step, pulses));
  }

  const summarize = (key) => frames.reduce((acc, m) => acc + (m?.[key] ?? 0), 0) / (frames.length || 1);

  return {
    deltaId: DeltaID,
    steps: frames.length,
    finalOracle: frames[frames.length - 1]?.oracle ?? null,
    energyMean: summarize("energy"),
    dispersionMean: summarize("dispersion"),
    biasLoadMean: summarize("biasLoad"),
    frames
  };
}

async function main() {
  const result = await runSession();
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
