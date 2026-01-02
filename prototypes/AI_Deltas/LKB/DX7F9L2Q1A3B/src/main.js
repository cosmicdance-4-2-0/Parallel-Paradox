import { mergeConfig } from './config.js';
import { TriGridEngine } from './engine.js';
import { makePositions, renderFrame } from './render.js';

const cfg = mergeConfig();
const canvas = document.getElementById('render');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const engine = new TriGridEngine(cfg);
const positions = makePositions(cfg.gridSize, cfg.render.scale);
let running = true;
let last = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
}

function loop(time = 0) {
  if (!running) return;
  const dt = time - last;
  if (dt > 16) {
    const { lensMix, metrics } = engine.tick();
    renderFrame(ctx, positions, engine.gridA, cfg, time / 1000, lensMix, metrics);
    status.textContent = `fps ${(1000 / Math.max(dt, 1)).toFixed(1)} | energy ${metrics.energy.toFixed(3)} | coherence ${metrics.coherence.toFixed(3)}`;
    last = time;
  }
  requestAnimationFrame(loop);
}

function bindControls() {
  const pauseBtn = document.getElementById('pause');
  pauseBtn.addEventListener('click', () => {
    running = !running;
    if (running) {
      requestAnimationFrame(loop);
      pauseBtn.textContent = 'Pause';
    } else {
      pauseBtn.textContent = 'Resume';
    }
  });

  document.getElementById('boost').addEventListener('click', () => {
    const frame = { left: pulse(0.8), right: pulse(0.2) };
    engine.tick(frame);
  });
}

function pulse(offset) {
  const bins = cfg.biasBins;
  const out = new Float32Array(bins);
  for (let i = 0; i < bins; i += 1) {
    out[i] = 0.4 + 0.5 * Math.sin((i / bins) * Math.PI * 2 + offset);
  }
  return out;
}

resize();
bindControls();
requestAnimationFrame(loop);
window.addEventListener('resize', resize);
