import {
  DeltaID,
  defaults,
  tunables as baseTunables,
  biasConfig,
  traceConfig,
} from "./config.js";
import { clamp01, seeded } from "./utils.js";
import { BiasField } from "./biasField.js";
import { PhaseGrid } from "./phaseGrid.js";
import { Renderer } from "./renderer.js";
import { createTrace, pushTrace } from "./metrics.js";
import { Controls } from "./controls.js";

const canvas = document.getElementById("scene");
const rng = seeded(Date.now() % 2147483647);
const tunables = { ...baseTunables };
const bias = new BiasField(defaults.gridSize, biasConfig.decay, biasConfig.drift);
const core = new PhaseGrid(defaults.gridSize, "core");
const echo = new PhaseGrid(defaults.gridSize, "echo");
const trace = createTrace(core.count, traceConfig.fade);
const renderer = new Renderer(canvas, {
  size: defaults.gridSize,
  scale: defaults.scale,
  camera: defaults.camera,
});
const controls = new Controls(tunables);

const crossFromCore = new Float32Array(core.count);
const crossFromEcho = new Float32Array(core.count);

let running = false;
let lastTime = 0;
let angleY = 0;
let fps = 0;
let biasReadout = 0;

const average = (arr) => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / (arr.length || 1);
};

const updateBiasReadout = () => {
  biasReadout = average(bias.field);
};

const updateDeltaBadge = () => {
  const el = document.getElementById("delta-id");
  if (el) el.textContent = DeltaID;
};

const setRunning = (next) => {
  running = next;
  controls.setState(running ? "running" : "paused");
  if (running) {
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
};

const applyCrossTalk = (source, target, weight) => {
  for (let i = 0; i < source.length; i++) {
    target[i] = source[i] * weight;
  }
};

const loop = (time) => {
  if (!running) return;
  const dt = time - lastTime;
  lastTime = time;
  const instantaneousFps = 1000 / (dt || 1);
  fps = fps * 0.9 + instantaneousFps * 0.1;

  angleY += defaults.camera.orbitSpeed * dt;
  bias.tick(time);
  updateBiasReadout();

  // Cross-talk uses gradients from each grid (soft influence).
  core.computeCrossGradient(crossFromCore);
  echo.computeCrossGradient(crossFromEcho);
  applyCrossTalk(crossFromCore, crossFromCore, tunables.crossTalk);
  applyCrossTalk(crossFromEcho, crossFromEcho, tunables.crossTalk);

  const coreMetrics = core.step({
    biasField: bias,
    crossField: crossFromEcho,
    pathBWeight: tunables.pathBWeight,
    forgiveness: tunables.forgiveness,
    memoryBlend: tunables.memoryBlend,
    noise: tunables.noise,
    rng,
  });

  const echoMetrics = echo.step({
    biasField: bias,
    crossField: crossFromCore,
    pathBWeight: clamp01(tunables.pathBWeight + 0.08),
    forgiveness: tunables.forgiveness * 0.8,
    memoryBlend: tunables.memoryBlend * 0.8,
    noise: tunables.noise * 1.1,
    rng,
  });

  pushTrace(trace, core.liquid);
  renderer.render({
    core,
    echo,
    trace,
    angleX: defaults.camera.elevation,
    angleY,
  });

  controls.updateStats({
    fps,
    energy: (coreMetrics.energy + echoMetrics.energy) * 0.5,
    coherence: (coreMetrics.coherence + echoMetrics.coherence) * 0.5,
    bias: biasReadout,
  });

  requestAnimationFrame(loop);
};

const reset = () => {
  core.seed(rng);
  echo.seed(rng);
  bias.field.fill(0);
  controls.setState("reset");
};

const pulseBias = () => {
  const n = defaults.gridSize;
  bias.pulse({
    x: Math.floor(rng() * n),
    y: Math.floor(rng() * n),
    z: Math.floor(rng() * n),
    radius: biasConfig.pulseRadius,
    strength: biasConfig.pulseStrength,
  });
  // TODO: Integrate real audio FFT bins here, for influence-not-command biasing informed by microphones.
};

const init = () => {
  updateDeltaBadge();
  controls.setHandlers({
    onStart: () => setRunning(!running),
    onReset: reset,
    onPulse: pulseBias,
    onChange: (next) => Object.assign(tunables, next),
  });
  reset();
};

init();
