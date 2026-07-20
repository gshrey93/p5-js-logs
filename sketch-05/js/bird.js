import { GRAVITY, JUMP, CANVAS_HEIGHT } from './config.js';
import { soundFX } from './audio.js';

/**
 * Bird Entity Class — Handles movement, jump physics, collision bounds, and rendering
 */
export class Bird {
  constructor(x = 80, y = CANVAS_HEIGHT / 2) {
    this.initialX = x;
    this.initialY = y;
    this.w = 30;
    this.h = 22;
    this.reset();
  }

  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.vy = 0;
  }

  jump() {
    this.vy = JUMP;
    soundFX.play('jump');
  }

  update() {
    this.vy += GRAVITY;
    this.y += this.vy;
  }

  isOutOfBounds(canvasHeight = CANVAS_HEIGHT) {
    return this.y < 0 || this.y + this.h > canvasHeight;
  }

  render(ctx) {
    // Bird Body
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Beak
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(this.x + this.w - 8, this.y + 8, 10, 6);

    // Eye White
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x + 18, this.y + 4, 7, 7);

    // Eye Pupil
    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 21, this.y + 6, 3, 3);
  }
}
