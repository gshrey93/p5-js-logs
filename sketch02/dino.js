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

    // Dust trail particles
    this.dustParticles = [];
  }

  jump() {
    if (this.onGround) {
      this.velocityY = CONFIG.JUMP_FORCE;
      this.onGround = false;
    }
  }

  crouch() {
    this.isCrouching = true;
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

    // Spawn running dust particles
    if (this.onGround && frameCount % 6 === 0) {
      this.dustParticles.push({
        x: this.x + 4,
        y: this.baseY - 4,
        vx: random(-2, -0.5),
        vy: random(-1.5, -0.5),
        size: random(2, 6),
        life: 25,
      });
    }

    // Update dust particles
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // slight gravity for dust settling
      p.life--;
      if (p.life <= 0) {
        this.dustParticles.splice(i, 1);
      }
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
    // 1. Draw dust particles first
    push();
    noStroke();
    this.dustParticles.forEach(p => {
      // Dust turns darker at night
      const dustColorVal = map(sin(timeOfDay * TWO_PI), -1, 1, 50, 180);
      fill(dustColorVal, dustColorVal * 0.9, dustColorVal * 0.8, map(p.life, 0, 25, 0, 180));
      rect(p.x, p.y, p.size, p.size);
    });
    pop();

    const currentArt = this.getCurrentArt(timeOfDay);

    // 2. High-contrast colors
    // Main Body: a solid rich charcoal grey so it is always visible
    const mainColor = color(50, 55, 65);

    // Dynamic Outline: Black in daytime, glowing neon cyan/blue at night
    const isNight = timeOfDay > 0.3 && timeOfDay < 0.7;
    let outlineColor;
    if (isNight) {
      // Glowing neon outline at night
      const glowPulse = sin(frameCount * 0.1) * 40 + 200;
      outlineColor = color(0, glowPulse, 255, 230);
    } else {
      // Crisp solid black outline in the day
      outlineColor = color(10, 12, 16);
    }

    drawPixelArt(currentArt, this.x, this.y, this.pixelSize, mainColor, outlineColor);

    // 3. Celebration sparkles when timer is active
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

// --- Pixel art renderer (with outline & color layers) ---
export function drawPixelArt(artArray, x, y, pixelSize, mainColor, outlineColor) {
  // 1. Draw outline first if provided
  if (outlineColor) {
    fill(outlineColor);
    noStroke();
    const d = 1.2; // small offset for smooth outline
    const offsets = [
      [-d, 0], [d, 0], [0, -d], [0, d],
      [-d, -d], [d, -d], [-d, d], [d, d]
    ];
    for (const off of offsets) {
      for (let i = 0; i < artArray.length; i++) {
        for (let j = 0; j < artArray[i].length; j++) {
          const char = artArray[i][j];
          if (char === '█' || char === '░' || char === 'X') {
            rect(x + j * pixelSize + off[0], y + i * pixelSize + off[1], pixelSize, pixelSize);
          }
        }
      }
    }
  }

  // 2. Draw actual layers
  noStroke();
  for (let i = 0; i < artArray.length; i++) {
    for (let j = 0; j < artArray[i].length; j++) {
      const char = artArray[i][j];
      if (char === '█') {
        fill(mainColor);
        rect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
      } else if (char === '░') {
        fill(255); // White eye highlight
        rect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
      } else if (char === 'X') {
        fill(255, 60, 60); // Red cross eye for collision
        rect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}
