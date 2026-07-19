export const state = {
  particles: [],
  projectiles: [],
  enemies: [],
  powerups: [],
  floatingTexts: [],
  gameState: 'START', // START, PLAYING, GAMEOVER
  score: 0,
  highScore: 0,
  level: 1,
  bossActive: false,
  lastBossLevel: 0,
  nextBossLevel: 5, // First boss at Level 5
  scrollSpeed: 1.0,
  targetScrollSpeed: 1.0,
  shakeTime: 0,
  shakeIntensity: 0
};

export function triggerScreenShake(intensity, duration) {
  state.shakeIntensity = intensity;
  state.shakeTime = duration;
}

// For testing or external access if strictly needed
if (typeof window !== 'undefined') {
  window.state = state;
}
