/**
 * SoundFX — Audio asset loader and non-blocking playback helper
 */
class SoundFX {
  constructor() {
    this.sounds = {};
    this.init();
  }

  init() {
    try {
      this.sounds.jump = new Audio('assets/jump.wav');
      this.sounds.gameOver = new Audio('assets/game_over.wav');
    } catch (e) {
      console.warn('Audio initialization warning:', e);
    }
  }

  play(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Prevent unhandled promise rejection if user hasn't interacted yet
      });
    }
  }
}

export const soundFX = new SoundFX();
