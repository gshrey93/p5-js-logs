import { COLORS } from '../constants.js';

export class Powerup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 1.8;
    
    // Weighted selection to make repair powerups rarer (10% chance) and increase difficulty
    const rand = random();
    if (rand < 0.35) {
      this.type = 'triple';
    } else if (rand < 0.70) {
      this.type = 'beam';
    } else if (rand < 0.90) {
      this.type = 'shield';
    } else {
      this.type = 'repair';
    }
    
    this.color = COLORS.powerup;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    push();
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = this.color;
    stroke(this.color);
    strokeWeight(2);
    fill(0, 0, 0, 150);

    // Draw pentagram/circle powerup container
    ellipse(this.x, this.y, this.size, this.size);
    
    // Draw character identifier
    noStroke();
    fill(255);
    textSize(10);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    
    let letter = "S";
    if (this.type === 'triple') letter = "T";
    else if (this.type === 'beam') letter = "B";
    else if (this.type === 'repair') letter = "H"; // Heart / heal
    
    text(letter, this.x, this.y);
    pop();
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < (this.size/2 + player.width/2);
  }

  isOffscreen() {
    return this.y > height + 50;
  }
}
