export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function makeRangeUpdater(element, target, key, formatter = (v) => v.toFixed(3)) {
  const valueSpan = document.querySelector(`.value[data-for="${element.id}"]`);
  const update = (event) => {
    const parsed = parseFloat(event.target.value);
    target[key] = parsed;
    if (valueSpan) valueSpan.textContent = formatter(parsed);
  };
  element.addEventListener('input', update);
  update({ target: element });
}

// TODO: centralize logging with levels if multiple modules start emitting diagnostic info.
export function logWarn(message, detail) {
  console.warn(`[PhaseCube] ${message}`, detail || '');
}
