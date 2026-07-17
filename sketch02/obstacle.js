// obstacle.js — Cacti and Pterodactyl obstacles

import { CONFIG } from './config.js';
import { drawPixelArt } from './dino.js';

// ============================================================
// PIXEL ART — Cacti + Pterodactyl
// ============================================================

export const cactusArt = {
  small: [
    "  █  ",
    " ██  ",
    "███  ",
    " █   ",
    " █   ",
  ],
  medium: [
    "  █   ",
    "█ █ ██",
    "█ █ █ ",
    "  █   ",
    "  █   ",
  ],
  large: [
    " █  █ ",
    "██  █ ",
    "███ █ ",
    "  █   ",
    "  █   ",
  ],
};

const pterodactylArt = {
  wing1: [
    "    █         ",
    "   ████       ",
    "  ██████      ",
    " █████████████",
    "██████████████",
    "  ██████████  ",
    "   █████████  ",
    "     █████    ",
    "              ",
  ],
  wing2: [
    "              ",
    "              ",
    "  ██████████  ",
    " █████████████",
    "██████████████",
    "  ██████████  ",
    "   █████████  ",
    "   ████       ",
    "  ████        ",
  ],
};

// ============================================================
// OBSTACLE CLASS
// ============================================================

export class Obstacle {
  constructor(gameSpeed, score) {
    this.scored = false; // has the dino passed this obstacle?

    // Decide type — pterodactyl only after score 200
    const usePtero = (score || 0) > 200 && Math.random() < 0.3;

    if (usePtero) {
      this.type = 'pterodactyl';
      this.pixelSize = 3;
      this.art = pterodactylArt.wing1;
      this.artFrames = pterodactylArt;
      this.w = this.art[0].length * this.pixelSize;
      this.h = this.art.length * this.pixelSize;
      this.x = CONFIG.CANVAS_WIDTH;
      // Fly at head height (upper half of play area)
      this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.h - random(40, 80);
      this.isFlying = true;
    } else {
      this.type = random(['small', 'medium', 'large']);
      this.pixelSize = CONFIG.OBSTACLE_PIXEL_SIZE;
      this.art = cactusArt[this.type];
      this.w = this.art[0].length * this.pixelSize;
      this.h = this.art.length * this.pixelSize;
      this.x = CONFIG.CANVAS_WIDTH;
      this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.h;
      this.isFlying = false;
    }
  }

  update(gameSpeed) {
    this.x -= gameSpeed;
  }

  isOffscreen() {
    return this.x + this.w < 0;
  }

  getHitbox() {
    const shrink = CONFIG.HITBOX_SHRINK;
    const shrunkW = this.w * shrink;
    const shrunkH = this.h * shrink;
    const offsetX = (this.w - shrunkW) / 2;
    const offsetY = (this.h - shrunkH) / 2;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      w: shrunkW,
      h: shrunkH,
    };
  }

  collidesWith(player) {
    const obsBox = this.getHitbox();
    const dinoBox = player.getHitbox();

    return (
      dinoBox.x < obsBox.x + obsBox.w &&
      dinoBox.x + dinoBox.w > obsBox.x &&
      dinoBox.y < obsBox.y + obsBox.h &&
      dinoBox.y + dinoBox.h > obsBox.y
    );
  }

  draw(timeOfDay) {
    if (this.type === 'pterodactyl') {
      // Flapping animation
      const currentArt = (floor(frameCount / 8) % 2 === 0)
        ? this.artFrames.wing1
        : this.artFrames.wing2;

      fill(lerpColor(color(100, 50, 50), color(60, 30, 30), 0.5 - 0.5 * sin(timeOfDay * TWO_PI)));
      noStroke();
      drawPixelArt(currentArt, this.x, this.y, this.pixelSize);
    } else {
      // Cactus — day/night color
      const baseColor = color(0, 100, 0);
      const nightColor = color(0, 50, 0);
      const currentColor = lerpColor(baseColor, nightColor, 0.5 - 0.5 * sin(timeOfDay * TWO_PI));
      fill(currentColor);
      noStroke();
      drawPixelArt(this.art, this.x, this.y, this.pixelSize);
    }
  }
}
