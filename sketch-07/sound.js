// Web Audio API Synthesizer for Retro 8-bit Sounds
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  // Audio Context is initialized on user interaction to comply with browser autoplay policies
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  playLaser() {
    this.init();
    if (!this.ctx) return;

    // Laser shoot: rapid high-to-low pitch sweep using triangle wave for retro chiptune style
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playExplosion() {
    this.init();
    if (!this.ctx) return;

    // Explosion: white noise buffer filtered through a decaying low-pass filter
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start();
    noiseNode.stop(this.ctx.currentTime + 0.4);
  }

  playPowerup() {
    this.init();
    if (!this.ctx) return;

    // Powerup: ascending arpeggio notes in quick succession (sine wave)
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0.15, now + index * 0.06);
      gain.gain.setValueAtTime(0.15, now + index * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.06);
    });
  }

  playHit() {
    this.init();
    if (!this.ctx) return;

    // Hit: dirty sawtooth buzz sweeping downward very fast
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;

    // Game Over: slow, deep descending drone (sawtooth for harsh retro fail state)
    const now = this.ctx.currentTime;
    const notes = [220.00, 207.65, 196.00, 164.81, 146.83]; // A3, Ab3, G3, E3, D3
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + index * 0.25);

      gain.gain.setValueAtTime(0.2, now + index * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.25 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.25);
      osc.stop(now + index * 0.25 + 0.3);
    });
  }
}

// Global sounds instance to be shared across sketch modules
window.sounds = new SoundSynth();
