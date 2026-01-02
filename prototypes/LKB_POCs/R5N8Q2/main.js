// DeltaID: R5N8Q2
// Orchestration layer tying grid, input, render, and controls.

import { GRID, TARGET_FPS, biasConfig, phaseConfig, traceConfig, rendererConfig } from './config.js';
import { PhaseGrid } from './grid.js';
import { InputLayer } from './input-layer.js';
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { createPositions } from './utils.js';

const canvas = document.getElementById('view');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const positions = createPositions(GRID, 26);
const grid = new PhaseGrid(GRID, phaseConfig, traceConfig, 26);
const inputLayer = new InputLayer(GRID);
const renderer = new Renderer(canvas, positions);
renderer.resize();

let rotX = 0.4;
let rotY = 0.6;
let paused = true;
let last = performance.now();
let biasField = new Float32Array(grid.len);

function start() {
    if (!paused) return;
    paused = false;
    last = performance.now();
    requestAnimationFrame(loop);
}

function pause() {
    paused = !paused;
    if (!paused) {
        last = performance.now();
        requestAnimationFrame(loop);
    }
}

function save() {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `phasecube_${Date.now()}.png`;
    link.href = url;
    link.click();
}

async function enableMic() {
    const ok = await inputLayer.enableMic();
    if (ok) {
        document.getElementById('mic-status').textContent = 'Mic: on';
    } else {
        document.getElementById('mic-status').textContent = 'Mic: fallback';
    }
}

const controls = new Controls(start, pause, save, enableMic,
    (v) => { biasConfig.gain = v; },
    (v) => { phaseConfig.harmonicWeight = v; },
    (v) => { traceConfig.traceBlend = v; }
);

let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mouseup', () => { dragging = false; });
canvas.addEventListener('mouseleave', () => { dragging = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotY += dx * 0.003;
    rotX += dy * 0.003;
    lastX = e.clientX;
    lastY = e.clientY;
});

function loop(now) {
    if (paused) return;
    const dt = now - last;
    if (dt < 1000 / TARGET_FPS) {
        requestAnimationFrame(loop);
        return;
    }
    last = now;

    biasField = inputLayer.step();
    grid.injectBias(biasField);
    grid.diffuseBias(biasConfig.fieldDecay, biasConfig.diffusion);
    grid.perturb();
    grid.step();

    const pts = renderer.project(rotX, rotY);
    renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, now * 0.001);
    requestAnimationFrame(loop);
}

// Start paused; user clicks start. We still render one frame to show the HUD.
const pts = renderer.project(rotX, rotY);
renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, performance.now() * 0.001);

// TODO: Add an adaptive timestep to maintain stability if the browser throttles requestAnimationFrame.
