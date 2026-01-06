/*
File: js/audioengine.js
Purpose: Web Audio input + analysis — mic/file routing, analysers (master/L/R), and audio↔visual time alignment.
*/

import { CONFIG } from "./config.js";

export class AudioEngine {
  constructor() {
    /** @type {AudioContext|null} Web Audio context (created lazily on first user gesture). */
    this.audioCtx = null;

    /**
     * @type {AudioNode|null}
     * Current graph entry node we analyse (either MediaStreamSource or MediaElementSource).
     */
    this.sourceNode = null;

    /**
     * @type {MediaElementAudioSourceNode|null}
     * Cached MediaElementSource for the <audio> element.
     * NOTE: A given HTMLMediaElement can only have ONE MediaElementSourceNode per AudioContext.
     */
    this.mediaSource = null;

    /** @type {GainNode|null} Output gain for file playback (mic is not routed to speakers here). */
    this.outputGain = null;

    /** @type {AnalyserNode|null} Full mix analyser (master spectrum). */
    this.masterAnalyser = null;

    /** @type {AnalyserNode|null} Left channel analyser. */
    this.leftAnalyser = null;

    /** @type {AnalyserNode|null} Right channel analyser. */
    this.rightAnalyser = null;

    /** @type {Uint8Array|null} Byte frequency bins for master. */
    this.masterBins = null;

    /** @type {Uint8Array|null} Byte frequency bins for left. */
    this.leftBins = null;

    /** @type {Uint8Array|null} Byte frequency bins for right. */
    this.rightBins = null;

    /**
     * Mode helps UI/HUD and orchestration.
     * - "idle": demo mode (no audio input)
     * - "mic": microphone input (analysed only)
     * - "file": audio element file playback (analysed + routed to speakers)
     */
    this.mode = "idle";

    /** @type {MediaStream|null} Active mic stream (so we can stop tracks). */
    this.micStream = null;

    /**
     * Time alignment:
     * We want a stable “visual time” and a stable “audio time.”
     * When audio starts, we compute an offset so that:
     *   audioTime ≈ audioCtx.currentTime + audioTimeOffset
     * and audioTime matches the visual timeline at the moment we start playback/capture.
     */
    this.audioTimeOffset = 0;
    this._offsetInitialized = false;
  }

  /**
   * Ensure AudioContext exists and is running.
   * Must be called from a user gesture (click/input) in most browsers.
   */
  ensureContext() {
    if (this.audioCtx) return this.audioCtx;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("Web Audio not supported.");

    this.audioCtx = new AC();

    // Some browsers start suspended; resume() is safe to call and returns a Promise.
    this.audioCtx.resume?.();

    return this.audioCtx;
  }

  /**
   * Build analyser nodes and connect them to the current sourceNode.
   * Layout:
   *   sourceNode -> masterAnalyser
   *   sourceNode -> splitter -> leftAnalyser/rightAnalyser
   */
  _buildAnalysers() {
    const ac = this.audioCtx;

    // Master analyser (full spectrum)
    this.masterAnalyser = ac.createAnalyser();
    this.masterAnalyser.fftSize = CONFIG.AUDIO.MASTER_FFT_SIZE;
    this.masterAnalyser.smoothingTimeConstant = CONFIG.AUDIO.SMOOTHING_TIME_CONSTANT;
    this.masterBins = new Uint8Array(this.masterAnalyser.frequencyBinCount);

    // Channel split (stereo)
    const splitter = ac.createChannelSplitter(2);

    this.leftAnalyser = ac.createAnalyser();
    this.rightAnalyser = ac.createAnalyser();

    this.leftAnalyser.fftSize = this.rightAnalyser.fftSize = CONFIG.AUDIO.CHANNEL_FFT_SIZE;
    this.leftAnalyser.smoothingTimeConstant =
      this.rightAnalyser.smoothingTimeConstant =
        CONFIG.AUDIO.SMOOTHING_TIME_CONSTANT;

    this.leftBins = new Uint8Array(this.leftAnalyser.frequencyBinCount);
    this.rightBins = new Uint8Array(this.rightAnalyser.frequencyBinCount);

    // Wire it up
    this.sourceNode.connect(this.masterAnalyser);
    this.sourceNode.connect(splitter);
    splitter.connect(this.leftAnalyser, 0);
    splitter.connect(this.rightAnalyser, 1);
  }

  /**
   * Establish audio↔visual clock offset at start time.
   * @param {number} visualTimeSec - caller's visual timeline time (seconds).
   */
  _resetTimeOffset(visualTimeSec) {
    this.audioTimeOffset = visualTimeSec - (this.audioCtx?.currentTime || 0);
    this._offsetInitialized = true;
  }

  /**
   * Stop any active audio input and tear down analysis graph.
   * Safe to call repeatedly.
   */
  stop() {
    // Disconnect graph nodes (ignore errors; nodes may already be disconnected)
    try { this.sourceNode?.disconnect(); } catch {}
    try { this.outputGain?.disconnect(); } catch {}

    // Stop microphone tracks if present
    if (this.micStream) {
      try { this.micStream.getTracks().forEach((tr) => tr.stop()); } catch {}
      this.micStream = null;
    }

    // Clear references (GC-friendly)
    this.sourceNode = null;
    this.masterAnalyser = null;
    this.leftAnalyser = null;
    this.rightAnalyser = null;
    this.outputGain = null;

    this.masterBins = null;
    this.leftBins = null;
    this.rightBins = null;

    this.mode = "idle";
    this._offsetInitialized = false;
  }

  /**
   * Start microphone capture and analysis.
   * NOTE: Mic requires https:// or http://localhost (secure context).
   * @param {number} visualTimeSec - visual timeline time in seconds
   */
  async startMic(visualTimeSec) {
    if (!window.isSecureContext) {
      throw new Error(
        "Mic requires a secure origin (https:// or http://localhost). file:// will not work."
      );
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("getUserMedia not available.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ac = this.ensureContext();

    // Clear any previous mode/source
    this.stop();

    this.micStream = stream;

    // MediaStreamSource provides an AudioNode entry point
    this.sourceNode = ac.createMediaStreamSource(stream);

    // Build analysers off this source
    this._buildAnalysers();

    this.mode = "mic";
    this._resetTimeOffset(visualTimeSec);
  }

  /**
   * Start file playback via an HTMLAudioElement and analyse it.
   * @param {HTMLAudioElement} audioEl - persistent audio element (not in DOM is fine)
   * @param {File} file - audio file selected by user
   * @param {number} visualTimeSec - visual timeline time in seconds
   */
  async startFile(audioEl, file, visualTimeSec) {
    const ac = this.ensureContext();

    // Clear previous mode/source (also disconnects old graph)
    this.stop();

    // Revoke any previous object URL to avoid memory leaks
    if (audioEl._objUrl) {
      try { URL.revokeObjectURL(audioEl._objUrl); } catch {}
    }

    // Assign new file
    audioEl._objUrl = URL.createObjectURL(file);
    audioEl.src = audioEl._objUrl;

    // Start playback (may throw if not allowed; caller handles)
    await audioEl.play();

    // IMPORTANT:
    // You can only create a MediaElementSource ONCE per audio element per AudioContext.
    // So we cache it.
    if (!this.mediaSource) {
      this.mediaSource = ac.createMediaElementSource(audioEl);
    }
    this.sourceNode = this.mediaSource;

    // Route file audio to speakers through a gain node
    this.outputGain = ac.createGain();
    this.outputGain.gain.value = CONFIG.AUDIO.OUTPUT_GAIN;

    this.sourceNode.connect(this.outputGain);
    this.outputGain.connect(ac.destination);

    // Build analysers (also connected from sourceNode)
    this._buildAnalysers();

    this.mode = "file";
    this._resetTimeOffset(visualTimeSec);
  }

  /**
   * Sample analysers for this frame.
   * @returns {null|{master:Uint8Array,left:Uint8Array,right:Uint8Array,sampleRate:number}}
   */
  sample() {
    if (!this.masterAnalyser || !this.leftAnalyser || !this.rightAnalyser) return null;

    this.masterAnalyser.getByteFrequencyData(this.masterBins);
    this.leftAnalyser.getByteFrequencyData(this.leftBins);
    this.rightAnalyser.getByteFrequencyData(this.rightBins);

    return {
      master: this.masterBins,
      left: this.leftBins,
      right: this.rightBins,
      sampleRate: this.audioCtx.sampleRate,
    };
  }

  /**
   * Convert current audio clock to a stable “scene time”.
   * If no audio clock is active, fall back to visual timeline time.
   * @param {number} visualTimeSec
   */
  timeSeconds(visualTimeSec) {
    if (!this.audioCtx || !this._offsetInitialized) return visualTimeSec;
    return this.audioCtx.currentTime + this.audioTimeOffset;
  }
}
