export class Particle {
  constructor(x, y, vx, vy, color, maxLife = 15) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.size = random(2, 6);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    let alpha = map(this.life, 0, this.maxLife, 0, 255);
    push();
    noStroke();
    let col = color(this.color);
    col.setAlpha(alpha);
    fill(col);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }

  isFinished() {
    return this.life <= 0;
  }
}
