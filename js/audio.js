/**
 * audio.js - Sintetizador Web Audio API de 7 Sonidos Felinos Ultrarrealistas y Claros
 * Diseñado y desbloqueado especialmente para iOS Safari, Chrome y dispositivos móviles.
 */

class RomanticAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isUnlocked = false;
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

  unlock() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isUnlocked) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      } catch (e) {}
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  /**
   * 7 Sonidos Claros, Expresivos y Tiernos de Gatitos
   */
  playKittenSnapSound(customIndex = null) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const playFn = () => {
      const index = (customIndex !== null) ? (customIndex % 7) : (this.soundCounter++ % 7);

      switch (index) {
        case 0:
          this.sound1_SweetMeow();          // 1. Miau Clásico "Miaaauuu"
          break;
        case 1:
          this.sound2_KittenSqueak();        // 2. Miau Bebé "Miuu!"
          break;
        case 2:
          this.sound3_PurrTrill();           // 3. Trino con Ronroneo "Prrr-mew"
          break;
        case 3:
          this.sound4_CuriousMew();          // 4. Miau Curioso "¿Miau?"
          break;
        case 4:
          this.sound5_SingingChimeMew();     // 5. Miau Cantarín Armónico
          break;
        case 5:
          this.sound6_HappyChirrup();        // 6. Chirrup Alegre "Brrrpt!"
          break;
        case 6:
          this.sound7_SoftAffectionMurmur();   // 7. Murmullo y Beso Felino
          break;
      }

      // Campanita de cristal brillante de fondo
      this.playSnapChimeHarmonic();
    };

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(playFn);
    } else {
      playFn();
    }
  }

  // 1. Miau Clásico y Tierno ("Miaaauuu~")
  sound1_SweetMeow() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.14);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.38);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.48, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  // 2. Miau Corto de Gatito Bebé ("Miuu!")
  sound2_KittenSqueak() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(1180, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(760, t + 0.26);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.42, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 3. Trino con Ronroneo ("Prrr-meww~")
  sound3_PurrTrill() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(720, t + 0.16);
    osc.frequency.linearRampToValueAtTime(500, t + 0.35);

    // Modulación a 26 Hz para vibrato felino
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(26, t);
    lfoGain.gain.setValueAtTime(70, t);

    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.38);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.37);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.39);
  }

  // 4. Miau Curioso Ascendente ("¿Miau?")
  sound4_CuriousMew() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.32);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.42, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // 5. Miau Cantarín Armónico
  sound5_SingingChimeMew() {
    const t = this.ctx.currentTime;
    [659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + idx * 0.04 + 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, t + idx * 0.04 + 0.28);

      gain.gain.setValueAtTime(0, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.32);
    });
  }

  // 6. Chirrup Alegre de Saludo ("Brrrpt!")
  sound6_HappyChirrup() {
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);

      gain.gain.setValueAtTime(0, t + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.32, t + idx * 0.035 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.2);
    });
  }

  // 7. Murmullo y Beso Felino
  sound7_SoftAffectionMurmur() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(560, t + 0.14);
    osc.frequency.linearRampToValueAtTime(360, t + 0.38);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.44, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.44);
  }

  // Campanita armónica de encaje
  playSnapChimeHarmonic() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, t); // Mi6
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25); // La6

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playMew() {
    if (this.isMuted) return;
    this.sound2_KittenSqueak();
  }

  playSparkle(baseFreq = 880) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, t + 0.12);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playPieceSnapChime(pitchMultiplier = 1.0) {
    this.playKittenSnapSound();
  }
}

window.romanticAudio = new RomanticAudioSynthesizer();
