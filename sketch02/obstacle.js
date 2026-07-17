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
    "   █   ",
    "   █   ",
    " █ █ █ ",
    "███████",
    " █████ ",
    "   █   ",
    "   █   ",
    "   █   "
  ],
  large: [
    "    ██    ",
    "    ██    ",
    " █  ██  █ ",
    "██  ██  ██",
    "██████████",
    " ████████ ",
    "    ██    ",
    "    ██    ",
    "    ██    ",
    "    ██    ",
    "    ██    ",
    "    ██    "
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
    const usePtero = (score || 0) > 200 && Math.random() < 0.35;

    if (usePtero) {
      this.type = 'pterodactyl';
      this.pixelSize = 3;
      this.art = pterodactylArt.wing1;
      this.artFrames = pterodactylArt;
      this.w = this.art[0].length * this.pixelSize;
      this.h = this.art.length * this.pixelSize;
      this.x = CONFIG.CANVAS_WIDTH;
      // Fly at head height (upper half of play area)
      this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.h - random(35, 75);
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
    // Pterodactyls fly 35% faster than ground speed for dynamic challenge!
    const effectiveSpeed = this.type === 'pterodactyl' ? gameSpeed * 1.35 : gameSpeed;
    this.x -= effectiveSpeed;
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
    const isNight = timeOfDay > 0.3 && timeOfDay < 0.7;

    // Adaptive Outline Color: Dark in day, glowing neon red/orange for danger at night
    let outlineColor;
    if (isNight) {
      outlineColor = color(255, 100, 50, 220); // neon orange warning outline at night
    } else {
      outlineColor = color(15, 20, 25, 230); // dark outlines in day
    }

    if (this.type === 'pterodactyl') {
      // Flapping animation
      const currentArt = (floor(frameCount / 8) % 2 === 0)
        ? this.artFrames.wing1
        : this.artFrames.wing2;

      // Dark brown bird color
      const mainColor = color(100, 60, 60);
      drawPixelArt(currentArt, this.x, this.y, this.pixelSize, mainColor, outlineColor);
    } else {
      // Cactus: solid green body color
      const mainColor = color(20, 140, 50);
      drawPixelArt(this.art, this.x, this.y, this.pixelSize, mainColor, outlineColor);
    }
  }
}
