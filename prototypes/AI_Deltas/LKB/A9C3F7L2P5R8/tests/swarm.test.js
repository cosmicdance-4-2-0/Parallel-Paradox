import test from "node:test";
import assert from "node:assert/strict";
import { BASE_CONFIG } from "../src/config.js";
import { MultiGridSwarm } from "../src/multiGridSwarm.js";
import { RNG } from "../src/random.js";
import { mapLensWeights } from "../src/lensMapper.js";

test("multi-grid swarm stays bounded over multiple steps", () => {
  const swarm = new MultiGridSwarm({ x: 4, y: 4, z: 4 }, BASE_CONFIG);
  const rng = new RNG(42);
  const params = { ...mapLensWeights({ human: 0.5, predictive: 0.5, systemic: 0.5, harmonic: 0.5 }), alpha: BASE_CONFIG.alpha };

  for (let i = 0; i < 15; i += 1) {
    swarm.step(params, rng);
  }

  const maxLiquid = Math.max(...swarm.core.liquid, ...swarm.echo.liquid, ...swarm.memory.liquid);
  const minLiquid = Math.min(...swarm.core.liquid, ...swarm.echo.liquid, ...swarm.memory.liquid);

  assert.ok(maxLiquid <= 1 && minLiquid >= 0);
});
