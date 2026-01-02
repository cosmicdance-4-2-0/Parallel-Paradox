import { lerp } from "./utils.js";

export const createTrace = (count, fade = 0.9) => ({
  avg: new Float32Array(count),
  fade,
});

export const pushTrace = (trace, source) => {
  const { avg, fade } = trace;
  for (let i = 0; i < avg.length; i++) {
    avg[i] = lerp(source[i], avg[i], fade);
  }
};

export const summarize = (grid) => {
  let energy = 0;
  let variance = 0;
  const { plasma } = grid;
  for (let i = 0; i < grid.count; i++) {
    energy += grid.liquid[i];
    variance += Math.abs(plasma[i] - grid.liquid[i]);
  }
  const norm = grid.count || 1;
  return {
    energy: energy / norm,
    coherence: 1 - Math.min(1, variance / norm),
  };
};

// TODO: Add spectral analysis of trace.avg for frequency-aware overlays, for richer interpretability.
