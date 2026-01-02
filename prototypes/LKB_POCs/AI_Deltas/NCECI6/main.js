// DeltaID: NCECI6
// Orchestration layer tying grid, lens fusion, input, rendering, and controls.

import { GRID, SCALE, TARGET_FPS, phaseConfig, biasConfig, memoryConfig, lensProfiles, controlsConfig } from './config.js';
import { PhaseGrid } from './grid.js';
import { LensFusion } from './lens.js';
import { InputLayer } from './input-layer.js';
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { createPositions } from './utils.js';

const canvas = document.getElementById('view');
const positions = createPositions(GRID, SCALE);

const grid = new PhaseGrid(GRID, phaseConfig, memoryConfig);
const lensFusion = new LensFusion(lensProfiles, phaseConfig.harmonicWeight);
const inputLayer = new InputLayer(GRID);
const renderer = new Renderer(canvas, positions);
renderer.resize();

let rotX = 0.4;
let rotY = 0.6;
let paused = true;
let last = performance.now();
let micActive = false;
const ROTATE_SENSITIVITY = controlsConfig.sensitivity ?? 0.005;

function start() {
    if (!paused) return;
    paused = false;
    last = performance.now();
    requestAnimationFrame(loop);
    controls.setStatus(`Mic: ${micActive ? 'on' : 'off'}`);
}

function togglePause() {
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
    micActive = ok;
    controls.setStatus(`Mic: ${ok ? 'on' : 'fallback'}`);
}

const controls = new Controls(
    start,
    togglePause,
    save,
    enableMic,
    (profile) => lensFusion.setProfile(profile),
    (value) => { phaseConfig.harmonicWeight = value; lensFusion.setHarmonicWeight(value); },
    (value) => { biasConfig.gain = value; },
    (value) => { memoryConfig.traceBlend = value; }
);

// Drag-to-rotate controls.
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
    rotY += dx * ROTATE_SENSITIVITY;
    rotX += dy * ROTATE_SENSITIVITY;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('resize', () => renderer.resize());

function loop(now) {
    if (paused) return;
    const dt = now - last;
    if (dt < 1000 / TARGET_FPS) {
        requestAnimationFrame(loop);
        return;
    }
    last = now;

    const biasField = inputLayer.step();
    const biasGain = biasConfig.gain * (micActive ? biasConfig.micGain : biasConfig.fallbackGain);
    grid.blendBias(biasField, biasGain);
    grid.diffuseBias(biasConfig.fieldDecay, biasConfig.diffusion);
    grid.perturb();
    grid.step(lensFusion);

    const pts = renderer.project(rotX, rotY);
    renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, now * 0.001);
    requestAnimationFrame(loop);
}

// Render once so the HUD overlays something even before start.
const pts = renderer.project(rotX, rotY);
renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, performance.now() * 0.001);
controls.setStatus('Mic: off');

// TODO: Add adaptive timestep to stay stable if the browser throttles requestAnimationFrame.
