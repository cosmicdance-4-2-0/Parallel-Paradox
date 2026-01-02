export const DeltaID = "H3K9T4Z1Q8P2";

export function createConfig() {
  return {
    GRID: 14, // stays small for readability; TODO: increase with WebGL instancing for scale
    SCALE: 26,
    POINT_SIZE: 4.5,
    NOISE: 0.015, // plasma flip probability
    PARITY_FLIP: 0.006,
    PATH_B_BASE: 0.7,
    DAMPING: 0.18,
    KENOTIC_CLAMP: 0.35, // soft forgiveness when dispersion spikes

    // bias + delay
    INPUT_DECAY: 0.94,
    INPUT_STRENGTH: 0.06,
    DELAY_STRENGTH: 0.4,
    DELAY_FRAMES: 18,
    CROSS_TALK: 0.22,

    // renderer
    FOV: Math.PI / 4,
    CAMERA_Z: 420,
    VIS_THRESHOLD: 0.015,

    // harmonic lens
    HARMONIC_GAIN: 0.45,
  };
}
