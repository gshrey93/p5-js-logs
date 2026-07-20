// booster.js — Collectible power-ups: Shield, Magnet, Speed Burst, Slow-Mo

import { CONFIG } from './config.js';

// ============================================================
// BOOSTER TYPES
// ============================================================

export const BOOSTER_TYPE = {
  SHIELD: 'SHIELD',
  MAGNET: 'MAGNET',
  SPEED_BURST: 'SPEED_BURST',
  SLOW_MO: 'SLOW_MO',
};

// Visual config per booster type
const BOOSTER_VISUALS = {
  [BOOSTER_TYPE.SHIELD]: { icon: '🛡️', glow: [100, 180, 255], label: 'Shield' },
  [BOOSTER_TYPE.MAGNET]: { icon: '🧲', glow: [220, 100, 100], label: 'Magnet' },
  [BOOSTER_TYPE.SPEED_BURST]: { icon: '⚡', glow: [255, 220, 50], label: 'Speed!' },
  [BOOSTER_TYPE.SLOW_MO]: { icon: '🐢', glow: [100, 255, 180], label: 'Slow-Mo' },
};

// ============================================================
// BOOSTER CLASS
// ============================================================

export class Booster {
  constructor(type, gameSpeed) {
    this.type = type;
    this.x = CONFIG.CANVAS_WIDTH;
    this.w = 28;
    this.h = 28;
    this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.h - 5;

    this.collected = false;
    this.bobOffset = 0;

    // Duration in frames (5 seconds at 60fps)
    this.duration = CONFIG.BOOSTER_DURATION;

    // Shield-specific
    this.hits = (type === BOOSTER_TYPE.SHIELD) ? 1 : 0;
  }

  update(gameSpeed) {
    this.x -= gameSpeed;
    this.bobOffset = sin(frameCount * 0.1) * 4;
  }

  isOffscreen() {
    return this.x + this.w < 0;
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y + this.bobOffset,
      w: this.w,
      h: this.h,
    };
  }

  collidesWith(player) {
    const bBox = this.getHitbox();
    const dBox = player.getHitbox();

    return (
      dBox.x < bBox.x + bBox.w &&
      dBox.x + dBox.w > bBox.x &&
      dBox.y < bBox.y + bBox.h &&
      dBox.y + dBox.h > bBox.y
    );
  }

  draw() {
    if (this.collected) return;

    const vis = BOOSTER_VISUALS[this.type];
    const drawY = this.y + this.bobOffset;

    push();

    // Glowing circle background
    noStroke();
    const pulse = sin(frameCount * 0.08) * 30 + 30;
    fill(vis.glow[0], vis.glow[1], vis.glow[2], 60 + pulse);
    ellipse(this.x + this.w / 2, drawY + this.h / 2, this.w + 12, this.h + 12);

    // Inner solid circle
    fill(vis.glow[0], vis.glow[1], vis.glow[2], 180);
    ellipse(this.x + this.w / 2, drawY + this.h / 2, this.w, this.h);

    // Icon text
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(255);
    noStroke();
    text(vis.icon, this.x + this.w / 2, drawY + this.h / 2);

    pop();
  }
}

// ============================================================
// ACTIVE BOOSTER STATE — manages currently active booster effect
// ============================================================

export class ActiveBooster {
  constructor() {
    this.type = null;
    this.timer = 0;
    this.hits = 0;  // for shield
  }

  activate(boosterType) {
    this.type = boosterType;
    this.timer = CONFIG.BOOSTER_DURATION;
    if (boosterType === BOOSTER_TYPE.SHIELD) {
      this.hits = 1;
    }
  }

  update() {
    if (this.type === null) return;

    this.timer--;
    if (this.timer <= 0) {
      this.deactivate();
    }
  }

  isActive(type) {
    if (type) return this.type === type && this.timer > 0;
    return this.type !== null && this.timer > 0;
  }

  /**
   * Attempts to absorb a hit with the shield.
   * @returns {boolean} true if shield absorbed the hit, false if no shield active.
   */
  absorbHit() {
    if (this.type === BOOSTER_TYPE.SHIELD && this.hits > 0) {
      this.hits--;
      if (this.hits <= 0) {
        this.deactivate();
      }
      return true;
    }
    return false;
  }

  deactivate() {
    this.type = null;
    this.timer = 0;
    this.hits = 0;
  }

  /** Returns 0-1 fraction of remaining time */
  getTimerFraction() {
    if (this.type === null) return 0;
    return this.timer / CONFIG.BOOSTER_DURATION;
  }

  draw() {
    if (!this.isActive()) return;

    const vis = BOOSTER_VISUALS[this.type];
    if (!vis) return;

    push();

    // Timer bar at top of screen
    const barWidth = 200;
    const barHeight = 8;
    const barX = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
    const barY = 10;
    const fraction = this.getTimerFraction();

    // Background
    noStroke();
    fill(0, 0, 0, 100);
    rect(barX, barY, barWidth, barHeight, 4);

    // Fill
    fill(vis.glow[0], vis.glow[1], vis.glow[2], 200);
    rect(barX, barY, barWidth * fraction, barHeight, 4);

    // Label
    textAlign(CENTER);
    textSize(11);
    fill(255);
    noStroke();
    text(`${vis.icon} ${vis.label}`, CONFIG.CANVAS_WIDTH / 2, barY + barHeight + 14);

    pop();
  }
}

// ============================================================
// BOOSTER SPAWNING UTILITY
// ============================================================

const BOOSTER_TYPES_LIST = [
  BOOSTER_TYPE.SHIELD,
  BOOSTER_TYPE.MAGNET,
  BOOSTER_TYPE.SPEED_BURST,
  BOOSTER_TYPE.SLOW_MO,
];

export function createRandomBooster(gameSpeed) {
  const type = random(BOOSTER_TYPES_LIST);
  return new Booster(type, gameSpeed);
}
