import { CONFIG, GAME_STATE } from './config.js';
import { Tank } from './tank.js';

// Note: Many functions have been moved to other modules or refactored.
// This file now serves as the main orchestrator.
// For brevity, the full content of new modules is not shown here,
// but they contain the logic previously in this file.

let cols, rows;
let grid = []; // 0: Air, 1: Sand, 2: Stone
 
// --- GAME STATE ---
let gameState = GAME_STATE.P1_TURN;
let tank1, tank2;
let currentProjectile = null;
let impactEffects = [];
let launchSparks = [];
let clouds = [];
// DOM / UI helpers
let gameOverlay;
let gameStatusText;
let restartButton;

// Sound Effects
let fireSound, explosionSound;

// Environment Modifiers
let wind = 0; 
let gravityForce = 0.2; // Baseline is 0.2

function preload() {
  // Ensure you have these files in an 'assets' folder
  // inside the sketch-03 directory.
  soundFormats('wav', 'mp3');
  fireSound = loadSound('assets/fire.wav');
  explosionSound = loadSound('assets/explosion.wav');
}

// Make p5.js functions global
window.preload = preload;

window.setup = function() {
  const canvas = createCanvas(800, 600);
  canvas.parent('main');
  cols = width / CONFIG.CELL_SIZE;
  rows = height / CONFIG.CELL_SIZE;

  gameOverlay = document.getElementById('game-overlay');
  gameStatusText = document.getElementById('game-status');
  restartButton = document.getElementById('restart-btn');

  if (restartButton) {
    restartButton.addEventListener('click', resetGame);
  }

  resetGame();
}

window.resetGame = function() {
  generateTerrain();

  // Initialize initial weather/gravity
  wind = random(-0.02, 0.02);
  gravityForce = random(0.1, 0.35); // 0.1 is floaty, 0.35 is heavy

  // Initialize Tanks
  tank1 = new Tank(1, floor(cols * 0.15), color(220, 65, 65), -45);
  tank2 = new Tank(2, floor(cols * 0.85), color(60, 105, 230), -135);
  currentProjectile = null;
  impactEffects = [];
  launchSparks = [];
  clouds = createClouds();
  gameState = "P1_TURN";
  dropTanksToGround();
  syncGameOverlay();
}

window.syncGameOverlay = function() {
  if (!gameOverlay || !gameStatusText) return;

  if (gameState === GAME_STATE.GAME_OVER) {
    gameOverlay.classList.remove('hidden');
    let winner = tank1.health > tank2.health ? "Player 1 wins!" : tank2.health > tank1.health ? "Player 2 wins!" : "It is a draw!";
    gameStatusText.textContent = `Match complete — ${winner}`;
  } else {
    gameOverlay.classList.add('hidden');
  }
}

window.draw = function() {
  drawSkyBackdrop();
  drawClouds();
  
  if (gameState === GAME_STATE.P1_TURN || gameState === GAME_STATE.P2_TURN) {
    handleInput(); 
  }

  updateImpactEffects();
  updateLaunchSparks();
  drawTerrain();
  drawTanks();
  drawLaunchSparks();
  
  if (gameState === "PROJECTILE_AIRBORNE" && currentProjectile) {
    updateProjectile();
    if (currentProjectile) {
      drawProjectile();
    }
  }

  drawAimLine();
  drawImpactEffects();
  drawUI();
  drawWindIndicator();
}

// --- INPUT & FIRING ---
window.handleInput = function() {
  let activeTank = gameState === GAME_STATE.P1_TURN ? tank1 : tank2;
  
  // Aiming (Same for both)
  if (keyIsDown(UP_ARROW)) activeTank.angle -= 1; 
  if (keyIsDown(DOWN_ARROW)) activeTank.angle += 1;
  activeTank.angle = constrain(activeTank.angle, -180, 0);

  // Power (Inverted for P2 for better ergonomics) - simplified
  const powerDirection = (activeTank.id === 1) ? 1 : -1;
  if (keyIsDown(RIGHT_ARROW)) activeTank.power += 0.5 * powerDirection;
  if (keyIsDown(LEFT_ARROW)) activeTank.power -= 0.5 * powerDirection;
  activeTank.power = constrain(activeTank.power, 0, 100);
}

window.keyPressed = function() {
  if (keyCode === 82) { // R
    resetGame();
    return;
  }

  if (keyCode === 32) { // Spacebar
    if (gameState === GAME_STATE.P1_TURN && tank1.shotsLeft > 0) fire(tank1);
    else if (gameState === GAME_STATE.P2_TURN && tank2.shotsLeft > 0) fire(tank2);
  }
}

window.fire = function(tank) {
  if (fireSound.isLoaded()) fireSound.play();

  tank.shotsLeft--;
  let angleInRadians = radians(tank.angle);
  let launchSpeed = tank.power * CONFIG.PROJECTILE_SPEED_SCALE; 
  
  let startX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE + cos(angleInRadians) * 20;
  let startY = tank.y * CONFIG.CELL_SIZE + sin(angleInRadians) * 20;
  
  let isBigShot = tank.isBigShotReady();
  if (isBigShot) tank.consecutiveHits = 0; 

  spawnLaunchSparks(startX, startY, angleInRadians, isBigShot);

  currentProjectile = {
    pos: createVector(startX, startY),
    vel: createVector(cos(angleInRadians) * launchSpeed, sin(angleInRadians) * launchSpeed),
    gravity: createVector(0, gravityForce), // Use the dynamic gravity
    ownerId: tank.id,
    isBigPowerup: isBigShot,
    restingTimer: 0, // Track stationary time
    trail: [],
    trailMax: isBigShot ? 18 : 12
 };
  
  gameState = GAME_STATE.PROJECTILE_AIRBORNE;
}

// --- PHYSICS & COLLISION ---
window.updateProjectile = function() {
  currentProjectile.trail.push({ x: currentProjectile.pos.x, y: currentProjectile.pos.y });
  if (currentProjectile.trail.length > currentProjectile.trailMax) {
    currentProjectile.trail.shift();
  }

  currentProjectile.vel.add(currentProjectile.gravity);
  currentProjectile.vel.x += wind; // Apply dynamic wind
  
  let nextX = currentProjectile.pos.x + currentProjectile.vel.x;
  let nextY = currentProjectile.pos.y + currentProjectile.vel.y;
  
  let gridX = floor(nextX / CONFIG.CELL_SIZE);
  let gridY = floor(nextY / CONFIG.CELL_SIZE);
  
  if (gridX < 0 || gridX >= cols || nextY > height) {
    switchTurn();
    return;
  }
  
  if (gridY >= 0) {
    let cell = grid[gridX][gridY];
    if (cell === 2) { 
      currentProjectile.vel.y *= -0.7; 
      currentProjectile.vel.x *= 0.8;
      
      // Resting Logic: If velocity is near zero on stone, start timer
      if (abs(currentProjectile.vel.y) < 0.2 && abs(currentProjectile.vel.x) < 0.2) {
        currentProjectile.restingTimer++;
      }
      
      nextX = currentProjectile.pos.x;
      nextY = currentProjectile.pos.y;
    } else if (cell === 1) { 
      explode(currentProjectile.pos.x, currentProjectile.pos.y);
      switchTurn();
      return;
    }
  }
  
  // Edge Case: 2 second timeout (~120 frames) if projectile is stuck on stone
  if (currentProjectile.restingTimer > 120) {
    switchTurn();
    return;
  }

  if (tank1.isHit(nextX, nextY) || tank2.isHit(nextX, nextY)) {
    explode(currentProjectile.pos.x, currentProjectile.pos.y);
    switchTurn();
    return;
  }

  currentProjectile.pos.x = nextX;
  currentProjectile.pos.y = nextY;
}

// --- EXPLOSIONS & DAMAGE ---
window.explode = function(pixelX, pixelY) {
  if (explosionSound.isLoaded()) explosionSound.play();

  let isBig = currentProjectile.isBigPowerup;
  let blastRadiusPixels = isBig ? 60 : 40;
  let blastRadiusGrid = floor(blastRadiusPixels / CONFIG.CELL_SIZE);
  let gridX = floor(pixelX / CONFIG.CELL_SIZE);
  let gridY = floor(pixelY / CONFIG.CELL_SIZE);

  impactEffects.push({
    x: pixelX,
    y: pixelY,
    radius: isBig ? 14 : 10,
    growth: isBig ? 13 : 10,
    maxLife: isBig ? 18 : 12,
    life: isBig ? 18 : 12
  });
  
  for (let i = -blastRadiusGrid; i <= blastRadiusGrid; i++) {
    for (let j = -blastRadiusGrid; j <= blastRadiusGrid; j++) {
      if (i * i + j * j <= blastRadiusGrid * blastRadiusGrid) {
        let checkX = gridX + i; let checkY = gridY + j;
        if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows) {
          if (grid[checkX][checkY] === 1) grid[checkX][checkY] = 0; 
        }
      }
    }
  }
  
  let maxDmg = isBig ? 40 : 25;
  let minDmg = isBig ? 20 : 10;
  
  let dmgToP1 = applyDamage(tank1, pixelX, pixelY, blastRadiusPixels, maxDmg, minDmg);
  let dmgToP2 = applyDamage(tank2, pixelX, pixelY, blastRadiusPixels, maxDmg, minDmg);
  
  let activeTank = currentProjectile.ownerId === 1 ? tank1 : tank2;
  
  if (!isBig) {
    if (activeTank === tank1) {
      if (dmgToP2 >= 20) tank1.consecutiveHits++; else tank1.consecutiveHits = 0;
    } else if (activeTank === tank2) {
      if (dmgToP1 >= 20) tank2.consecutiveHits++; else tank2.consecutiveHits = 0;
    }
  }
}

window.applyDamage = function(tank, ex, ey, radius, maxDmg, minDmg) {
  let tankCenterX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE;
  let tankCenterY = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE;
  
  let d = dist(ex, ey, tankCenterX, tankCenterY);
  let maxHitDistance = radius + (tank.width * CONFIG.CELL_SIZE / 2);
  
  if (d < maxHitDistance) {
    let damage = map(d, 0, maxHitDistance, maxDmg, minDmg); 
    tank.applyDamage(damage);
    return damage; 
  }
  return 0; 
}

window.switchTurn = function() {
  let lastOwner = currentProjectile ? currentProjectile.ownerId : null;
  currentProjectile = null;

  if (tank1.health <= 0 || tank2.health <= 0 || (tank1.shotsLeft === 0 && tank2.shotsLeft === 0)) {
    gameState = GAME_STATE.GAME_OVER;
    syncGameOverlay();
    return;
  }

  if (lastOwner === 1) gameState = GAME_STATE.P2_TURN;
  else if (lastOwner === 2) gameState = GAME_STATE.P1_TURN;
  else gameState = gameState === GAME_STATE.P1_TURN ? GAME_STATE.P2_TURN : GAME_STATE.P1_TURN;

  // Randomize environment modifiers for the new turn
  wind = random(-0.02, 0.02);
  gravityForce = random(0.1, 0.35);

  dropTanksToGround();
  syncGameOverlay();
}

window.createClouds = function() {
  let created = [];
  for (let i = 0; i < 6; i++) {
    created.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.1, height * 0.32),
      w: random(60, 110),
      h: random(20, 36),
      speed: random(0.14, 0.42),
      alpha: random(0.18, 0.34)
    });
  }
  return created;
}

window.drawSkyBackdrop = function() {
  noStroke();

  let weatherShade = constrain(map(abs(wind), 0, 0.02, 0, 1), 0, 1);
  let topColor = lerpColor(color(82, 126, 193), color(54, 84, 140), weatherShade);
  let bottomColor = lerpColor(color(176, 222, 255), color(145, 191, 230), weatherShade);

  for (let y = 0; y < height; y += 4) {
    let t = map(y, 0, height, 0, 1);
    let skyColor = lerpColor(topColor, bottomColor, t);
    fill(skyColor);
    rect(0, y, width, 4);
  }

  fill(255, 240, 210, 24);
  ellipse(width * 0.18, height * 0.16, 95, 38);
  ellipse(width * 0.22, height * 0.14, 64, 24);
}

window.drawClouds = function() {
  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];
    cloud.x += cloud.speed * wind * 220;

    if (cloud.x > width + cloud.w) cloud.x = -cloud.w;
    if (cloud.x < -cloud.w) cloud.x = width + cloud.w;

    noStroke();
    fill(255, 255, 255, cloud.alpha * 255);
    ellipse(cloud.x, cloud.y, cloud.w, cloud.h);
    ellipse(cloud.x + cloud.w * 0.22, cloud.y - 8, cloud.w * 0.68, cloud.h * 0.78);
    ellipse(cloud.x - cloud.w * 0.22, cloud.y - 5, cloud.w * 0.56, cloud.h * 0.74);
    ellipse(cloud.x + cloud.w * 0.36, cloud.y + 3, cloud.w * 0.45, cloud.h * 0.66);
  }
}

// --- TERRAIN GENERATION ---
window.generateTerrain = function() {
  let surfaceOffset = random(1000);
  let stoneOffset = random(1000);
  
  for (let x = 0; x < cols; x++) {
    grid[x] = [];
    let surfaceY = map(noise(surfaceOffset + x * 0.02), 0, 1, rows * 0.4, rows * 0.8);
    for (let y = 0; y < rows; y++) {
      if (y < surfaceY) grid[x][y] = 0; 
      else {
        let stoneVal = noise(stoneOffset + x * 0.05, stoneOffset + y * 0.05);
        grid[x][y] = stoneVal > 0.65 ? 2 : 1; 
      }
    }
  }
}

// --- RENDERING ---
window.drawTerrain = function() {
  noStroke();

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        let texture = noise(x * 0.12, y * 0.18) * 20;
        fill(237 + texture * 0.35, 201 + texture * 0.45, 175 + texture * 0.25);
        rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, CONFIG.CELL_SIZE + 0.6, 1.2);

        if (y > 0 && grid[x][y - 1] === 0) {
          fill(250, 235, 210, 140);
          rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, 1.8, 1.0);
        }
      } else if (grid[x][y] === 2) {
        let texture = noise(x * 0.12, y * 0.10) * 18;
        fill(100 + texture, 100 + texture * 0.6, 110 + texture * 0.4);
        rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, CONFIG.CELL_SIZE + 0.6, 1.2);

        if (y > 0 && grid[x][y - 1] !== 2) {
          fill(160, 160, 170, 85);
          rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, 1.8, 1.0);
        }
      }
    }
  }

  fill(35, 60, 90, 18);
  rect(0, height - 10, width, 10);
}

window.dropTanksToGround = function() {
  for (let y = 0; y < rows; y++) { if (grid[tank1.x][y] !== 0) { tank1.y = y - tank1.height; break; } }
  for (let y = 0; y < rows; y++) { if (grid[tank2.x][y] !== 0) { tank2.y = y - tank2.height; break; } }
}

window.drawTanks = function() {
  let activeTank = gameState === GAME_STATE.P1_TURN ? tank1 : gameState === GAME_STATE.P2_TURN ? tank2 : null;

  tank1.drawBody();
  tank2.drawBody();

  if (activeTank === tank1) {
    stroke(255, 245, 120, 230); strokeWeight(5); noFill(); rect(tank1.x * CONFIG.CELL_SIZE - 3, tank1.y * CONFIG.CELL_SIZE - 3, tank1.width * CONFIG.CELL_SIZE + 6, tank1.height * CONFIG.CELL_SIZE + 6);
    stroke(255, 165, 0, 180); strokeWeight(2); noFill(); rect(tank1.x * CONFIG.CELL_SIZE - 1, tank1.y * CONFIG.CELL_SIZE - 1, tank1.width * CONFIG.CELL_SIZE + 2, tank1.height * CONFIG.CELL_SIZE + 2);
  } else if (activeTank === tank2) {
    stroke(255, 245, 120, 230); strokeWeight(5); noFill(); rect(tank2.x * CONFIG.CELL_SIZE - 3, tank2.y * CONFIG.CELL_SIZE - 3, tank2.width * CONFIG.CELL_SIZE + 6, tank2.height * CONFIG.CELL_SIZE + 6);
    stroke(255, 165, 0, 180); strokeWeight(2); noFill(); rect(tank2.x * CONFIG.CELL_SIZE - 1, tank2.y * CONFIG.CELL_SIZE - 1, tank2.width * CONFIG.CELL_SIZE + 2, tank2.height * CONFIG.CELL_SIZE + 2);
  }

  drawBarrel(tank1);
  drawBarrel(tank2);
}

window.drawBarrel = function(tank) {
  push();
  translate((tank.x + tank.width / 2) * CONFIG.CELL_SIZE, tank.y * CONFIG.CELL_SIZE);
  rotate(radians(tank.angle));
  
  // Add a pulsing glow for "Big Shot" ready
  if (tank.isBigShotReady()) {
    let pulse = sin(frameCount * 0.1) * 4 + 4;
    noFill();
    stroke(255, 100, 100, 150);
    strokeWeight(pulse + 2);
    line(0, 0, 20, 0);
    stroke(255, 255, 150, 180);
    strokeWeight(pulse);
    line(0, 0, 20, 0);
  }

  strokeWeight(3); stroke(0); line(0, 0, 20, 0);
  if ((tank === tank1 && gameState === GAME_STATE.P1_TURN) || (tank === tank2 && gameState === GAME_STATE.P2_TURN)) {
    strokeWeight(4); stroke(255, 245, 120, 255); line(20, 0, 20 + tank.power, 0);
    strokeWeight(1.5); stroke(255, 155, 40, 200); line(20, 0, 20 + tank.power, 0);
  }
  pop();
}

window.drawAimLine = function() {
  let activeTank = gameState === GAME_STATE.P1_TURN ? tank1 : gameState === GAME_STATE.P2_TURN ? tank2 : null;
  if (!activeTank) return;

  let angleInRadians = radians(activeTank.angle);
  let launchSpeed = activeTank.power * CONFIG.PROJECTILE_SPEED_SCALE;
  let startX = (activeTank.x + activeTank.width / 2) * CONFIG.CELL_SIZE;
  let startY = activeTank.y * CONFIG.CELL_SIZE;
  let velocityX = cos(angleInRadians) * launchSpeed;
  let velocityY = sin(angleInRadians) * launchSpeed;

  push();
  noFill();
  stroke(255, 255, 255, 140);
  strokeWeight(1.5);
  beginShape();

  for (let i = 0; i < 22; i++) {
    let t = i * 2.4;
    let x = startX + velocityX * t;
    let y = startY + velocityY * t + 0.5 * gravityForce * t * t;
    vertex(x, y);

    if (x < 0 || x > width || y > height) break;

    let checkX = floor(x / CONFIG.CELL_SIZE);
    let checkY = floor(y / CONFIG.CELL_SIZE);
    if (checkX < 0 || checkX >= cols || checkY < 0 || checkY >= rows) break;
    if (grid[checkX][checkY] !== 0) break;
  }

  endShape();
  pop();
}

window.updateImpactEffects = function() {
  for (let i = impactEffects.length - 1; i >= 0; i--) {
    impactEffects[i].life -= 1;
    impactEffects[i].radius += impactEffects[i].growth;

    if (impactEffects[i].life <= 0) {
      impactEffects.splice(i, 1);
    }
  }
}

window.updateLaunchSparks = function() {
  for (let i = launchSparks.length - 1; i >= 0; i--) {
    let spark = launchSparks[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.96;
    spark.vy *= 0.96;
    spark.life -= 1;

    if (spark.life <= 0) {
      launchSparks.splice(i, 1);
    }
  }
}

window.spawnLaunchSparks = function(startX, startY, angleInRadians, isBigShot) {
  let sparkCount = isBigShot ? 11 : 7;
  for (let i = 0; i < sparkCount; i++) {
    let sparkAngle = angleInRadians + random(-0.8, 0.8);
    let sparkSpeed = random(0.7, 2.6);

    launchSparks.push({
      x: startX + cos(angleInRadians) * random(2, 8),
      y: startY + sin(angleInRadians) * random(2, 8),
      vx: cos(sparkAngle) * sparkSpeed,
      vy: sin(sparkAngle) * sparkSpeed,
      radius: isBigShot ? random(2.5, 4.5) : random(1.8, 3.2),
      life: isBigShot ? random(7, 11) : random(5, 8),
      maxLife: isBigShot ? 11 : 8
    });
  }
}

window.drawLaunchSparks = function() {
  for (const spark of launchSparks) {
    let alpha = map(spark.life, 0, spark.maxLife, 0, 220);
    fill(255, 245, 160, alpha);
    noStroke();
    circle(spark.x, spark.y, spark.radius);

    stroke(255, 146, 60, alpha * 0.8);
    strokeWeight(1.4);
    noFill();
    circle(spark.x, spark.y, spark.radius * 2.4);
  }
}

window.drawImpactEffects = function() {
  for (const effect of impactEffects) {
    let alpha = map(effect.life, 0, effect.maxLife, 0, 255);
    let pulseRadius = effect.radius;

    noFill();
    stroke(255, 248, 188, alpha * 0.95);
    strokeWeight(8);
    circle(effect.x, effect.y, pulseRadius);

    stroke(255, 120, 60, alpha * 0.85);
    strokeWeight(4);
    circle(effect.x, effect.y, pulseRadius * 0.72);

    stroke(255, 255, 255, alpha * 0.45);
    strokeWeight(1.5);
    circle(effect.x, effect.y, pulseRadius * 1.15);
  }
}

window.drawProjectile = function() {
  if (!currentProjectile) return;

  for (let i = 0; i < currentProjectile.trail.length; i++) {
    let point = currentProjectile.trail[i];
    let alpha = map(i, 0, currentProjectile.trail.length - 1, 30, 120);
    fill(currentProjectile.isBigPowerup ? 255 : 20, currentProjectile.isBigPowerup ? 120 : 120, 40, alpha);
    noStroke();
    circle(point.x, point.y, currentProjectile.isBigPowerup ? 10 : 6);
  }

  if (currentProjectile.isBigPowerup) {
    fill(255, 60, 60); stroke(255, 255, 80); strokeWeight(3);
    circle(currentProjectile.pos.x, currentProjectile.pos.y, 16);
  } else {
    fill(20, 20, 20); stroke(255, 220, 120); strokeWeight(2);
    circle(currentProjectile.pos.x, currentProjectile.pos.y, 10);
  }
}

function getTurnBannerText() {
  if (gameState === GAME_STATE.P1_TURN) return "Player 1 is aiming";
  if (gameState === GAME_STATE.P2_TURN) return "Player 2 is aiming";
  if (gameState === GAME_STATE.PROJECTILE_AIRBORNE) return "Shell in flight";
  return "Match complete";
}

function getActiveControlHint() {
  if (gameState === GAME_STATE.P1_TURN) {
    return "Player 1: Aim ↑ ↓  |  Power: Left reduces, Right increases  |  Fire Space";
  }

  if (gameState === GAME_STATE.P2_TURN) {
    return "Player 2: Aim ↑ ↓  |  Power: Left increases, Right reduces  |  Fire Space";
  }

  if (gameState === GAME_STATE.PROJECTILE_AIRBORNE) {
    return "Shell is airborne — wait for impact or turn change";
  }

  return "Press R to restart the match";
}


window.drawUI = function() {
  fill(0); noStroke();

  // --- PLAYER 1 UI ---
  textAlign(LEFT); textSize(16);
  let p1Combo = tank1.isBigShotReady() ? "BIG SHOT READY!" : `Combo: ${tank1.consecutiveHits}/3`;
  text(`HP: ${round(tank1.health)} | Shots: ${tank1.shotsLeft} | ${p1Combo}`, 10, 20);
  text(`Angle: ${abs(round(tank1.angle))}° | Power: ${round(tank1.power)}`, 10, 40);

  // --- PLAYER 2 UI ---
  fill(0); textAlign(RIGHT); textSize(16);
  let p2Combo = tank2.isBigShotReady() ? "BIG SHOT READY!" : `Combo: ${tank2.consecutiveHits}/3`;
  text(`HP: ${round(tank2.health)} | Shots: ${tank2.shotsLeft} | ${p2Combo}`, width - 10, 20);
  text(`Angle: ${abs(round(tank2.angle))}° | Power: ${round(tank2.power)}`, width - 10, 40);

  // --- CENTER STATUS (TURN + WIND + GRAVITY) ---
  textAlign(CENTER); textSize(20);

  if (gameState === GAME_STATE.GAME_OVER) {
    fill(0); textSize(30);
    let winner = tank1.health > tank2.health ? "Player 1 Wins!" : (tank2.health > tank1.health ? "Player 2 Wins!" : "Draw!");
    text(`GAME OVER: ${winner}`, width / 2, 30);
    fill(60); textSize(14);
    text("Press R or use the restart button to play again", width / 2, 58);
  } else {
    let bannerColor = gameState === GAME_STATE.P1_TURN ? color(220, 70, 70, 230) : gameState === GAME_STATE.P2_TURN ? color(60, 100, 220, 230) : color(45, 45, 45, 220);

    noStroke();
    fill(bannerColor);
    rect(width / 2 - 130, 6, 260, 34, 16);

    textAlign(CENTER);
    fill(255);
    text(getTurnBannerText(), width / 2, 29);

    // Wind & Gravity Output
    fill(50); textSize(16);
    let windStrength = abs(round(wind * 500));

    // Calculate Gravity relative to base (0.2 = 1.0G)
    let gText = (gravityForce / 0.2).toFixed(1) + "G";

    text(`Gravity: ${gText}`, width / 2, 55);
  }

  // --- PERSISTENT INPUT GUIDE ---
  textAlign(CENTER); textSize(14);
  fill(50);
  text(getActiveControlHint(), width / 2, height - 20);

  textAlign(LEFT);
}

// Helper to draw a simple polyline, as p5 doesn't have one built-in
function polyline(...points) {
  beginShape();
  for (let i = 0; i < arguments.length; i += 2) vertex(arguments[i], arguments[i+1]);
  endShape();
}

window.drawWindIndicator = function() {
  if (gameState === GAME_STATE.GAME_OVER) return;

  const indicatorX = width / 2;
  const indicatorY = 85;
  const maxWind = 0.02;
  const strength = abs(wind);

  push();
  translate(indicatorX, indicatorY);

  if (strength < 0.005) {
    fill(50, 150);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Calm", 0, 0);
  } else {
    const numChevrons = floor(map(strength, 0.005, maxWind, 1, 4));
    const direction = sign(wind);

    for (let i = 0; i < numChevrons; i++) {
      const opacity = map(i, 0, numChevrons - 1, 60, 200);
      stroke(255, 255, 255, opacity);
      strokeWeight(2.5);
      noFill();
      polyline(direction * (5 + i * 10), -5, direction * (10 + i * 10), 0, direction * (5 + i * 10), 5);
    }
  }
  pop();
}
