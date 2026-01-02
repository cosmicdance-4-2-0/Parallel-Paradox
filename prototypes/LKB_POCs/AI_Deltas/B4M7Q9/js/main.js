import { createConfig } from "./config.js";
import { BiasField } from "./biasField.js";
import { PhaseGrid } from "./phaseGrid.js";
import { Renderer } from "./renderer.js";
import { buildControls } from "./controls.js";

const canvas = document.getElementById("view");
const controlsEl = document.getElementById("controls");
const config = createConfig();

let positions = buildPositions(config.gridSize, config.scale);
let biasField = new BiasField(config.gridSize, config.biasDecay);
let coreGrid = new PhaseGrid(config.gridSize, config, "core");
let echoGrid = new PhaseGrid(config.gridSize, config, "echo");
let renderer = new Renderer(canvas, config);
let paused = false;
let frame = 0;

buildControls(controlsEl, config, (key, value) => {
  config[key] = value;
  if (key === "biasDecay") {
    biasField.decay = value;
  }
});

setupControls();
requestAnimationFrame(loop);

function loop() {
  frame++;
  if (!paused) {
    biasField.decayField();
    if (frame % 45 === 0) {
      injectRandomPulse();
    }

    coreGrid.perturb();
    echoGrid.perturb();

    // Echo listens to core, then gently nudges it back.
    echoGrid.step({ biasField, couplingView: coreGrid.liquid });
    coreGrid.step({ biasField, couplingView: echoGrid.liquid });
  }

  const metrics = buildMetrics(coreGrid, echoGrid, biasField);
  renderer.draw(positions, coreGrid, metrics);
  requestAnimationFrame(loop);
}

function buildPositions(size, scale) {
  const arr = new Float32Array(size * size * size * 3);
  const offset = (size - 1) / 2;
  let idx = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        arr[idx++] = (x - offset) * scale * 0.65;
        arr[idx++] = (y - offset) * scale * 0.65;
        arr[idx++] = (z - offset) * scale * 0.65;
      }
    }
  }
  return arr;
}

function injectRandomPulse() {
  const n = config.gridSize;
  const x = Math.floor(Math.random() * n);
  const y = Math.floor(Math.random() * n);
  const z = Math.floor(Math.random() * n);
  const radius = 2 + Math.floor(Math.random() * 2);
  const strength = 0.12 + Math.random() * 0.2;
  biasField.injectPulse(x, y, z, radius, strength);
}

function setupControls() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      togglePause();
      e.preventDefault();
    }
    if (e.key.toLowerCase() === "s") {
      snapshot();
    }
  });

  document.getElementById("pause").addEventListener("click", togglePause);
  document.getElementById("snapshot").addEventListener("click", snapshot);

  // Simple drag-to-rotate camera.
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    renderer.rotationY += dx * 0.005;
    renderer.rotationX += dy * 0.005;
    lastX = e.clientX;
    lastY = e.clientY;
  });
}

function togglePause() {
  paused = !paused;
  document.getElementById("pause").textContent = paused ? "Resume (Space)" : "Pause (Space)";
}

function snapshot() {
  const data = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = data;
  a.download = `phasecube_${Date.now()}.png`;
  a.click();
}

function buildMetrics(core, echo, bias) {
  const cStats = core.stats();
  const eStats = echo.stats();
  const coherence = Math.max(0, 1 - Math.sqrt(cStats.variance));
  const dispersion = Math.sqrt(cStats.variance + eStats.variance);

  let biasSum = 0;
  for (let i = 0; i < bias.field.length; i++) {
    biasSum += bias.field[i];
  }
  const biasEnergy = biasSum / bias.field.length;

  // Coupling proxy: absolute mean difference between grids.
  let coupling = 0;
  for (let i = 0; i < core.liquid.length; i++) {
    coupling += Math.abs(core.liquid[i] - echo.liquid[i]);
  }
  coupling /= core.liquid.length;

  return { coherence, dispersion, bias: biasEnergy, coupling };
}

// TODO: Add structural plasticity hooks for neighbor rewiring once the basic coupling behavior is validated.
// TODO: Route external audio/OSC to biasField.injectPulse for responsive influence without command-style control.
// TODO: Persist summary stats to IndexedDB or localStorage to study long-running behavior across sessions.
