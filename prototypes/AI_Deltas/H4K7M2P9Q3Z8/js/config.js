export const DeltaID = 'H4K7M2P9Q3Z8';

// Tunables: modest defaults keep dual grids performant while leaving headroom for exploration.
export const config = {
  gridSize: 12,
  fpsTarget: 60,
  view: {
    spinRate: 0.12,
    pointSize: 4.5,
    fog: 0.65,
    depth: 540,
  },
  colors: {
    gridA: '#7be0ff',
    gridB: '#ffa8ff',
    base: '#d6e2f2',
  },
  input: {
    strength: 0.16,
    decay: 0.925,
    radius: 3.0,
    stereoDrift: 0.35,
  },
  swarm: {
    flipProbability: 0.012,
    parityProbability: 0.006,
    pathBWeight: 0.64,
    alpha: 0.18,
    forgiveness: 0.55,
    noise: 0.025,
  },
  coupling: {
    shadowWeight: 0.32,
    memoryWeight: 0.24,
  },
  memory: {
    depth: 4,
    traceWeight: 0.35,
  },
};
