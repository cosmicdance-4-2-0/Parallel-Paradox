import { CONFIG } from './config.js';

export class Controls {
  constructor() {
    this.elements = {
      start: document.getElementById('start'),
      mic: document.getElementById('mic'),
      pause: document.getElementById('pause'),
      snapshot: document.getElementById('snapshot'),
      biasWeight: document.getElementById('biasWeight'),
      forgiveness: document.getElementById('forgiveness'),
      trace: document.getElementById('trace'),
      status: document.getElementById('status-log'),
    };

    // Initialize slider defaults.
    this.elements.biasWeight.value = CONFIG.bias.weight;
    this.elements.forgiveness.value = CONFIG.harmonic.forgivenessStrength;
    this.elements.trace.value = CONFIG.trace.depth;

    this._bindKeyboard();
  }

  onStart(cb) {
    this.elements.start.addEventListener('click', cb);
  }

  onMic(cb) {
    this.elements.mic.addEventListener('click', cb);
  }

  onPause(cb) {
    this.elements.pause.addEventListener('click', cb);
  }

  onSnapshot(cb) {
    this.elements.snapshot.addEventListener('click', cb);
  }

  onBiasWeight(cb) {
    this.elements.biasWeight.addEventListener('input', (e) => cb(Number(e.target.value)));
  }

  onForgiveness(cb) {
    this.elements.forgiveness.addEventListener('input', (e) => cb(Number(e.target.value)));
  }

  onTrace(cb) {
    this.elements.trace.addEventListener('input', (e) => cb(Number(e.target.value)));
  }

  setStatus(message) {
    this.elements.status.textContent = message;
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.elements.pause.click();
      }
      if (e.key.toLowerCase() === 's') {
        this.elements.snapshot.click();
      }
    });
  }
}

// TODO: Add debug toggles for overlays (bias field, trace heatmap) without cluttering the main UI.
