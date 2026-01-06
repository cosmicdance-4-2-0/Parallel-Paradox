export class Controls {
  constructor(initialTunables) {
    this.tunables = { ...initialTunables };
    this.onChange = null;
    this.elements = {
      pathB: document.getElementById("pathB"),
      forgive: document.getElementById("forgive"),
      cross: document.getElementById("cross"),
      bias: document.getElementById("bias"),
      memory: document.getElementById("memory"),
      noise: document.getElementById("noise"),
      values: {},
      state: document.getElementById("state"),
      fps: document.getElementById("fps"),
      energy: document.getElementById("energy"),
      coherence: document.getElementById("coherence"),
      biasReadout: document.getElementById("bias-readout"),
      start: document.getElementById("start-btn"),
      reset: document.getElementById("reset-btn"),
      pulse: document.getElementById("pulse-btn"),
    };
    document.querySelectorAll(".control .value").forEach((el) => {
      this.elements.values[el.dataset.for] = el;
    });
    this.bind();
  }

  idForKey(key) {
    switch (key) {
      case "pathBWeight":
        return "pathB";
      case "forgiveness":
        return "forgive";
      case "crossTalk":
        return "cross";
      case "biasStrength":
        return "bias";
      case "memoryBlend":
        return "memory";
      default:
        return key;
    }
  }

  keyForId(id) {
    switch (id) {
      case "pathB":
        return "pathBWeight";
      case "forgive":
        return "forgiveness";
      case "cross":
        return "crossTalk";
      case "bias":
        return "biasStrength";
      case "memory":
        return "memoryBlend";
      default:
        return id;
    }
  }

  bind() {
    Object.entries(this.tunables).forEach(([key, value]) => {
      const id = this.idForKey(key);
      const el = this.elements[id];
      if (el) {
        el.value = value;
        this.updateValueLabel(el.id, value);
        el.addEventListener("input", () => {
          this.handleChange(el.id, parseFloat(el.value));
        });
      }
    });
  }

  handleChange(id, value) {
    const key = this.keyForId(id);
    this.tunables[key] = value;

    this.updateValueLabel(id, value);
    if (this.onChange) this.onChange({ ...this.tunables });
  }

  updateValueLabel(id, value) {
    const key = this.keyForId(id);
    const label = this.elements.values[key] || this.elements.values[id];
    if (label) label.textContent = value.toFixed(2);
  }

  setHandlers({ onStart, onReset, onPulse, onChange }) {
    this.onChange = onChange;
    this.elements.start.addEventListener("click", onStart);
    this.elements.reset.addEventListener("click", onReset);
    this.elements.pulse.addEventListener("click", onPulse);
    window.addEventListener("keydown", (ev) => {
      if (ev.code === "Space") {
        ev.preventDefault();
        onStart();
      }
    });
  }

  setState(text) {
    this.elements.state.textContent = text;
  }

  updateStats({ fps, energy, coherence, bias }) {
    this.elements.fps.textContent = fps.toFixed(1);
    this.elements.energy.textContent = energy.toFixed(3);
    this.elements.coherence.textContent = coherence.toFixed(3);
    this.elements.biasReadout.textContent = bias.toFixed(3);
  }
}
