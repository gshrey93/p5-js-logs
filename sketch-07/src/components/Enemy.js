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
      this.speed = random(1.8, 3);
      this.scoreValue = 100;
      this.color = COLORS.enemy;
      this.collisionDamage = 20;
    } 
    else if (type === 'swarmer') {
      this.width = 20;
      this.height = 20;
      this.health = 10;
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
      this.speed = 1.5;
      this.scoreValue = 250;
      this.color = '#e040fb';
      this.collisionDamage = 25;
      this.lastShotTime = millis() + random(1000);
    } 
    else if (type === 'boss') {
      this.width = 110;
      this.height = 70;
      this.health = 400 + state.level * 100;
      this.speed = 1;
      this.scoreValue = 1000;
      this.color = COLORS.boss;
      this.collisionDamage = 50;
      this.dir = 1;
      this.lastShotTime = millis();
      this.x = width / 2;
      this.y = -100;
    }
  }

  update() {
    if (this.isBoss) {
      // Boss entry movement, then side-to-side
      if (this.y < 120) {
        this.y += 2;
      } else {
        this.x += this.dir * this.speed;
        if (this.x < 100 || this.x > width - 100) {
          this.dir *= -1;
        }

        // Shoot boss barrages
        if (millis() - this.lastShotTime > 1500) {
          state.projectiles.push(new Projectile(this.x - 30, this.y + 20, -1, 5, false));
          state.projectiles.push(new Projectile(this.x, this.y + 35, 0, 5.5, false));
          state.projectiles.push(new Projectile(this.x + 30, this.y + 20, 1, 5, false));
          this.lastShotTime = millis();
        }
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

  draw() {
    push();
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = this.color;
    stroke(this.color);
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
      fill(this.color);
      let hpWidth = map(this.health, 0, 400 + state.level * 100, 0, 100);
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
