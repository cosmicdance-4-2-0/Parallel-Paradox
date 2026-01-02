import { CONFIG } from './config.js';
import { Controls } from './controls.js';
import { PhaseGrid } from './grid.js';
import { InputLayer } from './input-layer.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('view');
const grid = new PhaseGrid(CONFIG.grid);
const renderer = new Renderer(canvas, grid);
const inputLayer = new InputLayer(CONFIG.grid);
const controls = new Controls();

let running = false;
let paused = false;
let biasWeight = CONFIG.bias.weight;
let forgivenessStrength = CONFIG.harmonic.forgivenessStrength;
let traceDepth = CONFIG.trace.depth;
let lastTime = 0;

renderer.resize(CONFIG.canvas.width, CONFIG.canvas.height);
controls.setStatus('Idle — click Start to wake the lattice.');

function snapshot() {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `phasecube-${Date.now()}.png`;
  link.href = url;
  link.click();
  controls.setStatus('Snapshot saved.');
}

function loop(timestamp) {
  if (!running) return;
  const now = timestamp || performance.now();
  const dt = now - lastTime;
  lastTime = now;

  if (!paused) {
    grid.perturbNoise();
    const biasField = inputLayer.update(now);
    grid.step({
      biasField,
      biasWeight,
      forgivenessStrength,
      forgivenessThreshold: CONFIG.harmonic.forgivenessThreshold,
      traceDepth,
    });
    controls.setStatus(
      `Running — bias ${biasWeight.toFixed(2)} | damping ${forgivenessStrength.toFixed(2)} | trace ${traceDepth.toFixed(2)} | ${(dt).toFixed(1)}ms/frame`,
    );
  } else {
    controls.setStatus('Paused — space to resume.');
  }

  renderer.draw(now);
  requestAnimationFrame(loop);
}

// UI bindings
controls.onStart(() => {
  if (running) return;
  running = true;
  paused = false;
  lastTime = performance.now();
  controls.setStatus('Starting...');
  requestAnimationFrame(loop);
});

controls.onMic(async () => {
  const ok = await inputLayer.enableMicrophone();
  controls.setStatus(ok ? 'Microphone bias enabled.' : 'Mic unavailable — procedural bias active.');
});

controls.onPause(() => {
  if (!running) return;
  paused = !paused;
  controls.setStatus(paused ? 'Paused — space to resume.' : 'Running — harmonic safety engaged.');
});

controls.onSnapshot(snapshot);

controls.onBiasWeight((value) => {
  biasWeight = value;
});

controls.onForgiveness((value) => {
  forgivenessStrength = value;
});

controls.onTrace((value) => {
  traceDepth = value;
});

// Expose a very small API for console experimentation.
window.phasecube = {
  grid,
  inputLayer,
  renderer,
  setBiasWeight: (v) => (biasWeight = v),
  setForgiveness: (v) => (forgivenessStrength = v),
  setTrace: (v) => (traceDepth = v),
};

// TODO: Allow toggling between multiple PhaseGrid instances to explore consensus behaviors.
// TODO: Add a debug HUD for FPS/bias energy without cluttering the core experience.
