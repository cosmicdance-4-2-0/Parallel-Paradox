/*
File: js/renderer.js
Purpose: Canvas renderer utilities — handles DPR scaling, resize-to-layout, and per-frame clears/trails/compositing.
*/

import { CONFIG } from "./config.js";

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas - The primary render surface.
   * @param {HTMLElement} mainEl - The layout container the canvas should fill (typically <main>).
   */
  constructor(canvas, mainEl) {
    this.canvas = canvas;
    this.mainEl = mainEl;

    /**
     * 2D rendering context.
     * alpha:false => opaque canvas (often faster, and matches your black background pipeline).
     */
    this.ctx = canvas.getContext("2d", { alpha: false });
    if (!this.ctx) {
      throw new Error("Renderer: Failed to acquire 2D canvas context.");
    }

    /** View width/height in CSS pixels (logical pixels). */
    this.vw = 0;
    this.vh = 0;

    /** Device pixel ratio actually used for the backing buffer (clamped by CONFIG.RENDER.DPR_MAX). */
    this.dpr = 1;

    /**
     * Internal guard: whether we've performed the “first-frame” hard clear since init/resize.
     * Used to avoid smearing artifacts after a resize.
     */
    this._backgroundDrawn = false;

    /**
     * Cache of the last applied size state.
     * This makes resize() safe to call frequently (even every frame) without doing heavy work
     * or resetting the trail state unless something actually changed.
     */
    this._last = {
      vw: 0,
      vh: 0,
      dpr: 0,
      // backing store size (device pixels)
      bw: 0,
      bh: 0,
    };
  }

  /**
   * Measure the drawable area (mainEl) and resize the canvas backing buffer accordingly.
   *
   * Design notes:
   * - We measure mainEl rather than window.innerHeight - headerHeight.
   *   This keeps the renderer correct if header/footer sizes change, or if CSS layout changes.
   * - We early-return if dimensions and DPR haven't changed, so resize() is idempotent.
   *   That prevents accidental “clear every frame” behavior if someone calls resize() in the loop.
   */
  resize() {
    // Compute capped DPR (devicePixelRatio can be > 2 on some phones/retina devices).
    const nextDpr = Math.min(
      CONFIG.RENDER.DPR_MAX,
      Math.max(1, window.devicePixelRatio || 1)
    );

    // Measure available drawing area in CSS pixels.
    const rect = this.mainEl.getBoundingClientRect();
    const nextVw = Math.max(1, Math.floor(rect.width));
    const nextVh = Math.max(1, Math.floor(rect.height));

    // Compute backing buffer size in device pixels (integers).
    const nextBw = (nextVw * nextDpr) | 0;
    const nextBh = (nextVh * nextDpr) | 0;

    // If nothing changed, do nothing (prevents unnecessary reallocations and trail resets).
    if (
      nextVw === this._last.vw &&
      nextVh === this._last.vh &&
      nextDpr === this._last.dpr &&
      nextBw === this._last.bw &&
      nextBh === this._last.bh
    ) {
      return;
    }

    // Commit state
    this.dpr = nextDpr;
    this.vw = nextVw;
    this.vh = nextVh;

    this._last.vw = nextVw;
    this._last.vh = nextVh;
    this._last.dpr = nextDpr;
    this._last.bw = nextBw;
    this._last.bh = nextBh;

    // CSS size (what the user sees)
    this.canvas.style.width = `${this.vw}px`;
    this.canvas.style.height = `${this.vh}px`;

    // Backing buffer size (what we actually render into)
    this.canvas.width = nextBw;
    this.canvas.height = nextBh;

    // Draw in CSS pixel coordinates (so your math stays in vw/vh space).
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Resizing invalidates previous pixels; re-establish the background on next beginFrame().
    this._backgroundDrawn = false;
  }

  /**
   * Prepare the canvas for a new frame:
   * - optional one-time hard clear after resize/init
   * - trail fade (alpha fill)
   * - switch to additive blending for drawing primitives
   */
  beginFrame() {
    const ctx = this.ctx;
    const [r, g, b] = CONFIG.RENDER.BACKGROUND_RGB;

    // Optional hard clear once after resize/init
    if (!this._backgroundDrawn && CONFIG.RENDER.CLEAR_ON_FIRST_FRAME) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, 0, this.vw, this.vh);
      this._backgroundDrawn = true;
    }

    // Trails: fade previous frame toward background
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(${r},${g},${b},${CONFIG.RENDER.TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, this.vw, this.vh);

    // Additive glow for subsequent drawing (your spirals use this look)
    ctx.globalCompositeOperation = CONFIG.RENDER.ADDITIVE_BLEND_MODE;
  }
}
