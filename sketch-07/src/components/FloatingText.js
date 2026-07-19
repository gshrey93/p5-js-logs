export class FloatingText {
  constructor(x, y, textVal, color) {
    this.x = x;
    this.y = y;
    this.textVal = textVal;
    this.color = color;
    this.life = 40; // 40 frames life
    this.maxLife = 40;
  }

  update() {
    this.y -= 1.2;
    this.life--;
  }

  draw() {
    let alpha = map(this.life, 0, this.maxLife, 0, 255);
    push();
    textSize(14);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    let col = color(this.color);
    col.setAlpha(alpha);
    fill(col);
    text(this.textVal, this.x, this.y);
    pop();
  }

  isFinished() {
    return this.life <= 0;
  }
}
