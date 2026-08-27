/**
 * audio.js - Sintetizador Procedural de Audio con Web Audio API
 * Genera ronroneos tiernos, campanas de amor, maullidos y vals romántico de victoria.
 */

class RomanticAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isPlayingWaltz = false;
    this.waltzInterval = null;
    this.isUnlocked = false;
  }

  // Inicializar contexto de audio al primer toque/interacción del usuario
  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isUnlocked = true;
    } catch (e) {
      console.warn("Web Audio API no soportado o bloqueado", e);
    }
  }

  ensureUnlocked() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx?.currentTime || 0);
    }
    return !this.isMuted;
  }

  /**
   * Tierno Maullido / Gorjeo Felino (Pitch Glide cálido)
   */
  playMew() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    // Frecuencias para maullido tierno (580Hz -> 820Hz -> 650Hz)
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.32);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Ronroneo de Gatito Feliz (Modulación de baja frecuencia + ruido suave filtrado)
   */
  playPurr(duration = 1.2) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Oscilador de Ronroneo (Frecuencia base ~26Hz)
    osc.type = "triangle";
    osc.frequency.setValueAtTime(26, t);

    // LFO que modula la amplitud a ritmo de respiración felina (~24Hz)
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(24, t);
    lfoGain.gain.setValueAtTime(0.3, t);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    gain.gain.setValueAtTime(0.35, t + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
  }

  /**
   * Campanas Armónicas de Encaje ("Cazar una pieza")
   * Toca un acorde pentatónico celestial con armónicos brillantes.
   */
  playPieceSnapChime(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;

    this.playPurr(0.9);

    const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const t = this.ctx.currentTime;

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.045;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * pitchMultiplier, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.16, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.9);
    });
  }

  /**
   * Campanilla de chispa de amor individual (para fuegos artificiales táctiles)
   */
  playSparkle(frequency = 880) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Melodía de Victoria: Vals Romántico de Caja de Música
   * Progresión romántica (C - Em - F - G - Am - Dm - G - C)
   */
  playVictoryWaltz() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;
    if (this.isPlayingWaltz) return;

    this.isPlayingWaltz = true;

    // Notas de melodía romántica
    const melody = [
      { note: 523.25, dur: 0.4 }, // C5
      { note: 659.25, dur: 0.4 }, // E5
      { note: 783.99, dur: 0.8 }, // G5
      { note: 880.00, dur: 0.4 }, // A5
      { note: 783.99, dur: 0.4 }, // G5
      { note: 659.25, dur: 0.8 }, // E5
      { note: 587.33, dur: 0.4 }, // D5
      { note: 659.25, dur: 0.4 }, // E5
      { note: 698.46, dur: 0.8 }, // F5
      { note: 659.25, dur: 0.4 }, // E5
      { note: 587.33, dur: 0.4 }, // D5
      { note: 523.25, dur: 1.2 }, // C5
      // Segunda frase más alta
      { note: 1046.50, dur: 0.5 }, // C6
      { note: 987.77, dur: 0.5 },  // B5
      { note: 880.00, dur: 0.8 },  // A5
      { note: 783.99, dur: 0.4 },  // G5
      { note: 880.00, dur: 0.4 },  // A5
      { note: 1046.50, dur: 1.6 }  // C6
    ];

    let noteIndex = 0;
    const playNextNote = () => {
      if (!this.isPlayingWaltz || this.isMuted) return;
      
      const current = melody[noteIndex];
      const t = this.ctx.currentTime;

      // Nota Melódica
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(current.note, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + current.dur + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + current.dur + 0.35);

      // Armónico cálido
      const harmOsc = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harmOsc.type = "triangle";
      harmOsc.frequency.setValueAtTime(current.note / 2, t);
      harmGain.gain.setValueAtTime(0.05, t);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, t + current.dur + 0.2);

      harmOsc.connect(harmGain);
      harmGain.connect(this.masterGain);
      harmOsc.start(t);
      harmOsc.stop(t + current.dur + 0.25);

      noteIndex = (noteIndex + 1) % melody.length;
      this.waltzTimeout = setTimeout(playNextNote, current.dur * 750);
    };

    playNextNote();
  }

  stopVictoryWaltz() {
    this.isPlayingWaltz = false;
    if (this.waltzTimeout) {
      clearTimeout(this.waltzTimeout);
      this.waltzTimeout = null;
    }
  }
}

// Instancia global
window.romanticAudio = new RomanticAudioManager();
