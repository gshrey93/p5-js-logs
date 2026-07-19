import { COLORS } from '../constants.js';

export class Projectile {
  constructor(x, y, vx, vy, isPlayer, type = 'normal') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isPlayer = isPlayer;
    this.type = type;
    
    this.size = (type === 'beam') ? 14 : 6;
    this.damage = (type === 'beam') ? 30 : 15;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    push();
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = this.isPlayer ? COLORS.projectile : COLORS.enemy;
    stroke(this.isPlayer ? COLORS.projectile : COLORS.enemy);
    strokeWeight(2);

    if (this.type === 'beam') {
      fill(255);
      rectMode(CENTER);
      rect(this.x, this.y, this.size, this.size * 2, 4);
    } else {
      line(this.x, this.y, this.x - this.vx, this.y - this.vy * 1.5);
    }
    pop();
  }

  hits(obj) {
    let d = dist(this.x, this.y, obj.x, obj.y);
    return d < (this.size + obj.width / 2);
  }

  isOffscreen() {
    return this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50;
  }
}
