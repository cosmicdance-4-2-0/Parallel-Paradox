// Control panel for PhaseCube Delta (DeltaID: A6P9Q4)
// Provides sliders for noise, coupling, and lens weights.

export class ControlPanel {
  constructor(container, config, onChange) {
    this.container = container;
    this.config = config;
    this.onChange = onChange;
    this._build();
  }

  _build() {
    this.container.innerHTML = `
      <div class="control-block">
        <label>Noise<input id="noise" type="range" min="0" max="0.08" step="0.001" value="${this.config.flipProbability}" /></label>
        <label>Cross<input id="cross" type="range" min="0" max="0.4" step="0.01" value="${this.config.coupling.cross}" /></label>
        <label>Delay<input id="delay" type="range" min="0" max="0.8" step="0.01" value="${this.config.delay.gain}" /></label>
      </div>
      <div class="control-block">
        <label>Human<input id="human" type="range" min="0" max="1" step="0.01" value="${this.config.lenses.human}" /></label>
        <label>Predictive<input id="predictive" type="range" min="0" max="1" step="0.01" value="${this.config.lenses.predictive}" /></label>
        <label>Systemic<input id="systemic" type="range" min="0" max="1" step="0.01" value="${this.config.lenses.systemic}" /></label>
        <label>Harmonic<input id="harmonic" type="range" min="0" max="1" step="0.01" value="${this.config.lenses.harmonic}" /></label>
      </div>
    `;

    const bind = (id, handler) => {
      const el = this.container.querySelector(`#${id}`);
      el.addEventListener('input', () => handler(parseFloat(el.value)));
    };

    bind('noise', (v) => this.onChange({ flipProbability: v }));
    bind('cross', (v) => this.onChange({ coupling: { ...this.config.coupling, cross: v, echoToCore: v, scoutToCore: v * 0.6 } }));
    bind('delay', (v) => this.onChange({ delay: { ...this.config.delay, gain: v } }));

    bind('human', (v) => this.onChange({ lenses: { ...this.config.lenses, human: v } }));
    bind('predictive', (v) => this.onChange({ lenses: { ...this.config.lenses, predictive: v } }));
    bind('systemic', (v) => this.onChange({ lenses: { ...this.config.lenses, systemic: v } }));
    bind('harmonic', (v) => this.onChange({ lenses: { ...this.config.lenses, harmonic: v } }));
  }
}
