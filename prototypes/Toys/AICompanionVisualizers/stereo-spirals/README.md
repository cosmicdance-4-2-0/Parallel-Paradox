```md
# Stereo Sphere Spirals — Expressive Center

A minimal, modular, stereo audio-reactive visualizer: three orbiting “sphere spiral” fields (Left / Center / Right), with an expressive “face” bias on the center orb. Supports mic input, audio file input, WebM recording, and PNG screenshots.

Everything is intentionally kept simple:
- **ES Modules** (no build step)
- **Canvas 2D** renderer with additive trails
- **Web Audio** analysis (master + L/R channels)
- **Config-first** tuning via `js/config.js`

---

## Features

- **Mic input** (secure context required)
- **Audio file input** (local playback + analysis)
- **Stereo metrics** (mid/side “width” drives orb separation)
- **Onset detection** (spectral flux + adaptive threshold + refractory)
- **BPM estimation** (median interval + smoothing)
- **Expressive center** (eyes/mouth particles driven by bands)
- **Recording** to WebM (`MediaRecorder`)
- **Screenshot** to PNG (`toDataURL`)
- **HUD panel**: mode, fps, bpm, onset, bass/brightness, width, separation, face state

---

## Project layout

```

stereo-spirals/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── config.js
│   ├── utils.js
│   ├── renderer.js
│   ├── audioengine.js
│   ├── featureextractor.js
│   ├── spherespiralsscene.js
│   ├── recorder.js
│   └── main.js
└── README.md

````

**Design intent:** one file per responsibility; `main.js` orchestrates and stays readable.

---

## Quick start

### 1) Run a local server (recommended)
Because this uses ES module imports, opening `index.html` via `file://` may fail in many browsers.

Pick one:

**Python**
```bash
cd stereo-spirals
python -m http.server 8000
````

**Node**

```bash
cd stereo-spirals
npx serve .
```

Then open:

* `http://localhost:8000/` (or whatever your server prints)

### 2) Use it

* Click **Enable Mic** (prompts permission)
* Or click **Use Audio File** and choose an audio file
* Use **Start Rec** to download a WebM
* Use **Screenshot** to download a PNG

---

## Controls

### Top bar

* **Enable Mic**
  Starts microphone capture + analysis.

  * Requires **HTTPS** or **[http://localhost](http://localhost)**
* **Use Audio File**
  Select an audio file for playback + analysis.
* **Stop Audio**
  Stops the engine and pauses audio playback (also revokes object URLs).
* **Start Rec / Stop Rec**
  Captures the canvas stream and downloads a `.webm` file.
* **Screenshot**
  Downloads a `.png` snapshot of the canvas.
* **Status text**
  Shows mode and “active” state.

### HUD panel (top-right)

Shows real-time telemetry if enabled in config:

* `mode`: idle / mic / file
* `fps`
* `bpm` and `onset`
* `bass`, `bright`
* `stereo mid/side`, `width`
* `separation` (px)
* `face` on/off

---

## Configuration

All tunables live in:

* `js/config.js` → `CONFIG`

Key areas you’ll likely tweak first:

### Rendering

* `CONFIG.RENDER.DPR_MAX`
  Caps devicePixelRatio scaling for performance.
* `CONFIG.RENDER.TRAIL_ALPHA`
  Lower = longer trails, higher = faster fade.
* `CONFIG.RENDER.ADDITIVE_BLEND_MODE`
  Usually `"lighter"` for additive glow.
* `CONFIG.RENDER.HUD_ENABLED`
  Toggle the debug panel.

### Audio analysis

* `CONFIG.AUDIO.MASTER_FFT_SIZE` / `CHANNEL_FFT_SIZE`
  Higher = more frequency resolution, more CPU.
* `CONFIG.AUDIO.BANDS_HZ`
  Defines band ranges used for energy mapping.
* `CONFIG.AUDIO.ONSET.*`
  Flux history, threshold multiplier, refractory behavior.
* `CONFIG.AUDIO.BPM.*`
  Min/max BPM clamp and smoothing.

### Stereo orbit behavior

* `CONFIG.STEREO.SEPARATION_FROM_WIDTH`
  How much “width” increases orb separation.
* `CONFIG.STEREO.SEPARATION_FROM_BASS`
  Bass contribution to separation.
* `CONFIG.STEREO.ORBIT_PHASE_SPEED`
  Orbital speed.

### Scene / face

* `CONFIG.SCENE.*`
  Core sphere spiral motion, depth, size.
* `CONFIG.FACE.ENABLED`
  Global toggle for expressive center.
* `CONFIG.FACE.*`
  Eye/mouth counts and audio band mapping.

### Recording

* `CONFIG.RECORDING.MIME_CANDIDATES`
  Browser-dependent; first supported is chosen.
* `CONFIG.RECORDING.FPS`
  Requested capture FPS (best-effort).

---

## Implementation notes (for future expansion)

* **`renderer.js`** sizes the canvas to `<main>` and is **idempotent**: calling `resize()` repeatedly is safe and avoids per-frame buffer resets.
* **`audioengine.js`** builds:

  * one master analyser
  * left/right analysers via `ChannelSplitterNode`
  * mic or file source routing
  * time sync via `audioTimeOffset` (so visuals align with audio clock)
* **`featureextractor.js`** avoids per-frame allocations by reusing float buffers; master uses a double-buffer swap for flux.
* **`spherespiralsscene.js`** draws “quads on a sphere” and (optionally) adds face features by biasing spherical coords.
* **`main.js`** is the orchestration layer: DOM, events, instantiation, main loop, and HUD.

---

## Browser support

* Works best in modern Chromium-based browsers (Chrome/Edge) and Firefox.
* **Mic requires secure context:** HTTPS or `http://localhost`.
* **Recording** depends on `MediaRecorder` support and codec availability. Some browsers may only support certain WebM variants (or none).

---

## Troubleshooting

### “Nothing renders” / blank page

* Confirm you are serving over HTTP(S), not `file://`.
* Check the DevTools console for module import errors (usually a path/case mismatch).

### Mic button fails immediately

* Must be on **HTTPS** or `http://localhost`.
* Verify mic permissions in the browser site settings.

### Audio file loads but no motion

* Confirm audio is actually playing (some formats/codecs may fail silently).
* Try an `.mp3` or `.wav` to sanity check.

### Recording produces no file

* `MediaRecorder` may be unavailable or codec unsupported.
* Try a different browser; check console warnings.

---

## Privacy

All analysis and rendering occur locally in your browser. Microphone audio is processed via Web Audio in-page; nothing is transmitted by this app unless you add networking code.

---

## Credits

* Author: Christopher “Kisuul” Lohman
* Built with: Web Audio API, Canvas 2D, ES Modules

---

```
```
