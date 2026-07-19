import { state, triggerScreenShake } from './src/state.js';
import { COLORS } from './src/constants.js';
import { Player } from './src/components/Player.js';
import { Enemy } from './src/components/Enemy.js';
import { Powerup } from './src/components/Powerup.js';
import { FloatingText } from './src/components/FloatingText.js';

let player;
let stars = [];
let gridY = 0;
let lastSpawnTime = 0;

window.setup = function() {
  const canvas = createCanvas(600, 650);
  canvas.parent('canvas-parent');

  for (let i = 0; i < 70; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      speed: random(0.8, 3.5),
      size: random(1, 3.5)
    });
  }

  state.highScore = localStorage.getItem('neon_strike_high_score') || 0;
  resetGame();
};

window.draw = function() {
  background(10, 12, 22);

  if (state.shakeTime > 0) {
    let dx = random(-state.shakeIntensity, state.shakeIntensity);
    let dy = random(-state.shakeIntensity, state.shakeIntensity);
    translate(dx, dy);
    state.shakeTime--;
  }

  drawGrid();
  drawStars();

  if (state.gameState === 'START') {
    drawStartScreen();
  } else if (state.gameState === 'PLAYING') {
    updateGame();
    drawGame();
  } else if (state.gameState === 'GAMEOVER') {
    drawGameOverScreen();
  }
};

function resetGame() {
  player = new Player();
  window.player = player;

  state.projectiles = [];
  state.enemies = [];
  state.particles = [];
  state.floatingTexts = [];
  state.powerups = [];
  state.score = 0;
  state.level = 1;
  state.bossActive = false;
  state.gameState = 'START';
}

window.keyPressed = function() {
  if (state.gameState === 'START') {
    window.initAudioAndStart();
  } else if (state.gameState === 'GAMEOVER') {
    window.initAudioAndStart();
  } else if (state.gameState === 'PLAYING') {
    if (key === ' ' || keyCode === 32) {
      player.shoot();
    }
  }
};

window.mousePressed = function() {
  if (state.gameState === 'START') {
    window.initAudioAndStart();
  } else if (state.gameState === 'GAMEOVER') {
    window.initAudioAndStart();
  } else if (state.gameState === 'PLAYING') {
    player.shoot();
  }
};

window.initAudioAndStart = function() {
  if (window.sounds) {
    window.sounds.init();
    window.sounds.playLaser();
  }
  resetGame();
  state.gameState = 'PLAYING';
  
  let startEl = document.getElementById('start-overlay');
  let gameoverEl = document.getElementById('gameover-overlay');
  if (startEl) startEl.classList.add('hidden');
  if (gameoverEl) gameoverEl.classList.add('hidden');
};

function drawGrid() {
  stroke(30, 36, 56, 120);
  strokeWeight(1);
  for (let x = 0; x <= width; x += 40) {
    line(x, 0, x, height);
  }
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

function updateGame() {
  player.update();

  for (let i = state.powerups.length - 1; i >= 0; i--) {
    let p = state.powerups[i];
    p.update();
    if (p.hits(player)) {
      player.applyPowerup(p.type);
      state.floatingTexts.push(new FloatingText(p.x, p.y, p.type.toUpperCase() + "!", COLORS.powerup));
      if (window.sounds) window.sounds.playPowerup();
      state.powerups.splice(i, 1);
      continue;
    }
    if (p.isOffscreen()) {
      state.powerups.splice(i, 1);
    }
  }

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    let proj = state.projectiles[i];
    proj.update();

    if (proj.isOffscreen()) {
      state.projectiles.splice(i, 1);
      continue;
    }

    if (proj.isPlayer) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        let enemy = state.enemies[j];
        if (proj.hits(enemy)) {
          enemy.damage(proj.damage);
          state.projectiles.splice(i, 1);
          break;
        }
      }
    } 
    else {
      if (proj.hits(player)) {
        player.damage(proj.damage);
        state.projectiles.splice(i, 1);
      }
    }
  }

  spawnEnemies();
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    let enemy = state.enemies[i];
    enemy.update();

    if (enemy.hits(player)) {
      player.damage(enemy.collisionDamage);
      enemy.explode();
      state.enemies.splice(i, 1);
      if (enemy.isBoss) state.bossActive = false;
      continue;
    }

    if (enemy.isDead()) {
      if (random() < 0.25 || enemy.isBoss) {
        state.powerups.push(new Powerup(enemy.x, enemy.y));
      }
      
      state.score += enemy.scoreValue;
      if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('neon_strike_high_score', state.highScore);
      }
      
      state.floatingTexts.push(new FloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, enemy.isBoss ? COLORS.boss : COLORS.enemy));
      enemy.explode();
      
      if (enemy.isBoss) state.bossActive = false;
      state.enemies.splice(i, 1);
      continue;
    }

    if (enemy.isOffscreen()) {
      state.enemies.splice(i, 1);
      if (enemy.isBoss) state.bossActive = false;
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    state.particles[i].update();
    if (state.particles[i].isFinished()) {
      state.particles.splice(i, 1);
    }
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    state.floatingTexts[i].update();
    if (state.floatingTexts[i].isFinished()) {
      state.floatingTexts.splice(i, 1);
    }
  }

  state.level = floor(state.score / 1500) + 1;

  let scoreEl = document.getElementById('hud-score');
  let hiEl = document.getElementById('hud-high-score');
  let levelEl = document.getElementById('hud-level');
  
  if (scoreEl) scoreEl.innerText = state.score;
  if (hiEl) hiEl.innerText = state.highScore;
  if (levelEl) levelEl.innerText = state.level;
}

function spawnEnemies() {
  let spawnDelay = max(1000 - state.level * 100, 400);

  if (state.score > 0 && state.score % 2000 === 0 && !state.bossActive && state.enemies.length === 0) {
    state.enemies.push(new Enemy('boss'));
    state.bossActive = true;
    state.floatingTexts.push(new FloatingText(width / 2, height / 2, "BOSS INCOMING!", COLORS.boss));
    if (window.sounds) window.sounds.playPowerup();
  } 

  if (millis() - lastSpawnTime > spawnDelay && !state.bossActive) {
    let spawnCount = floor(random(1, min(2 + state.level / 2, 5)));
    for (let k = 0; k < spawnCount; k++) {
      let rand = random();
      let type = 'drone';
      if (rand > 0.85 && state.level >= 3) {
        type = 'shooter';
      } else if (rand > 0.6 && state.level >= 2) {
        type = 'swarmer';
      }
      state.enemies.push(new Enemy(type));
    }
    lastSpawnTime = millis();
  }
}

function drawGame() {
  player.draw();
  for (let p of state.powerups) p.draw();
  for (let proj of state.projectiles) proj.draw();
  for (let enemy of state.enemies) enemy.draw();
  for (let p of state.particles) p.draw();
  for (let ft of state.floatingTexts) ft.draw();
}

function drawStartScreen() {
  stroke(COLORS.player);
  strokeWeight(2);
  noFill();
  ellipse(width/2, height/2, 100, 100);
  line(width/2 - 70, height/2, width/2 + 70, height/2);
  line(width/2, height/2 - 70, width/2, height/2 + 70);
}

function drawGameOverScreen() {
  stroke(COLORS.enemy);
  strokeWeight(2);
  noFill();
  ellipse(width/2, height/2, 150 + sin(frameCount * 0.1) * 10, 150 + sin(frameCount * 0.1) * 10);
  line(0, height/2, width, height/2);
}

window.state = state;
