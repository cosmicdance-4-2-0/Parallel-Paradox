import { baseConfig, DeltaID } from "./config.js";
import { PhaseLattice } from "./lattice.js";
import { BiasField } from "./bias.js";
import { Renderer } from "./renderer.js";
import { Controls } from "./controls.js";
import { computeLensAdjustments } from "./lenses.js";
import { clamp, safeRequestAnimationFrame } from "./utils.js";

const canvas = document.getElementById("view");
const renderer = new Renderer(canvas, baseConfig.camera);
const controls = new Controls();
const lattice = new PhaseLattice(baseConfig.gridSize, baseConfig);
const bias = new BiasField(baseConfig.gridSize, baseConfig.bias);

renderer.resize();
window.addEventListener("resize", () => renderer.resize());

const positions = buildPositions(baseConfig.gridSize, baseConfig.scale);
let paused = false;
let lastTime = 0;
let controlState = controls.values;

controls.onChange((state) => {
  controlState = state;
  if (state.reset) lattice.reset();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    paused = !paused;
  }
});

window.addEventListener("pointermove", (e) => {
  const nx = e.clientX / window.innerWidth;
  const ny = e.clientY / window.innerHeight;
  bias.updatePointer(nx, ny);
});

function loop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000 || 0.016);
  lastTime = timestamp;

  const metrics = lattice.metrics();
  const lens = computeLensAdjustments(metrics, controlState.lens);

  const biasField = bias.sample(dt);
  const noiseProb = clamp(controlState.noise * (1 + lens.dampingBoost), 0, 1);
  const parityProb = baseConfig.parityFlip;

  lattice.perturb(noiseProb, parityProb);
  lattice.applyBias(biasField, controlState.biasGain);

  if (!paused) {
    lattice.step(
      {
        alpha: baseConfig.alpha,
        basePathBias: controlState.pathBias,
        echoBlend: controlState.echoBlend,
        echoDecay: baseConfig.echoDecay,
        harmonicClamp: baseConfig.harmonicClamp,
        pathBiasShift: lens.pathBiasShift,
        echoBoost: lens.echoBoost,
        dampingBoost: lens.dampingBoost,
      },
      biasField
    );
  }

  renderer.draw(
    positions,
    lattice.plasma,
    lattice.liquid,
    lattice.solid,
    lattice.parity,
    metrics,
    DeltaID
  );

  safeRequestAnimationFrame(loop);
}

safeRequestAnimationFrame(loop);

function buildPositions(size, scale) {
  const half = (size - 1) / 2;
  const points = new Float32Array(size * size * size * 3);
  let idx = 0;
  for (let z = 0; z < size; z += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        points[idx * 3] = (x - half) * scale;
        points[idx * 3 + 1] = (y - half) * scale;
        points[idx * 3 + 2] = (z - half) * scale;
        idx += 1;
      }
    }
  }
  return points;
}

// TODO: Add temporal decimation in renderer for lower-end GPUs, for reason(s) of accessibility.
