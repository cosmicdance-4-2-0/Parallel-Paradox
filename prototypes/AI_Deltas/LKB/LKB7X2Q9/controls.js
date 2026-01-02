import { baseConfig, DeltaID } from "./config.js";

export class Controls {
  constructor() {
    this.elements = this._bind();
    this.listeners = [];
    this.values = {
      noise: baseConfig.plasmaFlip,
      pathBias: baseConfig.basePathBias,
      biasGain: baseConfig.bias.gain,
      echoBlend: baseConfig.echoBlend,
      lens: { human: 1, predictive: 1, systemic: 1, harmonic: 1 },
    };
    this._syncUI();
    this._wire();
  }

  _bind() {
    return {
      noise: document.getElementById("noise"),
      pathBias: document.getElementById("pathBias"),
      biasGain: document.getElementById("biasGain"),
      echoBlend: document.getElementById("echoBlend"),
      human: document.getElementById("human"),
      predictive: document.getElementById("predictive"),
      systemic: document.getElementById("systemic"),
      harmonic: document.getElementById("harmonic"),
      reset: document.getElementById("reset"),
      delta: document.getElementById("delta"),
    };
  }

  _syncUI() {
    this.elements.noise.value = this.values.noise;
    this.elements.pathBias.value = this.values.pathBias;
    this.elements.biasGain.value = this.values.biasGain;
    this.elements.echoBlend.value = this.values.echoBlend;
    this.elements.human.value = this.values.lens.human;
    this.elements.predictive.value = this.values.lens.predictive;
    this.elements.systemic.value = this.values.lens.systemic;
    this.elements.harmonic.value = this.values.lens.harmonic;
    this.elements.delta.textContent = `Delta ${DeltaID}`;
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  _emit() {
    const state = {
      noise: parseFloat(this.elements.noise.value),
      pathBias: parseFloat(this.elements.pathBias.value),
      biasGain: parseFloat(this.elements.biasGain.value),
      echoBlend: parseFloat(this.elements.echoBlend.value),
      lens: {
        human: parseFloat(this.elements.human.value),
        predictive: parseFloat(this.elements.predictive.value),
        systemic: parseFloat(this.elements.systemic.value),
        harmonic: parseFloat(this.elements.harmonic.value),
      },
    };
    this.values = state;
    this.listeners.forEach((cb) => cb(state));
  }

  _wire() {
    const sliders = [
      this.elements.noise,
      this.elements.pathBias,
      this.elements.biasGain,
      this.elements.echoBlend,
      this.elements.human,
      this.elements.predictive,
      this.elements.systemic,
      this.elements.harmonic,
    ];

    sliders.forEach((el) => {
      el.addEventListener("input", () => this._emit());
    });

    this.elements.reset.addEventListener("click", () => {
      this.listeners.forEach((cb) => cb({ ...this.values, reset: true }));
    });
  }
}
