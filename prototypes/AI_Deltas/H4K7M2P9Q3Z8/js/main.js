import { config, DeltaID } from './config.js';
import { PhaseGrid } from './phaseGrid.js';
import { InputField } from './inputField.js';
import { Renderer } from './renderer.js';
import { AudioEngine } from './audioEngine.js';
import { UI } from './ui.js';
import { logWarn } from './utils.js';

const canvas = document.getElementById('render-surface');
config.DeltaID = DeltaID;
const renderer = new Renderer(canvas, config, buildPositions(config.gridSize));
const audio = new AudioEngine();
const ui = new UI(config);

let gridA;
let gridB;
let inputField;
let lastTime = performance.now();
let paused = false;
let fpsSmoother = 0;

ui.bind({
  onModeChange: handleModeChange,
  onReset: reset,
  onPause: (next) => (paused = next),
  onSnapshot: snapshot,
  onSliderChange: updateConfig,
  filePicker: document.getElementById('file-picker'),
});

// Deterministic start to keep runs comparable.
audio.useSynth().catch((err) => logWarn('Synth init failed', err));
reset();
requestAnimationFrame(animate);

aSyncModeLabel('synth');

function reset() {
  gridA = new PhaseGrid(config.gridSize, config.swarm, config.memory);
  gridB = new PhaseGrid(config.gridSize, config.swarm, config.memory);
  inputField = new InputField(config.gridSize, config.input);
}

async function handleModeChange(mode, file) {
  aSyncModeLabel(mode);
  if (mode === 'file' && !file) {
    document.getElementById('file-picker').click();
    return;
  }
  if (mode === 'mic') await audio.useMic();
  else if (mode === 'file' && file) await audio.useFile(file);
  else await audio.useSynth();
}

function animate(now) {
  const dt = now - lastTime;
  lastTime = now;
  const frameTarget = 1000 / config.fpsTarget;
  if (dt < frameTarget * 0.5) {
    requestAnimationFrame(animate);
    return;
  }

  if (!paused) {
    const spectrum = audio.sample();
    applyAudio(spectrum, now);
    inputField.decayAndDiffuse();
    gridA.step({ inputField, shadow: gridB.solid, coupling: config.coupling });
    gridB.step({ inputField, shadow: gridA.solid, coupling: config.coupling });
  }

  renderer.draw(gridA, gridB, now);
  fpsSmoother = fpsSmoother * 0.9 + (1000 / dt) * 0.1;
  ui.updateHUD({ energyA: gridA.energy, energyB: gridB.energy, fps: fpsSmoother });
  requestAnimationFrame(animate);
}

function applyAudio({ left, right, mix }, now) {
  const size = config.gridSize;
  // Fallback pulse keeps motion when audio permissions are absent.
  if (!left || !right || !left.length) {
    const pulse = (Math.sin(now * 0.0012) + 1) * 0.05;
    const center = Math.floor(size / 2);
    inputField.injectEnergy(center, center, center, pulse);
    return;
  }

  const drift = config.input.stereoDrift;
  for (let i = 0; i < left.length; i++) {
    const z = Math.floor((i / left.length) * size);
    const xBias = Math.floor((left[i] - right[i]) * size * drift);
    const yBias = Math.floor(Math.min(1, mix) * size * 0.25);
    const jitter = (Math.random() - 0.5) * 2; // keep grids from perfect symmetry.
    const strength = (left[i] + right[i]) * config.input.strength + jitter * 0.005;
    inputField.injectEnergy(Math.floor(size / 2) + xBias, Math.floor(size / 2) + yBias, z, strength);
  }
}

function snapshot() {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `phasecube_${DeltaID}.png`;
  link.href = url;
  link.click();
}

function buildPositions(size) {
  const coords = new Float32Array(size ** 3 * 3);
  const half = (size - 1) / 2;
  let ptr = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        coords[ptr++] = (x - half) * 26;
        coords[ptr++] = (y - half) * 26;
        coords[ptr++] = (z - half) * 26;
      }
    }
  }
  return coords;
}

function updateConfig(path, value) {
  // Simple deep path assign for known two-level structures.
  const [branch, key] = path;
  if (!config[branch]) return;
  config[branch][key] = value;
}

function aSyncModeLabel(mode) {
  document.querySelectorAll('.mode').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}
