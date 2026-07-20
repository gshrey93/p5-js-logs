import { PIPE_WIDTH, GAP, PIPE_SPEED, SPAWN_RATE, CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

/**
 * PipeManager Class — Manages pipe spawning, movement, recycling, collision detection, and score tracking
 */
export class PipeManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.pipes = [];
    this.frame = 0;
  }

  update(bird, onScore) {
    this.frame++;

    // Spawn pipes periodically
    if (this.frame % SPAWN_RATE === 0) {
      const topMin = 60;
      const topMax = CANVAS_HEIGHT - GAP - 60;
      const top = Math.floor(Math.random() * (topMax - topMin)) + topMin;
      this.pipes.push({ x: CANVAS_WIDTH, top: top, scored: false });
    }

    // Move pipes, score, and remove offscreen pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= PIPE_SPEED;

      // Score trigger when bird successfully passes a pipe
      if (!p.scored && p.x + PIPE_WIDTH < bird.x) {
        p.scored = true;
        if (onScore) onScore();
      }

      // Recycle offscreen pipes
      if (p.x + PIPE_WIDTH < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  collidesWith(bird) {
    // Check canvas top/bottom bounds
    if (bird.isOutOfBounds(CANVAS_HEIGHT)) return true;

    // Check pipe obstacles AABB bounds
    for (let i = 0; i < this.pipes.length; i++) {
      const p = this.pipes[i];
      if (bird.x + bird.w > p.x && bird.x < p.x + PIPE_WIDTH) {
        if (bird.y < p.top || bird.y + bird.h > p.top + GAP) {
          return true;
        }
      }
    }
    return false;
  }

  render(ctx) {
    ctx.fillStyle = "#27ae60";
    for (let i = 0; i < this.pipes.length; i++) {
      const p = this.pipes[i];
      // Top Pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
      // Bottom Pipe
      ctx.fillRect(p.x, p.top + GAP, PIPE_WIDTH, CANVAS_HEIGHT - p.top - GAP);

      // Pipe Caps
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(p.x - 3, p.top - 18, PIPE_WIDTH + 6, 18);
      ctx.fillRect(p.x - 3, p.top + GAP, PIPE_WIDTH + 6, 18);
      ctx.fillStyle = "#27ae60";
    }
  }
}
