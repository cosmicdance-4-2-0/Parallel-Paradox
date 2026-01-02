export const DeltaID = '98E66S';

// Tunables gathered here for quick experiments.
export const config = {
  gridSize: 14,
  pointSize: 4,
  spinRate: 0.15,
  fpsTarget: 60,
  colors: {
    plasma: '#8cf6a5',
    liquid: '#5ed1ff',
    solid: '#f6c177',
    parity: '#ff8caa',
  },
  input: {
    strength: 0.12,
    decay: 0.93,
    radius: 3.25,
  },
  swarm: {
    flipProbability: 0.016,
    parityProbability: 0.006,
    pathBWeight: 0.7,
    alpha: 0.16,
    forgiveness: 0.5, // TODO: expose a per-cell forgiveness field for uneven damping.
  },
};
