import { DELTA_ID, GRID_SIZE, DEFAULTS, RENDER, MEMORY, COUPLING } from "./config.js";
import { BiasField } from "./biasField.js";
import { PhaseGrid } from "./phaseGrid.js";
import { Renderer } from "./renderer.js";
import { deriveDynamics } from "./lenses.js";
import { initUI } from "./ui.js";
import { average } from "./utils.js";

const canvas = document.getElementById("view");
const renderer = new Renderer(canvas, GRID_SIZE, RENDER);

let lensWeights = { ...DEFAULTS.lensWeights };
let biasSettings = { ...DEFAULTS.bias };

const biasFieldPrimary = new BiasField(GRID_SIZE, biasSettings.decay);
const biasFieldEcho = new BiasField(GRID_SIZE, biasSettings.decay);

let gridPrimary = new PhaseGrid(GRID_SIZE, DEFAULTS.simulation);
let gridEcho = new PhaseGrid(GRID_SIZE, DEFAULTS.simulation);
let echoEnabled = false;

let lastTime = performance.now();
let fps = 0;
const solidHistory = [];

const ui = initUI(DEFAULTS, {
  onLensChange: (weights) => (lensWeights = weights),
  onBiasChange: (bias) => {
    biasSettings = bias;
    biasFieldPrimary.decay = bias.decay;
    biasFieldEcho.decay = bias.decay;
  },
  onEchoToggle: (enabled) => (echoEnabled = enabled),
  onPulse: () => injectBiasPulse(),
  onReset: () => resetSimulation(),
});

function injectBiasPulse() {
  const center = {
    x: Math.floor(Math.random() * GRID_SIZE.x),
    y: Math.floor(Math.random() * GRID_SIZE.y),
    z: Math.floor(Math.random() * GRID_SIZE.z),
  };
  biasFieldPrimary.injectSphere(center, biasSettings.radius, biasSettings.strength);
  if (echoEnabled) {
    biasFieldEcho.injectSphere(center, biasSettings.radius, biasSettings.strength * COUPLING.biasShare);
  }
}

function resetSimulation() {
  gridPrimary = new PhaseGrid(GRID_SIZE, DEFAULTS.simulation);
  gridEcho = new PhaseGrid(GRID_SIZE, DEFAULTS.simulation);
  solidHistory.length = 0;
  biasFieldPrimary.field.fill(0);
  biasFieldEcho.field.fill(0);
  ui.setEcho(echoEnabled);
}

function recordMemory(grid) {
  solidHistory.push(grid.getSolidAverage());
  if (solidHistory.length > MEMORY.historyLength) {
    solidHistory.shift();
  }
  const avg = average(solidHistory);
  // Memory bias nudges the lattice toward recalling the recent equilibrium point.
  return (avg - 0.5) * MEMORY.influence;
  // TODO: convert this into selective replay per spatial region instead of a single scalar bias.
}

function computeCouplingSource(grid) {
  // Shallow copy because we may scale values for mixing; avoids mutating source grid state.
  const liquid = grid.getLiquid();
  const mix = new Float32Array(liquid.length);
  for (let i = 0; i < liquid.length; i += 1) {
    mix[i] = liquid[i] * COUPLING.echoMix;
  }
  return mix;
}

function routeBias() {
  biasFieldPrimary.update();
  if (echoEnabled) {
    biasFieldEcho.update();
  }
}

function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  fps = 1000 / delta;

  const dynamics = deriveDynamics(lensWeights, DEFAULTS.simulation);
  const memoryBias = recordMemory(gridPrimary);

  routeBias();

  let echoCoupling = null;
  let echoDynamics = dynamics;

  if (echoEnabled) {
    // Echo grid gets a lighter bias share to avoid overpowering the main lattice.
    const echoBias = biasFieldEcho;
    gridEcho.step(echoBias, echoDynamics, null, memoryBias * 0.5);
    echoCoupling = computeCouplingSource(gridEcho);
    // Feedback from echo is scaled and fed into the primary grid.
  }

  const primaryResult = gridPrimary.step(biasFieldPrimary, dynamics, echoCoupling, memoryBias);

  renderer.draw(gridPrimary.getLiquid(), gridPrimary.parity);

  ui.updateStatus({
    fps,
    activity: primaryResult.liquidMean,
    echoEnabled,
  });

  requestAnimationFrame(loop);
}

// Kick off initial bias to avoid a static opening scene.
injectBiasPulse();
requestAnimationFrame(loop);

console.info(`PhaseCube Delta ${DELTA_ID} ready.`);

// TODO: add hotkeys for snapshotting and for freezing either grid independently.
