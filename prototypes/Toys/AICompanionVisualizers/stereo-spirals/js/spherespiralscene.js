/*
File: js/spherespiralsscene.js
Purpose: Visual scene renderer — draws a sphere of spiraling “agents” (quads) with optional expressive face features
         (eyes/mouth) for the center orb. Logic preserved from the source prototype.

Exports: SphereSpiralsScene
Depends: CONFIG + math helpers (S, C, PI, clamp)
*/

import { CONFIG } from "./config.js";
import { S, C, PI, clamp } from "./utils.js";

export class SphereSpiralsScene {
  /**
   * @param {object} options
   * @param {("fixedHSL"|"rgbWave")} [options.colorSpace] - Color palette strategy
   * @param {number} [options.hueOffsetDeg] - Global hue offset (degrees)
   * @param {boolean} [options.faceEnabled] - If true, this scene draws expressive center features
   */
  constructor(options = {}) {
    /** Color palette mode. */
    this.colorSpace = options.colorSpace ?? CONFIG.SCENE.COLOR_SPACE;

    /** Hue offset used only when colorSpace == "fixedHSL". */
    this.hueOffsetDeg = options.hueOffsetDeg ?? CONFIG.SCENE.HUE_OFFSET_DEG;

    /**
     * Face features:
     * - this is intended to be true only on the center sphere
     * - still gated by CONFIG.FACE.ENABLED (global kill switch)
     */
    this.faceEnabled = options.faceEnabled ?? false;

    /** Precomputed per-agent fill styles (strings). */
    this.colors = this._makeColors();

    /**
     * Per-agent phase offsets. We keep it stable across frames for coherent motion.
     * Size: QUAD_COUNT (not including face features).
     */
    this.phase = new Float32Array(CONFIG.SCENE.QUAD_COUNT);

    for (let k = 0; k < CONFIG.SCENE.QUAD_COUNT; k++) {
      this.phase[k] = (k / CONFIG.SCENE.QUAD_COUNT) * CONFIG.SCENE.MOTION.PHASE_PER_AGENT;
    }

    /**
     * Regex used to replace only the last alpha component in a color string.
     * Works for:
     *   hsla(h,s,l,a)
     *   rgba(r,g,b,a)
     *
     * We apply this when boosting alpha for “face” features (eyes/mouth).
     */
    this._alphaTailRegex = /,[^,]+\)$/;
  }

  /* =========================
   * Palette creation
   * ========================= */

  /**
   * Precompute colors for the base agents.
   * This avoids per-frame color string construction.
   */
  _makeColors() {
    const n = CONFIG.SCENE.QUAD_COUNT;
    const alpha = CONFIG.SCENE.QUAD_ALPHA;
    const colors = new Array(n);

    if (this.colorSpace === "fixedHSL") {
      // Evenly spaced hue wheel, stable and clean.
      for (let k = 0; k < n; k++) {
        const hue = (this.hueOffsetDeg + k * (360 / n)) % 360;
        colors[k] = `hsla(${hue},100%,65%,${alpha})`;
      }
      return colors;
    }

    // Alternate palette: smooth RGB wave (kept from prototype).
    for (let k = 0; k < n; k++) {
      const r = (128 + 127 * S(k * 2.4)) | 0;
      const g = (128 + 127 * S(k * 2.4 + 2.1)) | 0;
      const b = (128 + 127 * S(k * 2.4 + 4.2)) | 0;
      colors[k] = `rgba(${r},${g},${b},${alpha})`;
    }
    return colors;
  }

  /* =========================
   * Draw
   * ========================= */

  /**
   * Draw the scene into a 2D context.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} vw - viewport width in CSS pixels
   * @param {number} vh - viewport height in CSS pixels
   * @param {number} tSec - time (seconds), typically audio-synced
   * @param {object} features - output of FeatureExtractor.sample()
   * @param {number} [overrideCx] - optional override center x
   * @param {number} [overrideCy] - optional override center y
   * @param {number} [bassOverride] - optional override bass energy (used for L/R spheres)
   *
   * NOTE: This function intentionally draws *rects* (fillRect), not arcs.
   * The “pixel quad” style is part of the scene identity.
   */
  draw(ctx, vw, vh, tSec, features, overrideCx, overrideCy, bassOverride) {
    // Where this sphere lives on screen.
    const cx = overrideCx ?? vw * CONFIG.SCENE.SPHERE.SCREEN_CENTER_X_FACTOR;
    const cy = overrideCy ?? vh * CONFIG.SCENE.SPHERE.SCREEN_CENTER_Y_FACTOR;

    // Audio-driven drivers (with optional overrides for left/right energy mapping).
    const bass = bassOverride ?? (features.bass ?? 0);
    const brightness = features.brightness ?? 0;

    // Motion mapping: bass increases longitudinal speed; brightness affects latitude gain.
    const speed =
      CONFIG.SCENE.MOTION.LONGITUDE_SPEED *
      (1 + bass * CONFIG.SCENE.AUDIO_MAP.SPEED_FROM_BASS);

    const latGain =
      CONFIG.SCENE.MOTION.LATITUDE_GAIN *
      (1 + brightness * CONFIG.SCENE.AUDIO_MAP.LAT_FROM_BRIGHTNESS);

    // Sphere scale based on min viewport dimension, plus bass scaling.
    const minDim = Math.min(vw, vh);
    const sphereRadius =
      minDim *
      CONFIG.SCENE.AUDIO_MAP.SCALE_BASE_FACTOR *
      (1 + bass * CONFIG.SCENE.AUDIO_MAP.SCALE_FROM_BASS);

    // Depth mapping constants.
    const depthA = CONFIG.SCENE.SPHERE.DEPTH_A;
    const depthB = CONFIG.SCENE.SPHERE.DEPTH_B;

    // Base agent count.
    const n = CONFIG.SCENE.QUAD_COUNT;

    // Face features only for center orb, and only if enabled globally.
    const faceOn = this.faceEnabled && CONFIG.FACE.ENABLED;

    // Total number of “draw entities” this pass:
    // - base n agents
    // - plus eyes + mouth particles, if faceOn
    const total =
      n +
      (faceOn ? CONFIG.FACE.EYE_COUNT + CONFIG.FACE.MOUTH_COUNT : 0);

    // Draw each entity as a projected quad on a sphere.
    for (let k = 0; k < total; k++) {
      // Identify whether this is a base agent or a face feature.
      let isFeature = false;
      let type = "";
      let idx = 0;

      if (faceOn && k >= n) {
        isFeature = true;
        const f = k - n; // feature index within face features

        // First EYE_COUNT are eyes, rest are mouth points.
        type = f < CONFIG.FACE.EYE_COUNT ? "eye" : "mouth";
        idx = type === "eye" ? f : f - CONFIG.FACE.EYE_COUNT;
      }

      // Base agents use unique phase; face features are anchored (phase 0).
      const p = isFeature ? 0 : this.phase[k % n];

      // Feature biases applied to face entities only.
      let aBias = 0;      // longitude bias
      let bBias = 0;      // latitude bias
      let sizeBoost = 1;  // size multiplier
      let alphaBoost = 1; // alpha multiplier

      if (isFeature) {
        if (type === "eye") {
          /**
           * EYES:
           * - placed above center (bBias positive)
           * - spread horizontally with aBias
           * - driven by brightness band (highMid by default)
           */
          aBias =
            (idx - (CONFIG.FACE.EYE_COUNT - 1) / 2) * 0.6;
          bBias = 0.45;

          const energy =
            features.bands?.[CONFIG.FACE.EYE_BRIGHTNESS_BAND] ?? 0;

          sizeBoost = 1 + energy * CONFIG.FACE.EXPRESSION_GAIN;
          alphaBoost = 1 + energy * CONFIG.FACE.EYE_ALPHA_BOOST;
        } else if (type === "mouth") {
          /**
           * MOUTH:
           * - placed below center (bBias negative)
           * - spread widens with “mouth open” band
           * - size increases slightly with energy
           */
          const energy =
            features.bands?.[CONFIG.FACE.MOUTH_OPEN_BAND] ?? 0;

          const spread = energy * CONFIG.FACE.MOUTH_SPREAD_GAIN;

          aBias =
            (idx / (CONFIG.FACE.MOUTH_COUNT - 1) - 0.5) *
            1.2 *
            (1 + spread);

          bBias = -0.55 - energy * 0.4;

          sizeBoost = 1 + energy * 0.9;
        }
      }

      /**
       * SPIRAL TERM:
       * Adds a gentle per-agent spiral wobble that rotates over time,
       * and offsets agents by SPIRAL_AGENT_PHASE_STEP.
       */
      const spiral =
        S(
          tSec * CONFIG.SCENE.MOTION.SPIRAL_SPEED * speed +
            (k % n) * CONFIG.SCENE.MOTION.SPIRAL_AGENT_PHASE_STEP
        ) * CONFIG.SCENE.MOTION.SPIRAL_AMPLITUDE;

      // Spherical coordinates (a=longitude-ish, b=latitude-ish)
      const a = tSec * speed + p + spiral + aBias;
      const b = S(a * CONFIG.SCENE.MOTION.LATITUDE_WAVE + p) * latGain + bBias;

      // Convert to 3D unit sphere point
      const X = C(b) * C(a);
      const Y = S(b);
      const Z = C(b) * S(a);

      // Perspective-ish depth projection factor:
      // d in (something like [depthB-depthA, depthB+depthA]) depending on Z
      const d = Z * depthA + depthB;

      // Size: base + bass scaled, then divided by depth. (Near points become larger.)
      const s =
        ((CONFIG.SCENE.SIZE.BASE + bass * CONFIG.SCENE.SIZE.AUDIO_GAIN) / d) *
        sizeBoost;

      // Base color is derived from agent index within base palette.
      let color = this.colors[k % n];

      // If this is a feature, boost alpha (safely) without changing other components.
      if (isFeature) {
        const newAlpha = clamp(alphaBoost * CONFIG.SCENE.QUAD_ALPHA, 0, 1);
        color = color.replace(this._alphaTailRegex, `,${newAlpha})`);
      }

      // Draw as a small quad centered at projected position.
      ctx.fillStyle = color;
      ctx.fillRect(
        cx + (X * sphereRadius) / d - s / 2,
        cy + (Y * sphereRadius) / d - s / 2,
        s,
        s
      );
    }
  }
}
