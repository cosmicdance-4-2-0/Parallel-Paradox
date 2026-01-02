// Controller coordinates simulation ticks, input ingestion, and rendering.
export function createController({ renderer, grid, inputField, audio, config }) {
  const state = { time: 0, last: 0, paused: false, sampler: null };

  async function switchDriver(mode) {
    state.sampler = await audio.switchMode(mode);
  }

  function tick(now = 0) {
    const delta = now - state.last;
    state.last = now;
    if (!state.paused) {
      state.time += delta / 1000;
      const sample = state.sampler ? state.sampler() : null;
      if (sample) inputField.ingest(sample.left, sample.right);
      grid.perturb(sample ? inputField.bias : null);
      grid.step(sample ? inputField.bias : null);
    }
    renderer.draw({
      positions: grid.positions,
      plasma: grid.plasma,
      liquid: grid.liquid,
      parity: grid.parity,
      time: state.time,
    });
    requestAnimationFrame(tick);
  }

  function togglePause() { state.paused = !state.paused; }

  function start() {
    // Default to idle driver so the sim runs even without mic permissions.
    switchDriver('idle');
    // TODO: add backpressure via FPS_TARGET if needed.
    requestAnimationFrame((t) => { state.last = t; tick(t); });
  }

  return { start, togglePause, switchDriver, state };
}
