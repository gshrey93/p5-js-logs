// Cyber Retro Space Shooter ("NEON STRIKE")
// Created in p5.js with glowing neon vector graphics and Web Audio API synthesis

// Global state variables attached to window for test visibility & control
window.particles = [];
window.projectiles = [];
window.enemies = [];
window.powerups = [];
window.floatingTexts = [];
window.gameState = 'START'; // START, PLAYING, GAMEOVER
window.score = 0;
window.highScore = 0;
window.level = 1;
window.bossActive = false;
window.shakeTime = 0;
window.shakeIntensity = 0;

let player;
let stars = [];
let gridY = 0;
let isMuted = false;

// Color Palette (Neon HSL)
const COLORS = {
  player: '#00e5ff',     // Cyan
  enemy: '#ff007f',      // Magenta
  boss: '#ff6b35',       // Orange
  projectile: '#00ff66', // Bright green
  powerup: '#ffff00',   // Neon yellow
  star: '#ffffff',
  grid: '#1a1d2e'
};

function setup() {
  const canvas = createCanvas(600, 650);
  canvas.parent('canvas-parent');

  // Initialize starfield
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      speed: random(0.8, 3.5),
      size: random(1, 3.5)
    });
  }

  // Load High Score
  highScore = localStorage.getItem('neon_strike_high_score') || 0;

  resetGame();
}

function draw() {
  background(10, 12, 22);

  // Apply screen shake
  if (shakeTime > 0) {
    let dx = random(-shakeIntensity, shakeIntensity);
    let dy = random(-shakeIntensity, shakeIntensity);
    translate(dx, dy);
    shakeTime--;
  }

  // Render Background
  drawGrid();
  drawStars();

  if (gameState === 'START') {
    drawStartScreen();
  } else if (gameState === 'PLAYING') {
    updateGame();
    drawGame();
  } else if (gameState === 'GAMEOVER') {
    drawGameOverScreen();
  }
}

// Reset game variables
function resetGame() {
  player = new Player();
  projectiles = [];
  enemies = [];
  particles = [];
  floatingTexts = [];
  powerups = [];
  score = 0;
  level = 1;
  bossActive = false;
}

// Handle inputs
function keyPressed() {
  if (gameState === 'START') {
    initAudioAndStart();
  } else if (gameState === 'GAMEOVER') {
    initAudioAndStart();
  } else if (gameState === 'PLAYING') {
    if (key === ' ' || keyCode === 32) {
      player.shoot();
    }
  }
}

function mousePressed() {
  if (gameState === 'START') {
    initAudioAndStart();
  } else if (gameState === 'GAMEOVER') {
    initAudioAndStart();
  } else if (gameState === 'PLAYING') {
    player.shoot();
  }
}

function initAudioAndStart() {
  if (window.sounds) {
    window.sounds.init();
    window.sounds.playLaser(); // Feedback play
  }
  resetGame();
  gameState = 'PLAYING';
  
  // Hide overlays
  document.getElementById('start-overlay').classList.add('hidden');
  document.getElementById('gameover-overlay').classList.add('hidden');
}

// Set screen shake
function triggerScreenShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeTime = duration;
}

// Drawing helper functions
function drawGrid() {
  stroke(30, 36, 56, 120);
  strokeWeight(1);
  
  // Vertical lines stretching into perspective
  for (let x = 0; x <= width; x += 40) {
    line(x, 0, x, height);
  }
  
  // Horizontal lines scrolling down
  gridY = (gridY + 1.5) % 40;
  for (let y = gridY; y < height; y += 40) {
    line(0, y, width, y);
  }
}

function drawStars() {
  noStroke();
  fill(255, 255, 255, 180);
  for (let star of stars) {
    ellipse(star.x, star.y, star.size, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

// Game State: Update
function updateGame() {
  // Move and Update Player
  player.update();

  // Handle Powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.update();
    if (p.hits(player)) {
      player.applyPowerup(p.type);
      floatingTexts.push(new FloatingText(p.x, p.y, p.type.toUpperCase() + "!", COLORS.powerup));
      if (window.sounds) window.sounds.playPowerup();
      powerups.splice(i, 1);
      continue;
    }
    if (p.isOffscreen()) {
      powerups.splice(i, 1);
    }
  }

  // Handle Projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];
    proj.update();

    if (proj.isOffscreen()) {
      projectiles.splice(i, 1);
      continue;
    }

    // Player Projectile hitting Enemy
    if (proj.isPlayer) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        let enemy = enemies[j];
        if (proj.hits(enemy)) {
          enemy.damage(proj.damage);
          projectiles.splice(i, 1);
          break;
        }
      }
    } 
    // Enemy Projectile hitting Player
    else {
      if (proj.hits(player)) {
        player.damage(proj.damage);
        projectiles.splice(i, 1);
      }
    }
  }

  // Handle Enemies
  spawnEnemies();
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    enemy.update();

    // Check collision with player
    if (enemy.hits(player)) {
      player.damage(enemy.collisionDamage);
      enemy.explode();
      enemies.splice(i, 1);
      if (enemy.isBoss) bossActive = false;
      continue;
    }

    if (enemy.isDead()) {
      // Chance of dropping powerup
      if (random() < 0.25 || enemy.isBoss) {
        powerups.push(new Powerup(enemy.x, enemy.y));
      }
      
      score += enemy.scoreValue;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon_strike_high_score', highScore);
      }
      
      floatingTexts.push(new FloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, enemy.isBoss ? COLORS.boss : COLORS.enemy));
      enemy.explode();
      
      if (enemy.isBoss) bossActive = false;
      enemies.splice(i, 1);
      continue;
    }

    if (enemy.isOffscreen()) {
      enemies.splice(i, 1);
      if (enemy.isBoss) bossActive = false;
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  // Floating text
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    if (floatingTexts[i].isFinished()) {
      floatingTexts.splice(i, 1);
    }
  }

  // Update level based on score
  level = floor(score / 1500) + 1;

  // Sync to HUD elements in HTML
  document.getElementById('hud-score').innerText = score;
  document.getElementById('hud-high-score').innerText = highScore;
  document.getElementById('hud-level').innerText = level;
}

// Spawning system
let lastSpawnTime = 0;
function spawnEnemies() {
  let spawnDelay = max(1000 - level * 100, 400);

  if (score > 0 && score % 2000 === 0 && !bossActive && enemies.length === 0) {
    // Spawn Boss!
    enemies.push(new Enemy('boss'));
    bossActive = true;
    floatingTexts.push(new FloatingText(width / 2, height / 2, "BOSS INCOMING!", COLORS.boss));
    if (window.sounds) window.sounds.playPowerup();
  } 

  if (millis() - lastSpawnTime > spawnDelay && !bossActive) {
    let spawnCount = floor(random(1, min(2 + level / 2, 5)));
    for (let k = 0; k < spawnCount; k++) {
      let rand = random();
      let type = 'drone';
      if (rand > 0.85 && level >= 3) {
        type = 'shooter';
      } else if (rand > 0.6 && level >= 2) {
        type = 'swarmer';
      }
      enemies.push(new Enemy(type));
    }
    lastSpawnTime = millis();
  }
}

// Game State: Draw
function drawGame() {
  // Draw player
  player.draw();

  // Draw powerups
  for (let p of powerups) {
    p.draw();
  }

  // Draw projectiles
  for (let proj of projectiles) {
    proj.draw();
  }

  // Draw enemies
  for (let enemy of enemies) {
    enemy.draw();
  }

  // Draw particles
  for (let p of particles) {
    p.draw();
  }

  // Draw floating text
  for (let ft of floatingTexts) {
    ft.draw();
  }
}

function drawStartScreen() {
  // Start overlay is rendered in HTML/CSS for rich glassmorphism. Just draw subtle canvas guide lines.
  stroke(COLORS.player);
  strokeWeight(2);
  noFill();
  ellipse(width/2, height/2, 100, 100);
  line(width/2 - 70, height/2, width/2 + 70, height/2);
  line(width/2, height/2 - 70, width/2, height/2 + 70);
}

function drawGameOverScreen() {
  // GameOver overlay is handled in HTML/CSS. Draw cool game-over canvas graphics.
  stroke(COLORS.enemy);
  strokeWeight(2);
  noFill();
  ellipse(width/2, height/2, 150 + sin(frameCount * 0.1) * 10, 150 + sin(frameCount * 0.1) * 10);
  line(0, height/2, width, height/2);
}

// ==========================================
// CLASSES
// ==========================================

class Player {
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
      particles.push(new Particle(this.x, this.y + this.height/2, random(-1, 1), random(2, 4), COLORS.player, 8));
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
    document.getElementById('hud-powerup').innerText = pwrLabel;
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
      projectiles.push(new Projectile(this.x, this.y - this.height/2, 0, vy, true, type));
      let sideVy = isBeam ? -11.5 : -7.5;
      projectiles.push(new Projectile(this.x, this.y - this.height/2, -2, sideVy, true, type));
      projectiles.push(new Projectile(this.x, this.y - this.height/2, 2, sideVy, true, type));
    } else {
      projectiles.push(new Projectile(this.x, this.y - this.height/2, 0, vy, true, type));
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
      particles.push(new Particle(this.x, this.y, random(-4, 4), random(-4, 4), COLORS.enemy, 15));
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
    gameState = 'GAMEOVER';
    
    // Spawn massive explosion
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(this.x, this.y, random(-8, 8), random(-8, 8), COLORS.player, 25));
    }

    document.getElementById('final-score').innerText = score;
    document.getElementById('gameover-overlay').classList.remove('hidden');
  }
}

class Projectile {
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

class Enemy {
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
      this.health = 400 + level * 100;
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
          projectiles.push(new Projectile(this.x - 30, this.y + 20, -1, 5, false));
          projectiles.push(new Projectile(this.x, this.y + 35, 0, 5.5, false));
          projectiles.push(new Projectile(this.x + 30, this.y + 20, 1, 5, false));
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
          projectiles.push(new Projectile(this.x, this.y + this.height/2, 0, 5, false));
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
      let hpWidth = map(this.health, 0, 400 + level * 100, 0, 100);
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
      particles.push(new Particle(this.x, this.y, random(-3, 3), random(-3, 3), this.color, 10));
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
      particles.push(new Particle(this.x, this.y, random(-6, 6), random(-6, 6), this.color, this.isBoss ? 24 : 14));
    }
  }
}

class Powerup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 1.8;
    
    // Randomly choose powerup type
    const types = ['shield', 'triple', 'beam', 'repair'];
    this.type = random(types);
    
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

class Particle {
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

class FloatingText {
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Player, Projectile, Enemy, Powerup, Particle, FloatingText, COLORS };
}

