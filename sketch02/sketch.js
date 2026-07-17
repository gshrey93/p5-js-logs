// sketch.js — Main orchestrator
// Wires up p5.js lifecycle and delegates to each module.

import { CONFIG, GAME_STATE } from './config.js';
import { Dino } from './dino.js';
import { Obstacle } from './obstacle.js';
import { Booster, ActiveBooster, createRandomBooster, BOOSTER_TYPE } from './booster.js';
import {
  envState, initEnvironment, updateColors,
  drawBackground, drawGround, updateBackgroundElements,
} from './environment.js';

// ============================================================
// GAME STATE
// ============================================================

let gameState = GAME_STATE.START;
let score = 0;
let highScore = parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
let gameSpeed = CONFIG.INITIAL_SPEED;

let dino;
let obstacles = [];
let boosters = [];
let activeBooster = new ActiveBooster();

// Spawning timers
let obstacleTimer = 0;
let nextObstacleTime = 0;
let boosterTimer = 0;
let nextBoosterTime = 0;

// Collision feedback
let screenShake = 0;
let redFlashAlpha = 0;
let deathSlowMo = 0;
let collisionParticles = [];

// Score milestone flash
let milestoneFlash = 0;
let lastMilestone = 0;

// ============================================================
// p5.js LIFECYCLE
// ============================================================

window.setup = function () {
  const canvas = createCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  canvas.parent('main');
  textFont('monospace');
  noSmooth();

  initEnvironment();
  resetGame();
};

function resetGame() {
  score = 0;
  gameSpeed = CONFIG.INITIAL_SPEED;
  obstacles = [];
  boosters = [];
  activeBooster = new ActiveBooster();
  obstacleTimer = 0;
  boosterTimer = 0;
  setNextObstacleTime();
  setNextBoosterTime();
  screenShake = 0;
  redFlashAlpha = 0;
  deathSlowMo = 0;
  collisionParticles = [];
  milestoneFlash = 0;
  lastMilestone = 0;

  dino = new Dino();
  initEnvironment();
}

window.draw = function () {
  updateColors();

  // Apply screen shake offset
  push();
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;
  }

  switch (gameState) {
    case GAME_STATE.START:
      drawBackground();
      drawGround();
      drawStartScreen();
      break;
    case GAME_STATE.PLAY:
      handleGameLogic();
      drawGameElements();
      break;
    case GAME_STATE.GAME_OVER:
      if (deathSlowMo > 0) {
        deathSlowMo--;
        // During slow-mo: still draw but don't update
      }
      drawGameElements();
      drawCollisionFeedback();
      if (deathSlowMo <= 0) {
        drawGameOverScreen();
      }
      break;
  }

  pop();
};

// ============================================================
// INPUT
// ============================================================

window.keyPressed = function () {
  if (gameState === GAME_STATE.PLAY && (key === ' ' || keyCode === UP_ARROW)) {
    dino.jump();
  } else if (gameState === GAME_STATE.PLAY && keyCode === DOWN_ARROW) {
    dino.crouch();
  } else if (gameState === GAME_STATE.START || gameState === GAME_STATE.GAME_OVER) {
    if (deathSlowMo > 0) return; // don't restart during slow-mo
    resetGame();
    gameState = GAME_STATE.PLAY;
  }
};

window.keyReleased = function () {
  if (keyCode === DOWN_ARROW && dino) {
    dino.uncrouch();
  }
};

window.mousePressed = function () {
  if (gameState === GAME_STATE.PLAY) {
    dino.jump();
  } else if (gameState === GAME_STATE.START || gameState === GAME_STATE.GAME_OVER) {
    if (deathSlowMo > 0) return;
    resetGame();
    gameState = GAME_STATE.PLAY;
  }
};

// ============================================================
// GAME LOGIC
// ============================================================

function handleGameLogic() {
  // Apply slow-mo booster
  let effectiveSpeed = gameSpeed;
  if (activeBooster.isActive(BOOSTER_TYPE.SLOW_MO)) {
    effectiveSpeed = gameSpeed * 0.3;
  } else if (activeBooster.isActive(BOOSTER_TYPE.SPEED_BURST)) {
    effectiveSpeed = gameSpeed * 2;
  }

  dino.update();
  updateObstacles(effectiveSpeed);
  updateBoosters(effectiveSpeed);
  updateBackgroundElements(effectiveSpeed);
  activeBooster.update();

  // Score — speed burst gives 2× score
  let scoreMultiplier = activeBooster.isActive(BOOSTER_TYPE.SPEED_BURST) ? 2 : 1;
  score += 0.1 * (effectiveSpeed / CONFIG.INITIAL_SPEED) * scoreMultiplier;

  // Difficulty ramp
  gameSpeed += CONFIG.SPEED_INCREASE;

  // Score milestones
  checkScoreMilestone();

  // Update collision particles
  updateCollisionParticles();
}

// ============================================================
// OBSTACLES
// ============================================================

function updateObstacles(effectiveSpeed) {
  obstacleTimer += deltaTime;
  if (obstacleTimer > nextObstacleTime) {
    obstacles.push(new Obstacle(effectiveSpeed, score));
    setNextObstacleTime();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update(effectiveSpeed);

    if (obstacles[i].isOffscreen()) {
      // Obstacle passed — increment streak
      if (!obstacles[i].scored) {
        dino.incrementStreak();
        obstacles[i].scored = true;
      }
      obstacles.splice(i, 1);
      continue; // FIX #1: skip collision check after splice
    }

    // Mark as passed if dino has cleared it
    if (!obstacles[i].scored && obstacles[i].x + obstacles[i].w < dino.x) {
      obstacles[i].scored = true;
      dino.incrementStreak();
    }

    // Collision check
    if (obstacles[i].collidesWith(dino)) {
      // Check for speed burst invincibility
      if (activeBooster.isActive(BOOSTER_TYPE.SPEED_BURST)) {
        continue; // invincible during speed burst
      }

      // Check for shield
      if (activeBooster.absorbHit()) {
        // Shield absorbed the hit — spawn particles but continue
        spawnCollisionParticles(obstacles[i].x, obstacles[i].y);
        obstacles.splice(i, 1);
        continue;
      }

      // Game over with collision feedback
      triggerGameOver(obstacles[i].x, obstacles[i].y);
      return;
    }
  }
}

function setNextObstacleTime() {
  obstacleTimer = 0;
  let baseTime = 1500;
  nextObstacleTime = random(baseTime, baseTime * 1.5) / (gameSpeed / CONFIG.INITIAL_SPEED);
}

// ============================================================
// BOOSTERS
// ============================================================

function updateBoosters(effectiveSpeed) {
  boosterTimer += deltaTime;
  if (boosterTimer > nextBoosterTime) {
    boosters.push(createRandomBooster(effectiveSpeed));
    setNextBoosterTime();
  }

  for (let i = boosters.length - 1; i >= 0; i--) {
    boosters[i].update(effectiveSpeed);

    if (boosters[i].isOffscreen()) {
      boosters.splice(i, 1);
      continue;
    }

    if (boosters[i].collidesWith(dino)) {
      activeBooster.activate(boosters[i].type);
      boosters[i].collected = true;
      boosters.splice(i, 1);
    }
  }
}

function setNextBoosterTime() {
  boosterTimer = 0;
  // Boosters are rarer than obstacles: every 10-20 seconds
  nextBoosterTime = random(10000, 20000) / (gameSpeed / CONFIG.INITIAL_SPEED);
}

// ============================================================
// COLLISION FEEDBACK
// ============================================================

function triggerGameOver(collisionX, collisionY) {
  gameState = GAME_STATE.GAME_OVER;
  screenShake = 12;
  redFlashAlpha = 180;
  deathSlowMo = 30;
  dino.resetStreak();

  spawnCollisionParticles(collisionX, collisionY);

  // Save high score
  if (score > highScore) {
    highScore = floor(score);
    localStorage.setItem('dinoHighScore', String(highScore));
  }
}

function spawnCollisionParticles(cx, cy) {
  for (let i = 0; i < 15; i++) {
    collisionParticles.push({
      x: cx,
      y: cy,
      vx: random(-4, 4),
      vy: random(-6, 2),
      size: random(3, 8),
      life: 40,
      color: random() > 0.5
        ? { r: 255, g: 100, b: 50 }
        : { r: 255, g: 220, b: 80 },
    });
  }
}

function updateCollisionParticles() {
  for (let i = collisionParticles.length - 1; i >= 0; i--) {
    const p = collisionParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
    p.life--;
    if (p.life <= 0) {
      collisionParticles.splice(i, 1);
    }
  }
}

function drawCollisionFeedback() {
  // Red flash overlay
  if (redFlashAlpha > 0) {
    noStroke();
    fill(255, 0, 0, redFlashAlpha);
    rect(0, 0, width, height);
    redFlashAlpha *= 0.9;
    if (redFlashAlpha < 2) redFlashAlpha = 0;
  }

  // Collision particles
  noStroke();
  collisionParticles.forEach(p => {
    const alpha = map(p.life, 0, 40, 0, 255);
    fill(p.color.r, p.color.g, p.color.b, alpha);
    rect(p.x, p.y, p.size, p.size);
  });
}

// ============================================================
// SCORE MILESTONES
// ============================================================

function checkScoreMilestone() {
  const s = floor(score);
  const milestones = [100, 500, 1000, 2000, 5000, 10000];
  for (const m of milestones) {
    if (s >= m && lastMilestone < m) {
      lastMilestone = m;
      milestoneFlash = 40;
    }
  }
}

function drawMilestoneFlash() {
  if (milestoneFlash <= 0) return;

  milestoneFlash--;
  const alpha = map(milestoneFlash, 0, 40, 0, 120);

  noStroke();
  fill(255, 255, 255, alpha);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255, 220, 50, alpha * 2);
  stroke(0, 0, 0, alpha);
  strokeWeight(3);
  text(`${lastMilestone}!`, width / 2, height / 2 - 40);
}

// ============================================================
// DRAWING
// ============================================================

function drawGameElements() {
  drawBackground();

  // Boosters
  boosters.forEach(b => b.draw());

  // Obstacles
  obstacles.forEach(obs => obs.draw(envState.timeOfDay));

  // Dino
  dino.draw(envState.timeOfDay);

  drawGround();
  drawHUD();
  activeBooster.draw();
  drawMilestoneFlash();
  drawCollisionFeedback();
}

function drawHUD() {
  // Current score
  fill(255);
  stroke(0);
  strokeWeight(3);
  textAlign(LEFT);
  textSize(20);
  text(`SCORE: ${floor(score).toString().padStart(5, '0')}`, 20, 30);

  // High score
  textAlign(RIGHT);
  const isNewHigh = floor(score) > highScore && gameState === GAME_STATE.PLAY;
  if (isNewHigh) {
    // Flash effect for new high score
    fill(255, 220, 50, 200 + sin(frameCount * 0.3) * 55);
  } else {
    fill(200);
  }
  text(`HI: ${highScore.toString().padStart(5, '0')}`, width - 20, 30);

  // Streak display
  if (dino && dino.streakCount > 0 && gameState === GAME_STATE.PLAY) {
    textAlign(LEFT);
    textSize(14);
    noStroke();
    fill(255, 255, 100);
    text(`🔥 Streak: ${dino.streakCount}`, 20, 55);
  }
}

function drawStartScreen() {
  fill(255);
  stroke(0);
  strokeWeight(5);
  textAlign(CENTER, CENTER);

  textSize(50);
  text('PIXEL DINO RUN', width / 2, height / 2 - 80);

  textSize(22);
  text('Press SPACE / Click to JUMP', width / 2, height / 2 - 10);

  textSize(18);
  fill(200);
  text('DOWN ARROW to CROUCH', width / 2, height / 2 + 25);

  textSize(20);
  fill(255);
  text('Press ANY KEY or Click to START', width / 2, height / 2 + 65);

  // Show high score if exists
  if (highScore > 0) {
    textSize(16);
    fill(255, 220, 50);
    noStroke();
    text(`Best: ${highScore}`, width / 2, height / 2 + 100);
  }
}

function drawGameOverScreen() {
  // Semi-transparent backdrop
  noStroke();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  fill(255, 50, 50);
  stroke(0);
  strokeWeight(7);
  textAlign(CENTER, CENTER);

  textSize(60);
  text('GAME OVER', width / 2, height / 2 - 80);

  fill(255);
  strokeWeight(5);
  textSize(30);
  text(`Score: ${floor(score)}`, width / 2, height / 2 - 10);

  // High score
  textSize(22);
  if (floor(score) >= highScore) {
    fill(255, 220, 50);
    text(`🏆 NEW HIGH SCORE! 🏆`, width / 2, height / 2 + 30);
  } else {
    fill(200);
    text(`Best: ${highScore}`, width / 2, height / 2 + 30);
  }

  textSize(18);
  fill(255);
  text('Press ANY KEY or Click to RESTART', width / 2, height / 2 + 70);
}
