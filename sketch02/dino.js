// dino.js — Player character with refined art, crouch, and celebration

import { CONFIG } from './config.js';

// ============================================================
// PIXEL ART FRAMES — Higher-detail dino with expressive poses
// ============================================================

export const dinoArt = {
  run1: [
    "          ██████  ",
    "         ████████ ",
    "         █░██████ ",
    "         ████████ ",
    "██       █████    ",
    "███     ██████    ",
    "████   ████████   ",
    "█████ ██████████  ",
    "████████████████  ",
    " ███████████████  ",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██████████    ",
    "     ████████     ",
    "      ██  ███     ",
    "      ██   ██     ",
    "      ███         ",
    "       ██         ",
  ],
  run2: [
    "          ██████  ",
    "         ████████ ",
    "         █░██████ ",
    "         ████████ ",
    "██       █████    ",
    "███     ██████    ",
    "████   ████████   ",
    "█████ ██████████  ",
    "████████████████  ",
    " ███████████████  ",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██████████    ",
    "     ████████     ",
    "      ███  ██     ",
    "      ██    ██    ",
    "           ███    ",
    "            ██    ",
  ],
  jump: [
    "          ██████  ",
    "         ████████ ",
    "         █░██████ ",
    "         ████████ ",
    "██       █████    ",
    "████    ██████    ",
    "█████  ████████   ",
    "██████████████████",
    "████████████████  ",
    " ███████████████  ",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██████████    ",
    "     ████████     ",
    "     ███  ███     ",
    "     ██    ██     ",
  ],
  crouch1: [
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "         ██████   ",
    "██      ████████  ",
    "███    █░████████ ",
    "█████ ███████████ ",
    "██████████████████",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██   ██       ",
    "    ██    ██      ",
  ],
  crouch2: [
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "                  ",
    "         ██████   ",
    "██      ████████  ",
    "███    █░████████ ",
    "█████ ███████████ ",
    "██████████████████",
    "  ██████████████  ",
    "   ████████████   ",
    "      ██   ██     ",
    "      ██    ██    ",
  ],
  happy: [
    "  ██          ██  ",
    "  ███        ███  ",
    "  ████  ██████    ",
    "   ███ ████████   ",
    "   ███ █░██████   ",
    "    ██ ████████   ",
    "    ██ ██████     ",
    "   ███████████    ",
    "  █████████████   ",
    " ███████████████  ",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██████████    ",
    "     ████████     ",
    "      ██  ██      ",
    "      ██  ██      ",
    "      ██  ██      ",
    "      ██  ██      ",
  ],
  hit: [
    "          ██████  ",
    "         ████████ ",
    "         █X██████ ",
    "         ████████ ",
    "         █████    ",
    "  ██    ██████    ",
    " ████  ████████   ",
    "██████████████████",
    "████████████████  ",
    " ███████████████  ",
    "  ██████████████  ",
    "   ████████████   ",
    "    ██████████    ",
    "     ████████     ",
    "    ████████████  ",
    "   ██    ██    ██ ",
  ],
};

// ============================================================
// DINO CLASS
// ============================================================

export class Dino {
  constructor() {
    this.pixelSize = CONFIG.DINO_PIXEL_SIZE;
    this.baseY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;

    // Visual dimensions based on art (18 chars wide × 18 rows)
    this.w = 18 * this.pixelSize;
    this.h = 18 * this.pixelSize;

    this.x = 60;
    this.y = this.baseY - this.h;

    this.velocityY = 0;
    this.onGround = true;

    // Crouch state
    this.isCrouching = false;
    this.crouchH = 9 * this.pixelSize; // shorter when crouching

    // Streak / celebration
    this.streakCount = 0;
    this.celebrationTimer = 0;
  }

  jump() {
    if (this.onGround) {
      this.velocityY = CONFIG.JUMP_FORCE;
      this.onGround = false;
    }
  }

  crouch() {
    this.isCrouching = true;
    // Reposition so feet stay on the ground
    if (this.onGround) {
      this.y = this.baseY - this.crouchH;
    }
  }

  uncrouch() {
    this.isCrouching = false;
    if (this.onGround) {
      this.y = this.baseY - this.h;
    }
  }

  update() {
    this.velocityY += CONFIG.GRAVITY;
    this.y += this.velocityY;

    const currentH = this.isCrouching ? this.crouchH : this.h;

    if (this.y >= this.baseY - currentH) {
      this.y = this.baseY - currentH;
      this.velocityY = 0;
      this.onGround = true;
    }

    // Tick celebration timer
    if (this.celebrationTimer > 0) {
      this.celebrationTimer--;
    }
  }

  getHitbox() {
    const currentH = this.isCrouching ? this.crouchH : this.h;
    const shrink = CONFIG.HITBOX_SHRINK;
    const shrunkW = this.w * shrink;
    const shrunkH = currentH * shrink;
    const offsetX = (this.w - shrunkW) / 2;
    const offsetY = (currentH - shrunkH) / 2;

    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      w: shrunkW,
      h: shrunkH,
    };
  }

  // --- Streak / Celebration ---

  incrementStreak() {
    this.streakCount++;
    if (this.streakCount % CONFIG.STREAK_MILESTONE === 0) {
      this.celebrationTimer = 60; // ~1 second of celebration
    }
  }

  resetStreak() {
    this.streakCount = 0;
  }

  isCelebrating() {
    return this.streakCount > 0 && this.streakCount % CONFIG.STREAK_MILESTONE === 0;
  }

  // --- Drawing ---

  getCurrentArt(timeOfDay) {
    if (this.celebrationTimer > 0) return dinoArt.happy;
    if (this.isCrouching) {
      return (floor(frameCount / 6) % 2 === 0) ? dinoArt.crouch1 : dinoArt.crouch2;
    }
    if (!this.onGround) return dinoArt.jump;
    return (floor(frameCount / 6) % 2 === 0) ? dinoArt.run1 : dinoArt.run2;
  }

  draw(timeOfDay) {
    const currentArt = this.getCurrentArt(timeOfDay);

    // Day/night adaptive color
    fill(lerpColor(color(80), color(220), 0.5 + 0.5 * sin(timeOfDay * TWO_PI)));
    noStroke();
    drawPixelArt(currentArt, this.x, this.y, this.pixelSize);

    // Celebration sparkles when timer is active
    if (this.celebrationTimer > 0) {
      this.drawCelebrationSparkles();
    }
  }

  drawCelebrationSparkles() {
    const cx = this.x + this.w / 2;
    const cy = this.y - 10;

    push();
    noStroke();
    for (let i = 0; i < 5; i++) {
      const angle = (frameCount * 0.15 + i * 1.2566);
      const radius = 12 + sin(frameCount * 0.2 + i) * 6;
      const sx = cx + cos(angle) * radius;
      const sy = cy - 5 + sin(angle) * radius * 0.5;
      const size = 3 + sin(frameCount * 0.3 + i * 2) * 2;

      fill(255, 255, 100, 200 - i * 30);
      ellipse(sx, sy, size, size);
    }
    pop();
  }
}

// --- Pixel art renderer (shared utility) ---
export function drawPixelArt(artArray, x, y, pixelSize) {
  for (let i = 0; i < artArray.length; i++) {
    for (let j = 0; j < artArray[i].length; j++) {
      if (artArray[i][j] === '█') {
        rect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}
