import { config, DeltaID } from './config.js';
import { PhaseGrid } from './phaseGrid.js';
import { InputField } from './inputField.js';
import { Renderer } from './renderer.js';
import { AudioEngine } from './audioEngine.js';
import { UI } from './ui.js';
import { logWarn } from './utils.js';

const canvas = document.getElementById('render-surface');
const renderer = new Renderer(canvas, config, buildPositions(config.gridSize));
const audio = new AudioEngine();
const ui = new UI(config, renderer);

let inputField = new InputField(config.gridSize, config.input);
let grid = new PhaseGrid(config.gridSize, config.swarm);

let lastTime = performance.now();
let paused = false;
let fpsSmoother = 0;

ui.bindControls(handleModeChange, resetSimulation, togglePause, () => renderer.snapshot(), (file) =>
  audio.useFile(file),
);

document.getElementById('delta-id').textContent = DeltaID;
document.getElementById('mode-label').textContent = audio.mode;
document.getElementById('btn-pause').setAttribute('aria-pressed', 'false');

// Start with the synth to keep the experience deterministic.
audio.useSynth().catch((err) => logWarn('Synth init failed', err));

function resetSimulation() {
  grid = new PhaseGrid(config.gridSize, config.swarm);
  inputField = new InputField(config.gridSize, config.input);
}

function togglePause(next) {
  paused = next;
}

async function handleModeChange(mode) {
  if (mode === 'mic') await audio.useMic();
  else if (mode === 'file') document.getElementById('file-picker').click();
  else await audio.useSynth();
}

function buildPositions(size) {
  const coords = new Float32Array(size ** 3 * 3);
  const half = (size - 1) / 2;
  let ptr = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        coords[ptr++] = x - half;
        coords[ptr++] = y - half;
        coords[ptr++] = z - half;
      }
    }
  }
  return coords;
}

function animate(now) {
  const dt = now - lastTime;
  lastTime = now;
  const frameTarget = 1000 / config.fpsTarget;
  if (dt < frameTarget * 0.5) {
    requestAnimationFrame(animate);
    return; // skip busy looping on faster devices.
  }

  if (!paused) {
    const frequencies = audio.sample();
    applyAudioToInput(frequencies);
    inputField.decayAndDiffuse();
    grid.step(inputField);
  }

  renderer.draw(grid, now);
  fpsSmoother = fpsSmoother * 0.9 + (1000 / dt) * 0.1;
  ui.updateHUD({ fps: fpsSmoother, energy: grid.energy });
  requestAnimationFrame(animate);
}

function applyAudioToInput({ left, right, mix }) {
  if (!left || !right || !left.length) return;
  const size = config.gridSize;
  const depthBias = Math.min(1, mix);

  // Map low frequencies to deeper slices, high to surface.
  // TODO: route multiple input channels to multiple lattices for cross-talk experiments.
  for (let i = 0; i < left.length; i++) {
    const z = Math.floor((i / left.length) * size);
    const xBias = Math.floor((left[i] - right[i]) * size * 0.5);
    const yBias = Math.floor(depthBias * size * 0.3);
    const strength = (left[i] + right[i]) * config.input.strength;
    // Centered injection with stereo and depth drift.
    inputField.injectEnergy(Math.floor(size / 2) + xBias, Math.floor(size / 2) + yBias, z, strength);
  }
}

resetSimulation();
requestAnimationFrame(animate);
