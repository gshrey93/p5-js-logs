import { state, triggerScreenShake } from '../state.js';
import { COLORS } from '../constants.js';
import { Particle } from './Particle.js';
import { Projectile } from './Projectile.js';

export class Enemy {
  constructor(type) {
    this.type = type; // drone, swarmer, shooter, boss
    this.isBoss = type === 'boss';

    // Start coordinates
    this.x = random(40, width - 40);
    this.y = -50;
    
    // Properties based on type
    if (type === 'drone') {
      this.width = 30;
      this.height = 30;
      this.health = 15;
      this.maxHealth = 15;
      this.speed = random(1.8, 3);
      this.scoreValue = 100;
      this.color = COLORS.enemy;
      this.collisionDamage = 20;
    } 
    else if (type === 'swarmer') {
      this.width = 20;
      this.height = 20;
      this.health = 10;
      this.maxHealth = 10;
      this.speed = random(3.5, 5);
      this.scoreValue = 150;
      this.color = '#ff0055';
      this.collisionDamage = 15;
      // Dives side to side
      this.phase = random(100);
    } 
    else if (type === 'shooter') {
      this.width = 34;
      this.height = 34;
      this.health = 30;
      this.maxHealth = 30;
      this.speed = 1.5;
      this.scoreValue = 250;
      this.color = '#e040fb';
      this.collisionDamage = 25;
      this.lastShotTime = millis() + random(1000);
    } 
    else if (type === 'boss') {
      this.width = 110;
      this.height = 70;
      this.maxHealth = 400 + state.level * 150;
      this.health = this.maxHealth;
      this.speed = 1 + min(4, state.level * 0.05);
      this.scoreValue = 1000 + state.level * 200;
      this.color = COLORS.boss;
      this.collisionDamage = 50;
      this.dir = 1;
      this.lastShotTime = millis();
      this.lastMinionTime = millis();
      this.lastTargetedShotTime = millis();
      this.x = width / 2;
      this.y = -100;
    }
  }

  update() {
    if (this.isBoss) {
      const isEnraged = this.health <= this.maxHealth * 0.5;
      const currentSpeed = isEnraged ? this.speed * 1.4 : this.speed;

      // Boss entry movement, then side-to-side
      if (this.y < 120) {
        this.y += 2;
      } else {
        this.x += this.dir * currentSpeed;
        if (this.x < 100 || this.x > width - 100) {
          this.dir *= -1;
        }

        // Shoot boss barrages
        const shotCooldown = max(400, 1500 - state.level * 15) * (isEnraged ? 0.6 : 1.0);
        if (millis() - this.lastShotTime > shotCooldown) {
          this.fireBarrage(isEnraged);
          this.lastShotTime = millis();
        }

        // Minion spawns for Tier 3+ (Level >= 30)
        if (state.level >= 30 && millis() - this.lastMinionTime > 4000) {
          state.enemies.push(new Enemy('swarmer'));
          state.enemies.push(new Enemy('swarmer'));
          this.lastMinionTime = millis();
        }

        // Targeted Lock-On Lasers for Tier 4+ (Level >= 50)
        if (state.level >= 50 && millis() - this.lastTargetedShotTime > 5000) {
          if (window.player) {
            let dx = window.player.x - this.x;
            let dy = window.player.y - this.y;
            let angle = atan2(dy, dx);
            let speed = 7;
            state.projectiles.push(new Projectile(this.x, this.y + 30, cos(angle) * speed, sin(angle) * speed, false, 'beam'));
          }
          this.lastTargetedShotTime = millis();
        }
      }

      // Enraged spark particles
      if (isEnraged && frameCount % 3 === 0) {
        state.particles.push(new Particle(this.x + random(-40, 40), this.y + random(-20, 20), random(-2, 2), random(-2, 2), '#ff0033', 12));
      }
    } 
    else {
      // Standard enemy updates
      this.y += this.speed;

      if (this.type === 'swarmer') {
        this.x += sin(frameCount * 0.15 + this.phase) * 3;
      } 
      else if (this.type === 'shooter') {
        if (millis() - this.lastShotTime > 1800) {
          state.projectiles.push(new Projectile(this.x, this.y + this.height/2, 0, 5, false));
          this.lastShotTime = millis();
        }
      }
    }
  }

  fireBarrage(isEnraged) {
    let spreadCount = 3;
    if (state.level >= 50 && isEnraged) spreadCount = 7;
    else if (state.level >= 15 || isEnraged) spreadCount = 5;

    if (spreadCount === 3) {
      state.projectiles.push(new Projectile(this.x - 30, this.y + 20, -1.5, 5, false));
      state.projectiles.push(new Projectile(this.x, this.y + 35, 0, 5.5, false));
      state.projectiles.push(new Projectile(this.x + 30, this.y + 20, 1.5, 5, false));
    } else if (spreadCount === 5) {
      state.projectiles.push(new Projectile(this.x - 40, this.y + 15, -2.5, 4.5, false));
      state.projectiles.push(new Projectile(this.x - 20, this.y + 25, -1.2, 5, false));
      state.projectiles.push(new Projectile(this.x, this.y + 35, 0, 5.5, false));
      state.projectiles.push(new Projectile(this.x + 20, this.y + 25, 1.2, 5, false));
      state.projectiles.push(new Projectile(this.x + 40, this.y + 15, 2.5, 4.5, false));
    } else if (spreadCount === 7) {
      for (let i = -3; i <= 3; i++) {
        state.projectiles.push(new Projectile(this.x + i * 15, this.y + 30, i * 1.2, 5 + (3 - Math.abs(i)) * 0.3, false));
      }
    }
  }

  draw() {
    push();
    const isEnraged = this.isBoss && (this.health <= this.maxHealth * 0.5);
    const drawColor = isEnraged ? '#ff0033' : this.color;

    drawingContext.shadowBlur = isEnraged ? 20 : 12;
    drawingContext.shadowColor = drawColor;
    stroke(drawColor);
    strokeWeight(2.5);
    noFill();

    if (this.isBoss) {
      // Draw massive Boss spaceship vector
      rectMode(CENTER);
      rect(this.x, this.y - 10, this.width, this.height - 20, 10);
      beginShape();
      vertex(this.x - this.width/2, this.y - this.height/2);
      vertex(this.x - this.width/2 - 20, this.y + this.height/4);
      vertex(this.x - this.width/3, this.y + this.height/2);
      vertex(this.x + this.width/3, this.y + this.height/2);
      vertex(this.x + this.width/2 + 20, this.y + this.height/4);
      vertex(this.x + this.width/2, this.y - this.height/2);
      endShape(CLOSE);
      
      // Boss Health Bar overlay
      fill(50);
      noStroke();
      rect(this.x, this.y - 50, 100, 8);
      fill(drawColor);
      let hpWidth = map(max(0, this.health), 0, this.maxHealth, 0, 100);
      rect(this.x - 50 + hpWidth/2, this.y - 50, hpWidth, 8);
    } 
    else {
      // Draw standard alien vector designs
      if (this.type === 'drone') {
        beginShape();
        vertex(this.x, this.y + this.height/2); // Nose pointing down
        vertex(this.x - this.width/2, this.y - this.height/2);
        vertex(this.x, this.y - this.height/6);
        vertex(this.x + this.width/2, this.y - this.height/2);
        endShape(CLOSE);
      } 
      else if (this.type === 'swarmer') {
        // Diamond shaped swarmer
        beginShape();
        vertex(this.x, this.y + this.height/2);
        vertex(this.x - this.width/2, this.y);
        vertex(this.x, this.y - this.height/2);
        vertex(this.x + this.width/2, this.y);
        endShape(CLOSE);
      } 
      else if (this.type === 'shooter') {
        // Hexagon space invader style shooter
        beginShape();
        vertex(this.x - this.width/2, this.y - this.height/3);
        vertex(this.x - this.width/3, this.y + this.height/2);
        vertex(this.x + this.width/3, this.y + this.height/2);
        vertex(this.x + this.width/2, this.y - this.height/3);
        vertex(this.x + this.width/4, this.y - this.height/2);
        vertex(this.x - this.width/4, this.y - this.height/2);
        endShape(CLOSE);
      }
    }
    pop();
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < (this.width/2 + player.width/2);
  }

  damage(amount) {
    this.health -= amount;
    if (window.sounds) window.sounds.playHit();
    
    // Spark particles
    for (let i = 0; i < 5; i++) {
      state.particles.push(new Particle(this.x, this.y, random(-3, 3), random(-3, 3), this.color, 10));
    }
  }

  isDead() {
    return this.health <= 0;
  }

  isOffscreen() {
    return this.y > height + 100;
  }

  explode() {
    triggerScreenShake(this.isBoss ? 20 : 6, this.isBoss ? 25 : 12);
    if (window.sounds) window.sounds.playExplosion();
    
    let count = this.isBoss ? 45 : 12;
    for (let i = 0; i < count; i++) {
      state.particles.push(new Particle(this.x, this.y, random(-6, 6), random(-6, 6), this.color, this.isBoss ? 24 : 14));
    }
  }
}
