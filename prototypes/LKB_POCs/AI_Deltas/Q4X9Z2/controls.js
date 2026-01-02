// UI bindings (DeltaID: Q4X9Z2)
// Keeps the HUD minimal while exposing the most useful tunables.

import { DEFAULT_CONFIG } from './config.js';

export class Controls {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.elements = {};
    this._build();
  }

  _build() {
    const profileOptions = Object.keys(DEFAULT_CONFIG.lensProfiles)
      .map((name) => `<option value="${name}">${name}</option>`)
      .join('');

    this.container.innerHTML = `
      <div class="control-group">
        <label>Lens Profile
          <select id="lensProfile">${profileOptions}</select>
        </label>
      </div>
      <div class="control-group">
        <label>Bias Gain
          <input id="biasGain" type="range" min="0" max="0.8" step="0.01" value="${DEFAULT_CONFIG.bias.gain}" />
        </label>
      </div>
      <div class="control-group">
        <label>Cross-Talk
          <input id="crossTalk" type="range" min="0" max="0.5" step="0.01" value="${DEFAULT_CONFIG.coupling.coreToEcho}" />
        </label>
      </div>
      <div class="control-group">
        <label>Noise
          <input id="noise" type="range" min="0" max="0.08" step="0.001" value="${DEFAULT_CONFIG.noise}" />
        </label>
      </div>
      <div class="control-group">
        <label>Forgiveness
          <input id="forgiveness" type="range" min="0" max="1" step="0.01" value="${DEFAULT_CONFIG.forgiveness.gain}" />
        </label>
      </div>
      <div class="control-group">
        <label>Path B
          <input id="pathB" type="range" min="0" max="1" step="0.01" value="${DEFAULT_CONFIG.pathBProbability}" />
        </label>
      </div>
      <div class="control-row">
        <button id="startBtn">Start</button>
        <button id="pauseBtn">Pause</button>
        <button id="micBtn">Mic Bias</button>
      </div>
    `;

    const hook = (id, handler) => {
      const el = this.container.querySelector(`#${id}`);
      this.elements[id] = el;
      el.addEventListener('input', () => handler(el));
    };

    hook('lensProfile', (el) => this.onChange({ type: 'lensProfile', value: el.value }));
    hook('biasGain', (el) => this.onChange({ type: 'biasGain', value: parseFloat(el.value) }));
    hook('crossTalk', (el) => this.onChange({ type: 'crossTalk', value: parseFloat(el.value) }));
    hook('noise', (el) => this.onChange({ type: 'noise', value: parseFloat(el.value) }));
    hook('forgiveness', (el) => this.onChange({ type: 'forgiveness', value: parseFloat(el.value) }));
    hook('pathB', (el) => this.onChange({ type: 'pathB', value: parseFloat(el.value) }));

    this.container.querySelector('#startBtn').addEventListener('click', () => this.onChange({ type: 'start' }));
    this.container.querySelector('#pauseBtn').addEventListener('click', () => this.onChange({ type: 'pause' }));
    this.container.querySelector('#micBtn').addEventListener('click', () => this.onChange({ type: 'mic' }));
  }

  setProfile(name) {
    const el = this.elements.lensProfile;
    if (!el) return;
    el.value = name;
  }
}
