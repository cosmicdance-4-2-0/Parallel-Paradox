/*
File: js/recorder.js
Purpose: Canvas recording — captures the canvas via captureStream() and writes a WebM file via MediaRecorder.
         Logic preserved from the source prototype (mime probing + download on stop).

Exports: Recorder
Depends: CONFIG
*/

import { CONFIG } from "./config.js";

export class Recorder {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas to capture.
   */
  constructor(canvas) {
    this.canvas = canvas;

    /** @type {MediaRecorder|null} */
    this.recorder = null;

    /** @type {BlobPart[]} */
    this.chunks = [];

    /** @type {boolean} */
    this.isRecording = false;

    /** @type {string|null} */
    this.mime = null;
  }

  /**
   * Pick the first supported MIME type from CONFIG.RECORDING.MIME_CANDIDATES.
   * Returns "" if none match (MediaRecorder can still work with default in some browsers).
   */
  _chooseMime() {
    // Guard: MediaRecorder may not exist in some environments
    if (typeof MediaRecorder === "undefined") return "";

    for (const m of CONFIG.RECORDING.MIME_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(m)) return m;
    }
    return "";
  }

  /**
   * Start recording (no-op if disabled or already recording).
   */
  start() {
    if (!CONFIG.RECORDING.ENABLED || this.isRecording) return;

    if (typeof MediaRecorder === "undefined") {
      console.warn("Recorder: MediaRecorder not supported in this browser.");
      return;
    }

    // captureStream FPS is best-effort; browser may clamp/ignore.
    const stream = this.canvas.captureStream(CONFIG.RECORDING.FPS);

    this.mime = this._chooseMime();
    this.chunks = [];

    // Create MediaRecorder with chosen MIME (if any)
    this.recorder = new MediaRecorder(
      stream,
      this.mime ? { mimeType: this.mime } : undefined
    );

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) this.chunks.push(e.data);
    };

    this.recorder.onstop = () => {
      // Bundle chunks into a Blob and download it
      const blob = new Blob(this.chunks, { type: this.mime || "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `stereo_spirals_${Date.now()}.webm`;
      a.click();

      // Cleanup object URL shortly after download triggers
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    this.recorder.start();
    this.isRecording = true;
  }

  /**
   * Stop recording (no-op if not recording).
   */
  stop() {
    if (!this.isRecording) return;

    try {
      this.recorder?.stop();
    } catch (err) {
      // If stop fails, still clear state so UI doesn't get stuck.
      console.warn("Recorder: stop() failed:", err);
    }

    this.isRecording = false;
  }

  /**
   * Convenience toggle.
   */
  toggle() {
    this.isRecording ? this.stop() : this.start();
  }
}
