/*
File: js/config.js
Purpose: CONFIG object only — single source of truth for all tunables (no hidden numbers).
*/

export const CONFIG = {
  RENDER: {
    // Target FPS is informational here; requestAnimationFrame is still display-driven.
    TARGET_FPS: 60,

    // Cap DPR for performance + consistent “glow” density across devices.
    DPR_MAX: 2,

    // If true: the first frame after init/resize is fully cleared to background.
    // After that, trails are achieved by alpha-fading the previous frame.
    CLEAR_ON_FIRST_FRAME: true,

    // Trail fade amount per frame. Lower = longer trails, higher = shorter trails.
    TRAIL_ALPHA: 0.08,

    // Background color as RGB triplet.
    BACKGROUND_RGB: [0, 0, 0],

    // Composite operation for additive glow-like blending.
    ADDITIVE_BLEND_MODE: "lighter",

    // If true: writes diagnostic text to #panel.
    HUD_ENABLED: true,
  },

  AUDIO: {
    // FFT size for “master” analyser (mono-ish spectrum).
    // Must be power of two; higher = more frequency resolution, more cost.
    MASTER_FFT_SIZE: 1024,

    // FFT size for per-channel analysers.
    CHANNEL_FFT_SIZE: 512,

    // Built-in analyser smoothing (0..1). Higher = smoother, more lag.
    SMOOTHING_TIME_CONSTANT: 0.8,

    // Gain applied to file playback (mic does not go to speakers by default here).
    OUTPUT_GAIN: 0.9,

    // Named frequency bands for feature extraction.
    // from/to in Hz, clamped to [0, nyquist] at runtime.
    BANDS_HZ: [
      { name: "sub",     from: 20,    to: 60 },
      { name: "bass",    from: 60,    to: 180 },
      { name: "lowMid",  from: 180,   to: 600 },
      { name: "highMid", from: 600,   to: 2400 },
      { name: "treble",  from: 2400,  to: 12000 },
    ],

    ONSET: {
      // History window length in frames for flux thresholding.
      FLUX_HISTORY_FRAMES: 120,

      // Onset threshold = mean(flux) + std(flux) * multiplier
      THRESHOLD_MULTIPLIER: 1.6,

      // Minimum time between onsets (prevents chatter).
      REFRACTORY_MS: 220,
    },

    BPM: {
      // Limits for detected BPM
      MIN: 60,
      MAX: 200,

      // History window length for beat intervals.
      INTERVAL_HISTORY: 12,

      // EMA smoothing for BPM estimate (0..1). Higher = slower response.
      SMOOTHING: 0.12,
    },

    IDLE_DEMO: {
      // If true and no audio input is active, features are synthesized (demo mode).
      ENABLED: true,

      // Baseline tempo for demo-mode BPM.
      BASE_BPM: 120,

      // Slow wobble frequency for demo-mode modulation.
      WOBBLE_HZ: 0.35,
    },
  },

  STEREO: {
    // Small epsilon to avoid divide-by-zero when computing width = side/(mid+eps)
    EPS: 1e-6,

    // Orbit speed of left/right satellites around the center.
    ORBIT_PHASE_SPEED: 0.35,

    // Vertical orbit wobble frequency (relative to orbit phase).
    ORBIT_Y_FREQ: 1.12,

    // Vertical orbit amplitude ratio (relative to separation radius).
    ORBIT_Y_RATIO: 0.65,

    // How much to separate L/R based on stereo width estimate.
    SEPARATION_FROM_WIDTH: 480,

    // Extra separation contribution from bass energy.
    SEPARATION_FROM_BASS: 120,

    // Separation clamp minimum (px).
    MIN_SEPARATION: 40,

    // Separation clamp maximum as fraction of min(viewWidth, viewHeight).
    MAX_SEP_FRACTION_OF_MIN_DIM: 0.4,

    // How much extra energy to feed the center sphere.
    CENTER_BOOST_BASE: 1.3,

    // Additional boost when stereo is more mono (width approaches 0).
    CENTER_BOOST_FROM_MONO: 1.5,

    // Color offsets for each sphere instance (degrees in HSL space).
    LEFT_HUE_OFFSET: 0,
    RIGHT_HUE_OFFSET: 120,
    CENTER_HUE_OFFSET: 240,
  },

  SCENE: {
    // Number of agents/quads on the sphere.
    QUAD_COUNT: 16,

    // Base alpha for quad colors.
    QUAD_ALPHA: 0.92,

    // "fixedHSL" yields clean evenly spaced hues; alternate branch uses RGB-ish wave palette.
    COLOR_SPACE: "fixedHSL",

    // Global hue offset for a scene (degrees).
    HUE_OFFSET_DEG: 0,

    SPHERE: {
      // Legacy “absolute” radius (not used directly by current draw, but kept as an explicit knob).
      RADIUS_PX: 420,

      // Depth mapping constants: d = Z*DEPTH_A + DEPTH_B
      DEPTH_A: 0.8,
      DEPTH_B: 1.8,

      // Default screen-space center positioning factors (0..1).
      SCREEN_CENTER_X_FACTOR: 0.5,
      SCREEN_CENTER_Y_FACTOR: 0.5,
    },

    MOTION: {
      // Longitudinal phase speed base (multiplied by audio speed modulation).
      LONGITUDE_SPEED: 1.25,

      // Latitude gain base (multiplied by brightness modulation).
      LATITUDE_GAIN: 1.2,

      // Frequency used inside the latitude wave term.
      LATITUDE_WAVE: 0.33,

      // Spiral shaping: amplitude and speed.
      SPIRAL_AMPLITUDE: 1.8,
      SPIRAL_SPEED: 0.8,

      // Phase range distributed across agents.
      PHASE_PER_AGENT: Math.PI * 2,

      // Per-agent phase stepping inside the spiral function.
      SPIRAL_AGENT_PHASE_STEP: 0.5,
    },

    SIZE: {
      // Base quad size (px) before depth + audio scaling.
      BASE: 10,

      // Additional size driven by bass energy.
      AUDIO_GAIN: 18,
    },

    AUDIO_MAP: {
      // Speed multiplier contribution from bass.
      SPEED_FROM_BASS: 2.2,

      // Latitude gain contribution from brightness.
      LAT_FROM_BRIGHTNESS: 0.35,

      // Sphere scale multiplier contribution from bass.
      SCALE_FROM_BASS: 0.12,

      // Sphere scale base factor relative to min(viewWidth, viewHeight).
      SCALE_BASE_FACTOR: 0.32,
    },
  },

  FACE: {
    // Master toggle for expressive facial features.
    ENABLED: true,

    // How many “eye” elements to draw.
    EYE_COUNT: 2,

    // How many “mouth” elements to draw.
    MOUTH_COUNT: 4,

    // Which band controls eye brightness/size.
    EYE_BRIGHTNESS_BAND: "highMid",

    // Which band controls mouth openness/spread.
    MOUTH_OPEN_BAND: "lowMid",

    // Global scaling of expression response.
    EXPRESSION_GAIN: 1.5,

    // Alpha boost applied to eyes as energy increases.
    EYE_ALPHA_BOOST: 0.5,

    // Mouth spread gain as energy increases.
    MOUTH_SPREAD_GAIN: 1.2,
  },

  RECORDING: {
    // Master toggle for recording feature.
    ENABLED: true,

    // MIME candidates tested in order; first supported is used.
    MIME_CANDIDATES: [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ],

    // captureStream FPS request (best-effort).
    FPS: 60,
  },
};
