/*
File: js/featureextractor.js
Purpose: Audio feature extraction — frequency bands, brightness (spectral centroid), spectral flux/onset, BPM estimate,
         and simple stereo metrics (L/R energy, mid/side, lrDiff). Designed to avoid per-frame allocations.
*/

import { CONFIG } from "./config.js";
import { S, PI, clamp, RingBuffer } from "./utils.js";

export class FeatureExtractor {
  constructor() {
    /**
     * Spectral flux history used to build a dynamic onset threshold.
     * Onset threshold: mean(flux) + std(flux) * multiplier
     */
    this.fluxHist = new RingBuffer(CONFIG.AUDIO.ONSET.FLUX_HISTORY_FRAMES);

    /** Timestamp (ms) of last onset event; used for refractory behavior. */
    this.lastOnsetMs = 0;

    /**
     * Beat interval history (ms between detected onsets), used to estimate BPM.
     * Stored as a ring to keep bounded memory and stable dynamics.
     */
    this.intervalsMs = new RingBuffer(CONFIG.AUDIO.BPM.INTERVAL_HISTORY);

    /** Current BPM estimate (smoothed). */
    this.bpm = CONFIG.AUDIO.IDLE_DEMO.BASE_BPM;

    /**
     * Cached mapping from frequency bands (Hz ranges) to analyser bin indices.
     * Rebuilt if FFT bin count changes.
     */
    this.bandMap = null;

    /**
     * PERF / ALLOCATION AVOIDANCE:
     * We normalize analyser bins (Uint8Array 0..255) into Float32 0..1 buffers.
     * For spectral flux we need a stable “previous master spectrum” buffer,
     * so master uses a double-buffer swap each frame.
     */
    this._masterNormWrite = null; // Float32Array (current frame write target)
    this._masterNormPrev = null;  // Float32Array (previous frame)
    this._leftNorm = null;        // Float32Array
    this._rightNorm = null;       // Float32Array
  }

  /* =========================
   * Internal: buffer handling
   * ========================= */

  /**
   * Ensure normalization buffers exist and match the analyser bin lengths.
   * @param {number} masterLen
   * @param {number} leftLen
   * @param {number} rightLen
   */
  _ensureNormBuffers(masterLen, leftLen, rightLen) {
    // Master: double buffer for flux comparisons
    if (!this._masterNormWrite || this._masterNormWrite.length !== masterLen) {
      this._masterNormWrite = new Float32Array(masterLen);
      this._masterNormPrev = new Float32Array(masterLen);

      // On first allocation (or FFT size change), previous spectrum is effectively “silence”.
      for (let i = 0; i < masterLen; i++) this._masterNormPrev[i] = 0;
    }

    if (!this._leftNorm || this._leftNorm.length !== leftLen) {
      this._leftNorm = new Float32Array(leftLen);
    }

    if (!this._rightNorm || this._rightNorm.length !== rightLen) {
      this._rightNorm = new Float32Array(rightLen);
    }
  }

  /**
   * Normalize Uint8 analyser bins (0..255) into Float32 (0..1).
   * @param {Float32Array} out
   * @param {Uint8Array} bins
   */
  _fillNorm(out, bins) {
    for (let i = 0; i < bins.length; i++) out[i] = bins[i] / 255;
  }

  /* =========================
   * Internal: band mapping
   * ========================= */

  /**
   * Build a mapping from Hz band ranges to analyser bin index ranges.
   * @param {number} binCount - number of frequency bins (analyser.frequencyBinCount)
   * @param {number} sampleRate
   */
  _buildBandMap(binCount, sampleRate) {
    // Nyquist frequency is half the sample rate.
    const nyquist = sampleRate / 2;

    // Approx Hz represented by a single bin index.
    const binHz = nyquist / binCount;

    // Convert each band’s Hz range into [start,end) bin indices.
    const map = CONFIG.AUDIO.BANDS_HZ.map((b) => {
      const from = clamp(b.from, 0, nyquist);
      const to = clamp(b.to, 0, nyquist);

      // Start bin inclusive, end bin exclusive.
      const start = clamp(Math.floor(from / binHz), 0, binCount - 1);
      const end = clamp(Math.ceil(to / binHz), start + 1, binCount);

      return { name: b.name, start, end };
    });

    return { binHz, nyquist, map };
  }

  /**
   * Average energy of a normalized spectrum in a bin range.
   * @param {Float32Array} normBins
   * @param {number} start
   * @param {number} end
   */
  _bandEnergy(normBins, start, end) {
    let sum = 0;
    const n = Math.max(1, end - start);
    for (let i = start; i < end; i++) sum += normBins[i];
    return sum / n;
  }

  /* =========================
   * Internal: spectral features
   * ========================= */

  /**
   * Spectral centroid — “brightness” proxy:
   * Higher centroid => more high-frequency energy.
   * Returns Hz.
   * @param {Float32Array} normBins
   * @param {number} binHz
   */
  _spectralCentroid(normBins, binHz) {
    let num = 0;
    let den = 0;

    for (let i = 0; i < normBins.length; i++) {
      const m = normBins[i];
      const f = i * binHz;
      num += f * m;
      den += m;
    }

    return den > 0 ? num / den : 0;
  }

  /**
   * Spectral flux — measure of positive spectral change between frames.
   * Only positive deltas are counted, giving a robust “attack” detector.
   * @param {Float32Array} normBins
   * @param {Float32Array} prev
   */
  _spectralFlux(normBins, prev) {
    if (!prev) return 0;

    let flux = 0;
    const n = Math.min(normBins.length, prev.length);

    for (let i = 0; i < n; i++) {
      const d = normBins[i] - prev[i];
      if (d > 0) flux += d;
    }

    return flux;
  }

  /* =========================
   * Internal: onset + BPM
   * ========================= */

  /**
   * Detect onset using a dynamic threshold built from flux history.
   * Applies a refractory window to avoid multiple triggers per beat.
   * @param {number} flux
   * @param {number} tMs - time in milliseconds (performance.now())
   */
  _detectOnset(flux, tMs) {
    this.fluxHist.push(flux);

    const mean = this.fluxHist.mean();
    const std = this.fluxHist.std();

    const threshold = mean + std * CONFIG.AUDIO.ONSET.THRESHOLD_MULTIPLIER;

    const refractoryOk =
      (tMs - this.lastOnsetMs) > CONFIG.AUDIO.ONSET.REFRACTORY_MS;

    const onset = refractoryOk && flux > threshold;

    if (onset) {
      // Store interval for BPM estimation
      if (this.lastOnsetMs > 0) this.intervalsMs.push(tMs - this.lastOnsetMs);
      this.lastOnsetMs = tMs;
    }

    return { onset };
  }

  /**
   * Update BPM estimate from recent intervals using a median (robust to outliers),
   * then smooth it via EMA.
   */
  _updateBpm() {
    const arr = this.intervalsMs.toArray().filter((x) => x > 0);
    if (arr.length < 2) return this.bpm;

    // Median interval (ms)
    arr.sort((a, b) => a - b);
    const mid = (arr.length / 2) | 0;
    const medMs = arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;

    // Convert to BPM, clamp to configured limits
    const detected = clamp(60000 / medMs, CONFIG.AUDIO.BPM.MIN, CONFIG.AUDIO.BPM.MAX);

    // Smooth using EMA
    this.bpm =
      this.bpm * (1 - CONFIG.AUDIO.BPM.SMOOTHING) +
      detected * CONFIG.AUDIO.BPM.SMOOTHING;

    return this.bpm;
  }

  /* =========================
   * Public API
   * ========================= */

  /**
   * Compute audio features for this frame.
   *
   * @param {null|{master:Uint8Array,left:Uint8Array,right:Uint8Array,sampleRate:number}} audioSample
   * @param {number} visualTimeSec - visual timeline seconds (used for idle demo synthesis)
   * @param {number} tMs - time in milliseconds (performance.now())
   */
  sample(audioSample, visualTimeSec, tMs) {
    /* ----------------------------
     * No audio: idle demo synthesis
     * ---------------------------- */
    if (!audioSample) {
      if (!CONFIG.AUDIO.IDLE_DEMO.ENABLED) {
        return {
          bands: {},
          bass: 0,
          brightness: 0,
          flux: 0,
          onset: false,
          bpm: this.bpm,
          stereo: { L: 0, R: 0, mid: 0, side: 0, lrDiff: 0 },
        };
      }

      // Simple synthesized “music-like” features so the scene animates in idle mode.
      const t = visualTimeSec;
      const wob = CONFIG.AUDIO.IDLE_DEMO.WOBBLE_HZ;

      const bass = clamp(
        0.14 +
          0.10 * S(t * (wob * 2 * PI)) +
          0.05 * S(t * 2.2),
        0,
        1
      );

      const bright = clamp(
        0.10 + 0.08 * S(t * 1.1 + 1.3),
        0,
        1
      );

      // Demo BPM gently wobbles (keeps HUD alive, matches “music” feel).
      this.bpm = CONFIG.AUDIO.IDLE_DEMO.BASE_BPM + 10 * S(t * wob);

      return {
        bands: {
          sub: bass * 0.6,
          bass,
          lowMid: bass * 0.5,
          highMid: bright * 0.7,
          treble: bright,
        },
        bass,
        brightness: bright,
        flux: 0,
        onset: false,
        bpm: this.bpm,
        stereo: { L: bass * 0.9, R: bass * 0.9, mid: bass, side: 0, lrDiff: 0 },
      };
    }

    /* ----------------------------------------
     * Audio active: normalize bins + compute
     * ---------------------------------------- */

    // Ensure normalization buffers match analyser output sizes.
    this._ensureNormBuffers(
      audioSample.master.length,
      audioSample.left.length,
      audioSample.right.length
    );

    // Normalize to 0..1 floats.
    this._fillNorm(this._masterNormWrite, audioSample.master);
    this._fillNorm(this._leftNorm, audioSample.left);
    this._fillNorm(this._rightNorm, audioSample.right);

    // (Re)build band map if missing or inconsistent with current FFT size.
    if (
      !this.bandMap ||
      this.bandMap.map.length === 0 ||
      this.bandMap.map[this.bandMap.map.length - 1].end > this._masterNormWrite.length
    ) {
      this.bandMap = this._buildBandMap(this._masterNormWrite.length, audioSample.sampleRate);
    }

    // Compute named band energies from master spectrum.
    const bands = {};
    for (const b of this.bandMap.map) {
      bands[b.name] = this._bandEnergy(this._masterNormWrite, b.start, b.end);
    }

    // Convenience band outputs used heavily in the scene mapping.
    const bass = bands.bass ?? 0;

    // Brightness as normalized centroid (0..1).
    const centroidHz = this._spectralCentroid(this._masterNormWrite, this.bandMap.binHz);
    const brightness = clamp(centroidHz / this.bandMap.nyquist, 0, 1);

    // Spectral flux for onset.
    const flux = this._spectralFlux(this._masterNormWrite, this._masterNormPrev);

    // Swap master buffers so prev stays stable for next frame.
    const tmp = this._masterNormPrev;
    this._masterNormPrev = this._masterNormWrite;
    this._masterNormWrite = tmp;

    // Onset detection + BPM update.
    const { onset } = this._detectOnset(flux, tMs);
    const bpm = this._updateBpm();

    /* ----------------------------
     * Stereo metrics
     * ---------------------------- */

    // Average energy per channel (broadband).
    const L = this._bandEnergy(this._leftNorm, 0, this._leftNorm.length);
    const R = this._bandEnergy(this._rightNorm, 0, this._rightNorm.length);

    // Mid/Side derived (simple, stable):
    const mid = (L + R) / 2;
    const side = Math.abs(L - R) / 2;

    // Signed difference (clamped) useful for biasing orbit, hue, etc.
    const lrDiff = clamp(L - R, -1, 1);

    return {
      bands,
      bass,
      brightness,
      flux,
      onset,
      bpm,
      stereo: { L, R, mid, side, lrDiff },
    };
  }
}
