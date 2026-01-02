import { DeltaID } from "./config.js";

export function buildControls(container, cfg, onChange) {
  container.innerHTML = `
    <div class="row"><label>Noise (plasma flip)</label><input id="noise" type="range" min="0" max="0.05" step="0.001" value="${cfg.NOISE}"></div>
    <div class="row"><label>Cross-talk</label><input id="crosstalk" type="range" min="0" max="0.5" step="0.01" value="${cfg.CROSS_TALK}"></div>
    <div class="row"><label>Delay strength</label><input id="delay" type="range" min="0" max="1" step="0.01" value="${cfg.DELAY_STRENGTH}"></div>
    <div class="row"><label>Harmonic gain</label><input id="harmonic" type="range" min="0" max="1" step="0.01" value="${cfg.HARMONIC_GAIN}"></div>
    <div class="row"><label>Kenotic clamp</label><input id="kenotic" type="range" min="0" max="0.8" step="0.02" value="${cfg.KENOTIC_CLAMP}"></div>
    <div class="row"><label>Path B base</label><input id="pathb" type="range" min="0.45" max="0.95" step="0.01" value="${cfg.PATH_B_BASE}"></div>
    <div class="row" style="grid-template-columns: repeat(2,1fr); gap:6px;">
      <button id="pause">Pause</button>
      <button id="snapshot">Save PNG</button>
    </div>
    <div class="hint">Delta ${DeltaID} · influence-only; TODO: audio ingestion hook.</div>
  `;

  const bind = (id, prop, onValue) => {
    const el = container.querySelector(id);
    el.addEventListener("input", () => {
      cfg[prop] = parseFloat(el.value);
      onValue?.(cfg[prop]);
      onChange();
    });
  };

  bind("#noise", "NOISE");
  bind("#crosstalk", "CROSS_TALK");
  bind("#delay", "DELAY_STRENGTH");
  bind("#harmonic", "HARMONIC_GAIN");
  bind("#kenotic", "KENOTIC_CLAMP");
  bind("#pathb", "PATH_B_BASE");

  return {
    pauseBtn: container.querySelector("#pause"),
    snapshotBtn: container.querySelector("#snapshot"),
  };
}
