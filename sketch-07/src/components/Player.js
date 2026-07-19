import { state, triggerScreenShake } from '../state.js';
import { COLORS } from '../constants.js';
import { Particle } from './Particle.js';
import { Projectile } from './Projectile.js';

export class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 80;
    this.width = 40;
    this.height = 40;
    this.speed = 6;
    this.health = 100;
    this.maxHealth = 100;
    
    // Shield
    this.shieldActive = false;
    this.shieldTime = 0;
    
    // Weapons
    this.tripleTime = 0;
    this.beamTime = 0;
  }

  update() {
    // Movement: supports both keys (WASD/Arrows) and mouse
    let dx = 0;
    let dy = 0;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx = -1; // A
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx = 1; // D
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy = -1;    // W
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy = 1;   // S

    // Key movement
    if (dx !== 0 || dy !== 0) {
      this.x += dx * this.speed;
      this.y += dy * this.speed;
    } else {
      // Mouse movement (smooth interpolation)
      this.x = lerp(this.x, mouseX, 0.15);
      this.y = lerp(this.y, mouseY, 0.15);
    }

    // Keep inside boundaries
    this.x = constrain(this.x, this.width / 2, width - this.width / 2);
    this.y = constrain(this.y, height / 2, height - 30); // Constrain player to bottom half

    // Shield and Weapon Timer updates
    if (this.shieldActive) {
      this.shieldTime -= deltaTime;
      if (this.shieldTime <= 0) this.shieldActive = false;
    }

    if (this.tripleTime > 0) {
      this.tripleTime -= deltaTime;
    }

    if (this.beamTime > 0) {
      this.beamTime -= deltaTime;
    }

    // Spawn thruster trails
    if (frameCount % 2 === 0) {
      state.particles.push(new Particle(this.x, this.y + this.height/2, random(-1, 1), random(2, 4), COLORS.player, 8));
    }

    // Update HTML health state
    const healthPercent = (this.health / this.maxHealth) * 100;
    const healthBar = document.getElementById('health-bar-fill');
    if (healthBar) healthBar.style.width = `${max(0, healthPercent)}%`;

    // Update active powerup text
    let pwrLabel = "NONE";
    if (this.shieldActive) pwrLabel = "SHIELD (" + ceil(this.shieldTime / 1000) + "s)";
    else if (this.tripleTime > 0 && this.beamTime > 0) pwrLabel = "TRIPLE BEAM (" + ceil(max(this.tripleTime, this.beamTime) / 1000) + "s)";
    else if (this.tripleTime > 0) pwrLabel = "TRIPLE SHOT (" + ceil(this.tripleTime / 1000) + "s)";
    else if (this.beamTime > 0) pwrLabel = "PLASMA BEAM (" + ceil(this.beamTime / 1000) + "s)";
    
    let hudPowerup = document.getElementById('hud-powerup');
    if (hudPowerup) hudPowerup.innerText = pwrLabel;
  }

  draw() {
    push();
    // Shadow glow filter for p5 shapes
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = COLORS.player;
    
    stroke(COLORS.player);
    strokeWeight(3);
    noFill();

    // Draw Spaceship Vector Shape (looks like a sleek neo triangular fighter)
    beginShape();
    vertex(this.x, this.y - this.height / 2); // Nose
    vertex(this.x - this.width / 2, this.y + this.height / 2); // Left wing
    vertex(this.x - this.width / 4, this.y + this.height / 4); // Tail recess left
    vertex(this.x + this.width / 4, this.y + this.height / 4); // Tail recess right
    vertex(this.x + this.width / 2, this.y + this.height / 2); // Right wing
    endShape(CLOSE);

    // Thruster Core Core
    strokeWeight(2);
    fill('#fff');
    ellipse(this.x, this.y + this.height/4, 6, 12);

    // Draw active shield ring
    if (this.shieldActive) {
      drawingContext.shadowColor = '#00ff66';
      stroke('#00ff66');
      strokeWeight(2 + sin(frameCount * 0.2) * 1.5);
      ellipse(this.x, this.y, this.width * 1.6, this.height * 1.6);
    }
    pop();
  }

  shoot() {
    if (window.sounds) window.sounds.playLaser();

    let isTriple = this.tripleTime > 0;
    let isBeam = this.beamTime > 0;
    let type = isBeam ? 'beam' : 'normal';
    let vy = isBeam ? -12 : -8;

    if (isTriple) {
      state.projectiles.push(new Projectile(this.x, this.y - this.height/2, 0, vy, true, type));
      let sideVy = isBeam ? -11.5 : -7.5;
      state.projectiles.push(new Projectile(this.x, this.y - this.height/2, -2, sideVy, true, type));
      state.projectiles.push(new Projectile(this.x, this.y - this.height/2, 2, sideVy, true, type));
    } else {
      state.projectiles.push(new Projectile(this.x, this.y - this.height/2, 0, vy, true, type));
    }
  }

  damage(amount) {
    if (this.shieldActive) {
      // Shield absorbs hits
      triggerScreenShake(4, 8);
      return;
    }

    this.health -= amount;
    triggerScreenShake(12, 18);
    if (window.sounds) window.sounds.playHit();

    // Damage flash particles
    for (let i = 0; i < 15; i++) {
      state.particles.push(new Particle(this.x, this.y, random(-4, 4), random(-4, 4), COLORS.enemy, 15));
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  applyPowerup(type) {
    if (type === 'shield') {
      this.shieldActive = true;
      this.shieldTime = 8000; // 8 seconds
    } else if (type === 'triple') {
      this.tripleTime = 8000;
    } else if (type === 'beam') {
      this.beamTime = 5000; // 5 seconds
    } else if (type === 'repair') {
      this.health = min(this.health + 40, this.maxHealth);
    }
  }

  die() {
    if (window.sounds) window.sounds.playGameOver();
    state.gameState = 'GAMEOVER';
    
    // Spawn massive explosion
    for (let i = 0; i < 40; i++) {
      state.particles.push(new Particle(this.x, this.y, random(-8, 8), random(-8, 8), COLORS.player, 25));
    }

    let finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.innerText = state.score;
    
    let gameOverOverlay = document.getElementById('gameover-overlay');
    if (gameOverOverlay) gameOverOverlay.classList.remove('hidden');
  }
}
