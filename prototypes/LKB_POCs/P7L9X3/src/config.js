// DeltaID: P7L9X3 — shared tunables live here for clarity and experiment reproducibility.
export const config = {
  GRID: 16,
  SCALE: 26,
  POINT_SIZE: 4.5,
  FLIP_P: 0.015,
  PARITY_P: 0.006,
  BASE_PATH_B_P: 0.7,
  ALPHA: 0.18,
  FORGIVENESS: 0.4, // harmonic damping when dispersion spikes
  INPUT_DECAY: 0.93,
  INPUT_STRENGTH: 0.09,
  INPUT_RADIUS: 3,
  BIN_COUNT: 48,
  FFT_SIZE: 2048,
  FPS_TARGET: 60,
  VIS_THRESHOLD: 0.012,
  DREAM_JITTER: 0.004,
  CANVAS: { fov: Math.PI / 4, cameraZ: 420 },
};

// Lens presets map the four-lens framing into Path A/B weights.
export const lensPresets = {
  balanced: { basePathB: 0.7, forgiveness: 0.4 },
  human: { basePathB: 0.62, forgiveness: 0.52 },
  predictive: { basePathB: 0.8, forgiveness: 0.32 },
  systemic: { basePathB: 0.74, forgiveness: 0.42 },
  harmonic: { basePathB: 0.68, forgiveness: 0.65 },
};

export function applyLensPreset(cfg, preset) {
  if (!preset) return;
  cfg.BASE_PATH_B_P = preset.basePathB;
  cfg.FORGIVENESS = preset.forgiveness;
}
