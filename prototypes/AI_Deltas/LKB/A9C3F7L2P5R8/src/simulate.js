import { BASE_CONFIG, DELTA_ID } from "./config.js";
import { LensScheduler } from "./lensScheduler.js";
import { mapLensWeights } from "./lensMapper.js";
import { MultiGridSwarm } from "./multiGridSwarm.js";
import { RNG } from "./random.js";

const steps = Number.parseInt(process.env.STEPS || "30", 10);
const presetOverride = process.env.PRESET;
const seed = Number.parseInt(process.env.SEED || "1337", 10);

const rng = new RNG(seed);
const scheduler = new LensScheduler(BASE_CONFIG.lensPresets, BASE_CONFIG.schedulerScript, {
  preset: presetOverride
});
const swarm = new MultiGridSwarm(BASE_CONFIG.dimensions, BASE_CONFIG);

console.log(`DeltaID ${DELTA_ID} — starting ${steps} steps (seed=${seed})`);
for (let i = 0; i < steps; i += 1) {
  const lensWeights = scheduler.step();
  const lensParams = {
    ...mapLensWeights(lensWeights),
    alpha: BASE_CONFIG.alpha
  };
  const metrics = swarm.step(lensParams, rng);
  const roundedLens = Object.fromEntries(
    Object.entries(lensWeights).map(([k, v]) => [k, Number.parseFloat(v.toFixed(2))])
  );
  const summary = {
    step: i + 1,
    lens: roundedLens,
    coreCoh: metrics.core.coherence.toFixed(3),
    echoCoh: metrics.echo.coherence.toFixed(3),
    memCoh: metrics.memory.coherence.toFixed(3),
    coreH: metrics.core.entropy.toFixed(3)
  };
  console.log(summary);
}
