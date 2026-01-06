import { createConfig, DeltaID } from "./config.js";
import { PhaseGrid } from "./grid.js";
import { BiasField, DelayLine } from "./bias.js";
import { HarmonicLens } from "./harmonic.js";
import { Renderer } from "./renderer.js";
import { buildControls } from "./controls.js";

const cfg = createConfig();
const canvas = document.getElementById("view");
const overlay = document.getElementById("overlay");
const metricsEl = document.getElementById("metrics");
const controlsEl = document.getElementById("controls");

const renderer = new Renderer(canvas, cfg);
const positions = buildPositions(cfg.GRID, cfg.SCALE);
const viewRot = { rotX: 0, rotY: Math.PI / 4 };

const core = new PhaseGrid(cfg.GRID, cfg);
const echo = new PhaseGrid(cfg.GRID, cfg);
const biasCore = new BiasField(cfg.GRID, cfg.INPUT_DECAY);
const biasEcho = new BiasField(cfg.GRID, cfg.INPUT_DECAY);
const delay = new DelayLine(cfg.GRID, cfg.DELAY_FRAMES, cfg.DELAY_STRENGTH, cfg.INPUT_DECAY);
const harmonic = new HarmonicLens(cfg.HARMONIC_GAIN, cfg.KENOTIC_CLAMP);
const delayScratch = new Float32Array(cfg.GRID ** 3);

let paused = false;
let lastTime = 0;
let fps = 0;

const { pauseBtn, snapshotBtn } = buildControls(controlsEl, cfg, () => {});
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});
snapshotBtn.addEventListener("click", () => saveSnapshot(canvas));

setupPointer(viewRot, canvas);
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === " ") pauseBtn.click();
  if (e.key.toLowerCase() === "s") snapshotBtn.click();
});

requestAnimationFrame(loop);

function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  if (delta > 0) fps = 0.9 * fps + 0.1 * (1000 / delta);

  if (!paused) {
    biasCore.decayField();
    biasEcho.decayField();
    injectSyntheticPulse(biasCore, timestamp);
    // TODO: inject audio/file-driven bias; keep influence-only.

    // Delay line: push current influence, then blend for re-injection.
    delay.push(biasCore.field);
    delay.mix(delayScratch);

    const combinedCore = blendFields(biasCore.field, delayScratch, cfg.DELAY_STRENGTH);
    const combinedEcho = blendFields(biasEcho.field, delayScratch, cfg.DELAY_STRENGTH);
    const crossTalk = cfg.CROSS_TALK;

    // Echo informs core and vice versa via softened bias.
    core.perturb(mixBias(combinedCore, echo.liquid, crossTalk));
    const metricsCore = core.step({ bias: combinedCore, harmonic: harmonic.sample() });
    echo.perturb(mixBias(combinedEcho, core.liquid, crossTalk));
    const metricsEcho = echo.step({ bias: combinedEcho, harmonic: harmonic.sample() });

    harmonic.observe({ dispersion: (metricsCore.dispersion + metricsEcho.dispersion) * 0.5 });
  }

  renderer.draw({ positions, grid: core, rot: viewRot, time: timestamp / 1000 });
  renderer.renderMetrics(metricsEl, {
    fps,
    dispersion: harmonic.lastDispersion || 0,
    crossTalk: cfg.CROSS_TALK,
    delayStrength: cfg.DELAY_STRENGTH,
    harmonicGain: cfg.HARMONIC_GAIN,
    paused,
  });

  requestAnimationFrame(loop);
}

function buildPositions(size, scale) {
  const arr = new Float32Array(size ** 3 * 3);
  const half = (size - 1) / 2;
  let p = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        arr[p++] = (x - half) * scale;
        arr[p++] = (y - half) * scale;
        arr[p++] = (z - half) * scale;
      }
    }
  }
  return arr;
}

function setupPointer(rot, target) {
  let dragging = false;
  target.addEventListener("pointerdown", () => (dragging = true));
  window.addEventListener("pointerup", () => (dragging = false));
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = target.getBoundingClientRect();
    rot.rotX = ((e.clientY - rect.top) / rect.height) * Math.PI - Math.PI / 2;
    rot.rotY = ((e.clientX - rect.left) / rect.width) * Math.PI * 2;
  });
}

function saveSnapshot(canvasEl) {
  const link = document.createElement("a");
  link.download = `phasecube_${DeltaID}_${Date.now()}.png`;
  link.href = canvasEl.toDataURL();
  link.click();
}

function injectSyntheticPulse(biasField, timeMs) {
  const t = timeMs / 1000;
  const x = Math.floor(biasField.size / 2 + Math.sin(t * 0.7) * (biasField.size * 0.2));
  const y = Math.floor(biasField.size / 2 + Math.cos(t * 0.5) * (biasField.size * 0.2));
  const z = Math.floor(biasField.size / 2 + Math.sin(t * 0.9) * (biasField.size * 0.3));
  biasField.injectKernel({ x, y, z, radius: 2, strength: 0.8 });
}

function blendFields(src, delay, weight) {
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) {
    out[i] = src[i] + delay[i] * weight;
  }
  return out;
}

function mixBias(field, liquid, crossTalk) {
  const out = new Float32Array(field.length);
  for (let i = 0; i < field.length; i++) {
    out[i] = field[i] + liquid[i] * crossTalk * 0.08;
  }
  return out;
}
