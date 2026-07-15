import { CONFIG, GAME_STATE } from './config.js';
import state from './state.js';
import { dropTanksToGround } from './terrain.js';
import { spawnLaunchSparks } from './particles.js';

// --- FIRING ---

export function fire(tank) {
  if (state.fireSound.isLoaded()) state.fireSound.play();

  tank.shotsLeft--;
  let angleInRadians = radians(tank.angle);
  let launchSpeed = tank.power * CONFIG.PROJECTILE_SPEED_SCALE;

  let startX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE + cos(angleInRadians) * 20;
  let startY = tank.y * CONFIG.CELL_SIZE + sin(angleInRadians) * 20;

  let isBigShot = tank.isBigShotReady();
  if (isBigShot) tank.consecutiveHits = 0;

  spawnLaunchSparks(startX, startY, angleInRadians, isBigShot);

  state.currentProjectile = {
    pos: createVector(startX, startY),
    vel: createVector(cos(angleInRadians) * launchSpeed, sin(angleInRadians) * launchSpeed),
    gravity: createVector(0, state.gravityForce),
    ownerId: tank.id,
    isBigPowerup: isBigShot,
    restingTimer: 0,
    trail: [],
    trailMax: isBigShot ? 18 : 12
  };

  state.gameState = GAME_STATE.PROJECTILE_AIRBORNE;
}

// --- PHYSICS & COLLISION ---

export function updateProjectile() {
  const proj = state.currentProjectile;

  proj.trail.push({ x: proj.pos.x, y: proj.pos.y });
  if (proj.trail.length > proj.trailMax) {
    proj.trail.shift();
  }

  proj.vel.add(proj.gravity);
  proj.vel.x += state.wind;

  let nextX = proj.pos.x + proj.vel.x;
  let nextY = proj.pos.y + proj.vel.y;

  let gridX = floor(nextX / CONFIG.CELL_SIZE);
  let gridY = floor(nextY / CONFIG.CELL_SIZE);

  if (gridX < 0 || gridX >= state.cols || nextY > height) {
    switchTurn();
    return;
  }

  if (gridY >= 0) {
    let cell = state.grid[gridX][gridY];
    if (cell === 2) {
      proj.vel.y *= -0.7;
      proj.vel.x *= 0.8;

      if (abs(proj.vel.y) < 0.2 && abs(proj.vel.x) < 0.2) {
        proj.restingTimer++;
      }

      nextX = proj.pos.x;
      nextY = proj.pos.y;
    } else if (cell === 1) {
      explode(proj.pos.x, proj.pos.y);
      switchTurn();
      return;
    }
  }

  // 2 second timeout (~120 frames) if projectile is stuck on stone
  if (proj.restingTimer > 120) {
    switchTurn();
    return;
  }

  if (state.tank1.isHit(nextX, nextY) || state.tank2.isHit(nextX, nextY)) {
    explode(proj.pos.x, proj.pos.y);
    switchTurn();
    return;
  }

  proj.pos.x = nextX;
  proj.pos.y = nextY;
}

// --- EXPLOSIONS & DAMAGE ---

export function explode(pixelX, pixelY) {
  if (state.explosionSound.isLoaded()) state.explosionSound.play();

  let isBig = state.currentProjectile.isBigPowerup;
  let blastRadiusPixels = isBig ? 60 : 40;
  let blastRadiusGrid = floor(blastRadiusPixels / CONFIG.CELL_SIZE);
  let gridX = floor(pixelX / CONFIG.CELL_SIZE);
  let gridY = floor(pixelY / CONFIG.CELL_SIZE);

  state.impactEffects.push({
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
        if (checkX >= 0 && checkX < state.cols && checkY >= 0 && checkY < state.rows) {
          if (state.grid[checkX][checkY] === 1) state.grid[checkX][checkY] = 0;
        }
      }
    }
  }
  state.terrainDirty = true;

  let maxDmg = isBig ? 40 : 25;
  let minDmg = isBig ? 20 : 10;

  let dmgToP1 = applyDamage(state.tank1, pixelX, pixelY, blastRadiusPixels, maxDmg, minDmg);
  let dmgToP2 = applyDamage(state.tank2, pixelX, pixelY, blastRadiusPixels, maxDmg, minDmg);

  let activeTank = state.currentProjectile.ownerId === 1 ? state.tank1 : state.tank2;

  if (!isBig) {
    if (activeTank === state.tank1) {
      if (dmgToP2 >= 20) state.tank1.consecutiveHits++; else state.tank1.consecutiveHits = 0;
    } else if (activeTank === state.tank2) {
      if (dmgToP1 >= 20) state.tank2.consecutiveHits++; else state.tank2.consecutiveHits = 0;
    }
  }
}

export function applyDamage(tank, ex, ey, radius, maxDmg, minDmg) {
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

// --- TURN MANAGEMENT ---

export function switchTurn() {
  let lastOwner = state.currentProjectile ? state.currentProjectile.ownerId : null;
  state.currentProjectile = null;

  if (state.tank1.health <= 0 || state.tank2.health <= 0 || (state.tank1.shotsLeft === 0 && state.tank2.shotsLeft === 0)) {
    state.gameState = GAME_STATE.GAME_OVER;
    syncGameOverlay();
    return;
  }

  if (lastOwner === 1) state.gameState = GAME_STATE.P2_TURN;
  else if (lastOwner === 2) state.gameState = GAME_STATE.P1_TURN;
  else state.gameState = state.gameState === GAME_STATE.P1_TURN ? GAME_STATE.P2_TURN : GAME_STATE.P1_TURN;

  // Randomize environment modifiers for the new turn
  state.wind = random(-0.02, 0.02);
  state.gravityForce = random(0.1, 0.35);

  dropTanksToGround();
  syncGameOverlay();
}

// --- OVERLAY ---

export function syncGameOverlay() {
  if (!state.gameOverlay || !state.gameStatusText) return;

  if (state.gameState === GAME_STATE.GAME_OVER) {
    state.gameOverlay.classList.remove('hidden');
    let winner = state.tank1.health > state.tank2.health ? "Player 1 wins!" : state.tank2.health > state.tank1.health ? "Player 2 wins!" : "It is a draw!";
    state.gameStatusText.textContent = `Match complete — ${winner}`;
  } else {
    state.gameOverlay.classList.add('hidden');
  }
}

// --- DRAWING ---

export function drawProjectile() {
  const proj = state.currentProjectile;
  if (!proj) return;

  for (let i = 0; i < proj.trail.length; i++) {
    let point = proj.trail[i];
    let alpha = map(i, 0, proj.trail.length - 1, 30, 120);
    fill(proj.isBigPowerup ? 255 : 20, proj.isBigPowerup ? 120 : 120, 40, alpha);
    noStroke();
    circle(point.x, point.y, proj.isBigPowerup ? 10 : 6);
  }

  if (proj.isBigPowerup) {
    fill(255, 60, 60); stroke(255, 255, 80); strokeWeight(3);
    circle(proj.pos.x, proj.pos.y, 16);
  } else {
    fill(20, 20, 20); stroke(255, 220, 120); strokeWeight(2);
    circle(proj.pos.x, proj.pos.y, 10);
  }
}
