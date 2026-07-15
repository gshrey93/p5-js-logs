import { CONFIG } from './config.js';

export class Tank {
  constructor(id, x, color, angle) {
    this.id = id;
    this.x = x;
    this.y = 0;
    this.width = 6;
    this.height = 4;
    this.color = color;
    this.angle = angle;
    this.power = 50;
    this.health = 100;
    this.shotsLeft = CONFIG.MAX_SHOTS;
    this.consecutiveHits = 0;
  }

  applyDamage(damage) {
    this.health -= damage;
    if (this.health < 0) {
      this.health = 0;
    }
  }

  isBigShotReady() {
    return this.consecutiveHits >= 3;
  }

  drawBody() {
    push();
    translate(this.x * CONFIG.CELL_SIZE, this.y * CONFIG.CELL_SIZE);

    noStroke();
    fill(0, 0, 0, 40);
    ellipse(this.width * CONFIG.CELL_SIZE * 0.5, this.height * CONFIG.CELL_SIZE + 5, this.width * CONFIG.CELL_SIZE * 0.9, 6);

    stroke(18, 22, 36, 100);
    strokeWeight(0.8);
    fill(this.color);
    rect(0, 2, this.width * CONFIG.CELL_SIZE, this.height * CONFIG.CELL_SIZE - 2, 5);

    noStroke();
    fill(this.id === 1 ? color(255, 135, 135, 115) : color(150, 175, 255, 120));
    rect(4, 5, this.width * CONFIG.CELL_SIZE - 8, this.height * CONFIG.CELL_SIZE * 0.32, 3.2);

    fill(this.id === 1 ? color(230, 80, 80) : color(70, 110, 230));
    rect(this.width * CONFIG.CELL_SIZE * 0.18, 1, this.width * CONFIG.CELL_SIZE * 0.5, this.height * CONFIG.CELL_SIZE * 0.58, 3);

    fill(255, 255, 255, 90);
    rect(this.width * CONFIG.CELL_SIZE * 0.23, 3, this.width * CONFIG.CELL_SIZE * 0.16, this.height * CONFIG.CELL_SIZE * 0.14, 1.6);

    fill(15, 20, 30, 75);
    rect(this.width * CONFIG.CELL_SIZE * 0.67, 7, this.width * CONFIG.CELL_SIZE * 0.16, this.height * CONFIG.CELL_SIZE * 0.18, 2);
    pop();
  }

  isHit(px, py) {
    const tx = this.x * CONFIG.CELL_SIZE;
    const ty = this.y * CONFIG.CELL_SIZE;
    const tw = this.width * CONFIG.CELL_SIZE;
    const th = this.height * CONFIG.CELL_SIZE;
    return (px >= tx && px <= tx + tw && py >= ty && py <= ty + th);
  }
}