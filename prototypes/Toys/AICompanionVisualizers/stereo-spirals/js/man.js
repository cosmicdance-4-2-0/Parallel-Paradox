/*
File: js/main.js
Purpose: App wiring + orchestration — queries DOM, binds UI events, instantiates engine modules, and runs the main loop.
         Keeps logic aligned with the single-file source prototype (stereo spirals + expressive center).
*/

import { CONFIG } from "./config.js";
import { S, C, PI, clamp } from "./utils.js";
import { Renderer } from "./renderer.js";
import { AudioEngine } from "./audioengine.js";
import { FeatureExtractor } from "./featureextractor.js";
import { SphereSpiralsScene } from "./spherespiralsscene.js";
import { Recorder } from "./recorder.js";

/* =========================
 * 1) DOM references
 * =========================
 * These IDs must match index.html exactly.
 */
const mainEl = document.querySelector("main");
const canvas = document.getElementById("render-target");
const panel = document.getElementById("panel");
const statusEl = document.getElementById("status");

const btnMic = document.getElementById("btnMic");
const btnStopAudio = document.getElementById("btnStopAudio");
const fileInput = document.getElementById("file");
const btnRec = document.getElementById("btnRec");
const btnShot = document.getElementById("btnShot");

// A persistent <audio> element (does not need to be in the DOM).
// Used only for file playback mode; mic mode is analysis-only by default.
const audioEl = new Audio();

/* =========================
 * 2) Module instances
 * ========================= */
const renderer = new Renderer(canvas, mainEl);
const audio = new AudioEngine();
const extractor = new FeatureExtractor();
const recorder = new Recorder(canvas);

/* =========================
 * 3) UI helpers
 * ========================= */
function setStatus(msg) {
  statusEl.textContent = msg;
}

/**
 * Screenshot capture (PNG).
 * NOTE: Using toDataURL for simplicity and alignment with the source prototype.
 * If you later want “no stall” captures, switch to canvas.toBlob().
 */
function screenshot() {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `stereo_spirals_${Date.now()}.png`;
  a.click();
}

/* =========================
 * 4) Resize policy
 * =========================
 * - resize() is idempotent (does nothing if no size change).
 * - we call it on window resize, and also in the loop for “layout drift safety”
 *   (matches the single-file prototype’s defensive sizing behavior).
 */
renderer.resize();
window.addEventListener("resize", () => renderer.resize(), { passive: true });

/* =========================
 * 5) Wire UI events
 * ========================= */
btnMic.addEventListener("click", async () => {
  try {
    setStatus("mic: requesting…");
    await audio.startMic(visualTime);
    setStatus("mic: active ✅");
    btnStopAudio.disabled = false;
  } catch (e) {
    setStatus("mic: failed ❌");
    console.error(e);
  }
});

btnStopAudio.addEventListener("click", () => {
  audio.stop();

  // IMPORTANT: stop the <audio> element too, or it keeps playing (battery + CPU).
  try {
    audioEl.pause();
    audioEl.currentTime = 0;
  } catch {}

  // Free the last object URL immediately (not only on next file load).
  if (audioEl._objUrl) {
    try { URL.revokeObjectURL(audioEl._objUrl); } catch {}
    audioEl._objUrl = null;
  }

  setStatus("idle (demo features)");
  btnStopAudio.disabled = true;
});

fileInput.addEventListener("change", async (ev) => {
  const file = ev.target.files?.[0];
  if (!file) return;

  try {
    setStatus(`file: loading ${file.name}…`);
    await audio.startFile(audioEl, file, visualTime);
    setStatus(`file: playing ✅ (${file.name})`);
    btnStopAudio.disabled = false;
  } catch (e) {
    setStatus("file: failed ❌");
    console.error(e);
  } finally {
    // Allow selecting the same file again later.
    fileInput.value = "";
  }
});

btnRec.addEventListener("click", () => {
  recorder.toggle();
  btnRec.textContent = recorder.isRecording ? "Stop Rec" : "Start Rec";

  setStatus(
    recorder.isRecording
      ? "recording… 🎥"
      : (audio.mode === "idle" ? "idle (demo features)" : `${audio.mode}: active ✅`)
  );
});

btnShot.addEventListener("click", screenshot);

/* =========================
 * 6) Scene instances (stereo)
 * =========================
 * - Center orb: expressive face features ON
 * - Left/Right: face features OFF
 * Each sphere gets a hue offset for visual separation.
 */
const sceneCenter = new SphereSpiralsScene({
  hueOffsetDeg: CONFIG.STEREO.CENTER_HUE_OFFSET,
  faceEnabled: true,
});

const sceneLeft = new SphereSpiralsScene({
  hueOffsetDeg: CONFIG.STEREO.LEFT_HUE_OFFSET,
  faceEnabled: false,
});

const sceneRight = new SphereSpiralsScene({
  hueOffsetDeg: CONFIG.STEREO.RIGHT_HUE_OFFSET,
  faceEnabled: false,
});

/* =========================
 * 7) Main loop
 * =========================
 * visualTime: monotonic (dt-accumulated) time base
 * tSec: audio-synced time when audio active, otherwise visualTime
 * dt clamp: avoids massive simulation jumps on tab-switch/resume
 */
let lastNow = performance.now();
let visualTime = 0;

let fpsAcc = 0;
let fpsFrames = 0;
let fps = 0;

function tick(now) {
  const dt = clamp((now - lastNow) / 1000, 0, 0.05);
  lastNow = now;
  visualTime += dt;

  // Defensive sizing (safe because renderer.resize() is idempotent)
  renderer.resize();

  const tSec = audio.timeSeconds(visualTime);
  const sample = audio.sample();
  const feat = extractor.sample(sample, tSec, now);

  renderer.beginFrame();

  const mid = feat.stereo?.mid ?? 0;
  const side = feat.stereo?.side ?? 0;

  // Stereo width proxy: larger when L/R differ more.
  const width = side / (mid + CONFIG.STEREO.EPS);
  const minDim = Math.min(renderer.vw, renderer.vh);

  // Separation radius responds to stereo width + bass, then clamped.
  let separationRadius =
    width * CONFIG.STEREO.SEPARATION_FROM_WIDTH +
    (feat.bass ?? 0) * CONFIG.STEREO.SEPARATION_FROM_BASS;

  separationRadius = clamp(
    separationRadius,
    CONFIG.STEREO.MIN_SEPARATION,
    minDim * CONFIG.STEREO.MAX_SEP_FRACTION_OF_MIN_DIM
  );

  // Orbital motion for left/right satellites
  const orbitPhase = tSec * CONFIG.STEREO.ORBIT_PHASE_SPEED;

  const cx = renderer.vw / 2;
  const cy = renderer.vh / 2;

  // Center boost: center gets stronger when audio is more mono.
  const centerBoost =
    CONFIG.STEREO.CENTER_BOOST_BASE +
    (1 - clamp(width, 0, 1)) * CONFIG.STEREO.CENTER_BOOST_FROM_MONO;

  const centerEnergy = mid * centerBoost;

  // Draw center (expressive)
  sceneCenter.draw(renderer.ctx, renderer.vw, renderer.vh, tSec, feat, cx, cy, centerEnergy);

  // Draw left (uses L channel energy as bass override)
  const leftX = cx + C(orbitPhase) * separationRadius;
  const leftY =
    cy +
    S(orbitPhase * CONFIG.STEREO.ORBIT_Y_FREQ) *
      separationRadius *
      CONFIG.STEREO.ORBIT_Y_RATIO;

  sceneLeft.draw(
    renderer.ctx,
    renderer.vw,
    renderer.vh,
    tSec,
    feat,
    leftX,
    leftY,
    feat.stereo?.L ?? 0
  );

  // Draw right (uses R channel energy as bass override)
  const rightX = cx + C(orbitPhase + PI) * separationRadius;
  const rightY =
    cy +
    S(orbitPhase * CONFIG.STEREO.ORBIT_Y_FREQ + PI) *
      separationRadius *
      CONFIG.STEREO.ORBIT_Y_RATIO;

  sceneRight.draw(
    renderer.ctx,
    renderer.vw,
    renderer.vh,
    tSec,
    feat,
    rightX,
    rightY,
    feat.stereo?.R ?? 0
  );

  /* -------------------------
   * HUD panel (optional)
   * ------------------------- */
  if (CONFIG.RENDER.HUD_ENABLED) {
    fpsAcc += dt;
    fpsFrames++;

    // Update FPS estimate every ~0.5s (stable without being sluggish)
    if (fpsAcc >= 0.5) {
      fps = fpsFrames / fpsAcc;
      fpsAcc = 0;
      fpsFrames = 0;
    }

    const bass = (feat.bass ?? 0).toFixed(3);
    const bright = (feat.brightness ?? 0).toFixed(3);
    const bpm = (feat.bpm ?? 0).toFixed(1);
    const sep = separationRadius.toFixed(0);

    panel.textContent =
      `mode: ${audio.mode}\n` +
      `fps: ${fps.toFixed(1)}\n` +
      `bpm: ${bpm} onset: ${feat.onset ? "YES" : "no"}\n` +
      `bass: ${bass} bright: ${bright}\n` +
      `stereo mid/side: ${mid.toFixed(3)} / ${side.toFixed(3)}\n` +
      `width: ${width.toFixed(3)}\n` +
      `separation: ${sep}px\n` +
      `face: ${CONFIG.FACE.ENABLED ? "on" : "off"}`;
  } else {
    panel.textContent = "";
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
setStatus("idle (demo features). Use Mic or Audio File.");
