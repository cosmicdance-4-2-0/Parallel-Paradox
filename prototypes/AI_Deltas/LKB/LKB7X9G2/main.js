import { CONFIG } from "./config.js";
import { LensController } from "./lenses.js";
import { InputBridge, InputField } from "./input.js";
import { PhaseGrid } from "./simulation.js";
import { Renderer } from "./renderer.js";
import { UI } from "./ui.js";

const canvas = document.getElementById("phasecube");
const statusEl = document.getElementById("status");
const lens = new LensController(CONFIG);
const inputBridge = new InputBridge(CONFIG);
const inputField = new InputField(CONFIG.GRID_SIZE, CONFIG);
let grid = new PhaseGrid(CONFIG.GRID_SIZE, CONFIG, lens);
const renderer = new Renderer(canvas, CONFIG);

new UI({ lens, inputBridge, config: CONFIG, onReset: () => reset(grid, inputField) });

let last = performance.now();
let running = true;

function loop(now) {
  if (!running) return;
  const dt = now - last;
  last = now;

  const bias = inputBridge.sample(dt);
  inputField.inject(bias);
  inputField.step();
  lens.tick(inputBridge.lastStrength);
  grid.step(inputField, bias);

  const plane = grid.probe();
  renderer.draw(plane);

  statusEl.textContent = `Δ ${CONFIG.DELTA_ID} | Mode: ${inputBridge.mode} | Bias: ${inputBridge.lastStrength.toFixed(2)}`;
  requestAnimationFrame(loop);
}

function reset(currentGrid, field) {
  currentGrid.seed();
  field.grid.fill(0);
}

function toggleRun() {
  running = !running;
  if (running) {
    last = performance.now();
    requestAnimationFrame(loop);
  }
}

document.getElementById("toggle").addEventListener("click", () => toggleRun());
window.addEventListener("resize", () => renderer.resize());
requestAnimationFrame(loop);
