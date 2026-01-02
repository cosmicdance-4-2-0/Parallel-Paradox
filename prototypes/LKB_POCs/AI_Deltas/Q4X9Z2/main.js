// PhaseCube Delta orchestration (DeltaID: Q4X9Z2)
// Wires input → bias → dual grids → renderer, leaving clear seams for future scaling.

import { DEFAULT_CONFIG, DELTA_ID } from './config.js';
import { fuseLens, resolveProfile } from './lens.js';
import { BiasField } from './biasField.js';
import { PhaseGrid } from './grid.js';
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { InputDriver } from './input.js';

const initialFusion = fuseLens(DEFAULT_CONFIG, resolveProfile(DEFAULT_CONFIG.initialProfile));

const state = {
  running: false,
  lensProfile: DEFAULT_CONFIG.initialProfile,
  fused: initialFusion,
  noise: initialFusion.noise,
  pathB: initialFusion.pathBProbability,
  forgivenessGain: initialFusion.forgivenessGain,
  biasGain: initialFusion.biasGain,
  coupling: { ...initialFusion.coupling }
};

function average(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) sum += array[i];
  return sum / array.length;
}

function init() {
  console.info(`Starting PhaseCube Delta ${DELTA_ID}`);
  const canvas = document.getElementById('viewport');
  const controlsContainer = document.getElementById('controls');
  const renderer = new Renderer(canvas, DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG.renderer);
  const input = new InputDriver();
  const biasField = new BiasField(DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG.bias.decay, DEFAULT_CONFIG.bias.diffusion);

  let core = new PhaseGrid(DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG);
  let echo = new PhaseGrid(DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG);
  let paused = false;
  let lastTime = performance.now();

  const controls = new Controls(controlsContainer, handleControl);
  controls.setProfile(state.lensProfile);
  let isDragging = false;
  let lastDrag = { x: 0, y: 0 };

  function handleControl(event) {
    switch (event.type) {
      case 'start':
        state.running = true;
        input.init();
        break;
      case 'pause':
        paused = !paused;
        break;
      case 'mic':
        input.enableMic();
        break;
      case 'lensProfile':
        state.lensProfile = event.value;
        state.fused = fuseLens(DEFAULT_CONFIG, resolveProfile(event.value));
        // Update tunables to reflect lens presets.
        state.noise = state.fused.noise;
        state.pathB = state.fused.pathBProbability;
        state.forgivenessGain = state.fused.forgivenessGain;
        state.biasGain = state.fused.biasGain;
        state.coupling = state.fused.coupling;
        break;
      case 'biasGain':
        state.biasGain = event.value;
        break;
      case 'crossTalk':
        state.coupling = { coreToEcho: event.value, echoToCore: event.value * 0.8 };
        break;
      case 'noise':
        state.noise = event.value;
        break;
      case 'forgiveness':
        state.forgivenessGain = event.value;
        break;
      case 'pathB':
        state.pathB = event.value;
        break;
      default:
        break;
    }
  }

  function resetGrids() {
    core = new PhaseGrid(DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG);
    echo = new PhaseGrid(DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG);
  }

  function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (state.running && !paused) {
      const sample = input.sample(dt);
      biasField.update(sample.strength, sample.focus);

      const preCoreMetrics = core.metrics();
      const preEchoMetrics = echo.metrics();
      const divergence = preCoreMetrics.energy - preEchoMetrics.energy;

      core.perturb(state.noise);
      echo.perturb(state.noise * 0.9);

      core.step({
        biasField: biasField.field,
        biasGain: state.biasGain,
        couplingBias: -divergence * state.coupling.echoToCore,
        pathBProbability: state.pathB,
        forgivenessGain: state.forgivenessGain,
        forgivenessThreshold: DEFAULT_CONFIG.forgiveness.threshold
      });

      echo.step({
        biasField: biasField.field,
        biasGain: state.biasGain,
        couplingBias: divergence * state.coupling.coreToEcho,
        pathBProbability: state.pathB * 0.95,
        forgivenessGain: state.forgivenessGain * 0.95,
        forgivenessThreshold: DEFAULT_CONFIG.forgiveness.threshold
      });

      const postCoreMetrics = core.metrics();
      const postEchoMetrics = echo.metrics();
      const biasAverage = average(biasField.field);

      renderer.draw(core, echo, {
        core: postCoreMetrics,
        echo: postEchoMetrics,
        divergence: Math.abs(postCoreMetrics.energy - postEchoMetrics.energy),
        biasAverage
      }, state.lensProfile);
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') paused = !paused;
    if (e.key === 'r') resetGrids();
  });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastDrag = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastDrag.x;
    const dy = e.clientY - lastDrag.y;
    renderer.rotateY += dx * 0.005;
    renderer.rotateX += dy * 0.005;
    lastDrag = { x: e.clientX, y: e.clientY };
  });

  // TODO: Add multi-grid ensembles (beyond core/echo) when experimenting with larger consensus topologies.
  // TODO: Persist control snapshots to localStorage to let users resume favorite lens settings.

  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
