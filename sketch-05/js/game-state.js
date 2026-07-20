import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { soundFX } from './audio.js';

export const STATE = {
  START: 'start',
  PLAY: 'play',
  OVER: 'over'
};

const HIGH_SCORE_KEY = 'flappy_kiro_best';

/**
 * GameState Manager — Handles state transitions, score accumulation, high score storage, and HUD rendering
 */
export class GameStateManager {
  constructor() {
    this.state = STATE.START;
    this.score = 0;
    this.best = this.loadHighScore();
  }

  loadHighScore() {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch (e) {
      // Ignore localStorage restrictions
    }
  }

  start() {
    this.state = STATE.PLAY;
    this.score = 0;
  }

  incrementScore() {
    this.score++;
  }

  gameOver() {
    this.state = STATE.OVER;
    soundFX.play('gameOver');
    if (this.score > this.best) {
      this.best = this.score;
      this.saveHighScore(this.best);
    }
  }

  renderHUD(ctx) {
    // Sky background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#2c3e50");
    grad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.state === STATE.START) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Flappy Kiro", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = "18px sans-serif";
      ctx.fillText("Press SPACE / Tap to Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    }
  }

  renderScore(ctx) {
    if (this.state === STATE.PLAY) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.score, CANVAS_WIDTH / 2, 50);
    }
  }

  renderGameOver(ctx) {
    if (this.state === STATE.OVER) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#e74c3c";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.fillStyle = "#fff";
      ctx.font = "22px sans-serif";
      ctx.fillText("Score: " + this.score + "   Best: " + this.best, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      ctx.font = "16px sans-serif";
      ctx.fillText("Tap / Press SPACE to Retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
  }
}
