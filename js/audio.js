/**
 * audio.js - Sintetizador Web Audio API de 7 Sonidos Felinos Distintos
 * Genera maullidos, trinos, ronroneos y carillones en tiempo real sin latencia ni archivos externos.
 */

class RomanticAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.soundCounter = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  /**
   * 7 Sonidos Distintos de Gatitos para cada pieza encajada
   */
  playKittenSnapSound(customIndex = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const index = (customIndex !== null) ? (customIndex % 7) : (this.soundCounter++ % 7);

    switch (index) {
      case 0:
        this.sound1_SweetMeow();        // 1. Miau Clásico y Tierno
        break;
      case 1:
        this.sound2_KittenSqueak();      // 2. Miau Corto de Gatito Bebé
        break;
      case 2:
        this.sound3_PurrTrill();         // 3. Trino con Ronroneo (Prrr-Mew)
        break;
      case 3:
        this.sound4_CuriousMew();        // 4. Miau Curioso Ascendente
        break;
      case 4:
        this.sound5_SingingChimeMew();   // 5. Miau Cantarín Armónico
        break;
      case 5:
        this.sound6_HappyChirrup();      // 6. Chirrup de Saludo (Brrrpt!)
        break;
      case 6:
        this.sound7_SoftAffectionMurmur(); // 7. Murmullo y Beso Felino
        break;
    }

    // Acompañar con campanita de cristal mágica
    this.playSnapChimeHarmonic();
  }

  // 1. Miau Clásico y Tierno (Frecuencia natural felina)
  sound1_SweetMeow() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.37);
  }

  // 2. Miau Corto de Gatito Bebé (Agudo y pícaro)
  sound2_KittenSqueak() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1150, t + 0.07);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.22);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // 3. Trino con Ronroneo (Prrr-Mew)
  sound3_PurrTrill() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(680, t + 0.15);
    osc.frequency.linearRampToValueAtTime(520, t + 0.32);

    // Modulación de ronroneo a 28 Hz
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(28, t);
    lfoGain.gain.setValueAtTime(60, t);

    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.33);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.33);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.34);
  }

  // 4. Miau Curioso Ascendente
  sound4_CuriousMew() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(940, t + 0.28); // Sube al final preguntando

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.31);
  }

  // 5. Miau Cantarín Armónico (Arpegio doble)
  sound5_SingingChimeMew() {
    const t = this.ctx.currentTime;
    [659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + idx * 0.04 + 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + idx * 0.04 + 0.26);

      gain.gain.setValueAtTime(0, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.14, t + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.29);
    });
  }

  // 6. Chirrup de Saludo Feliz (Brrrpt!)
  sound6_HappyChirrup() {
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);

      gain.gain.setValueAtTime(0, t + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.16, t + idx * 0.035 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.17);
    });
  }

  // 7. Murmullo y Beso Felino Afectuoso
  sound7_SoftAffectionMurmur() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.linearRampToValueAtTime(520, t + 0.14);
    osc.frequency.linearRampToValueAtTime(320, t + 0.38);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.41);
  }

  // Carillón armónico de encaje
  playSnapChimeHarmonic() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, t); // Mi6
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25); // La6

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playMew() {
    if (this.isMuted) return;
    this.sound2_KittenSqueak();
  }

  playSparkle(baseFreq = 880) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playPieceSnapChime(pitchMultiplier = 1.0) {
    this.playKittenSnapSound();
  }
}

window.romanticAudio = new RomanticAudioSynthesizer();
