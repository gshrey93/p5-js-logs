// sketch.js — Main orchestrator
// All logic lives in dedicated modules. This file wires up
// the p5.js lifecycle hooks and delegates to each module.

import { CONFIG, GAME_STATE } from './config.js';
import { Tank } from './tank.js';
import state from './state.js';

import { generateTerrain, drawTerrain, dropTanksToGround } from './terrain.js';
import { fire, updateProjectile, drawProjectile, switchTurn, syncGameOverlay } from './projectile.js';
import { updateImpactEffects, updateLaunchSparks, drawLaunchSparks, drawImpactEffects } from './particles.js';
import { drawSkyBackdrop, createClouds, drawClouds } from './environment.js';
import { drawTanks, drawAimLine, drawUI, drawWindIndicator } from './ui.js';

// --- p5.js LIFECYCLE ---

function preload() {
  soundFormats('wav', 'mp3');
  state.fireSound = loadSound('assets/fire.wav');
  state.explosionSound = loadSound('assets/explosion.wav');
}

window.preload = preload;

window.setup = function() {
  const canvas = createCanvas(800, 600);
  canvas.parent('main');
  state.cols = width / CONFIG.CELL_SIZE;
  state.rows = height / CONFIG.CELL_SIZE;
  state.terrainBuffer = createGraphics(width, height);

  state.gameOverlay = document.getElementById('game-overlay');
  state.gameStatusText = document.getElementById('game-status');
  state.restartButton = document.getElementById('restart-btn');

  if (state.restartButton) {
    state.restartButton.addEventListener('click', resetGame);
  }

  resetGame();
}

// --- GAME RESET ---

function resetGame() {
  generateTerrain();

  state.wind = random(-0.02, 0.02);
  state.gravityForce = random(0.1, 0.35);

  state.tank1 = new Tank(1, floor(state.cols * 0.15), color(220, 65, 65), -45);
  state.tank2 = new Tank(2, floor(state.cols * 0.85), color(60, 105, 230), -135);
  state.currentProjectile = null;
  state.impactEffects = [];
  state.launchSparks = [];
  state.clouds = createClouds();
  state.gameState = GAME_STATE.P1_TURN;
  dropTanksToGround();
  syncGameOverlay();
}

window.resetGame = resetGame;

// --- MAIN DRAW LOOP ---

window.draw = function() {
  // 1. Background
  drawSkyBackdrop();
  drawClouds();

  // 2. Input (only during player turns)
  if (state.gameState === GAME_STATE.P1_TURN || state.gameState === GAME_STATE.P2_TURN) {
    handleInput();
  }

  // 3. Update particles
  updateImpactEffects();
  updateLaunchSparks();

  // 4. Render world
  drawTerrain();
  drawTanks();
  drawLaunchSparks();

  // 5. Projectile
  if (state.gameState === GAME_STATE.PROJECTILE_AIRBORNE && state.currentProjectile) {
    updateProjectile();
    if (state.currentProjectile) {
      drawProjectile();
    }
  }

  // 6. UI overlays
  drawAimLine();
  drawImpactEffects();
  drawUI();
  drawWindIndicator();
}

// --- INPUT ---

function handleInput() {
  let activeTank = state.gameState === GAME_STATE.P1_TURN ? state.tank1 : state.tank2;

  if (keyIsDown(UP_ARROW)) activeTank.angle -= 1;
  if (keyIsDown(DOWN_ARROW)) activeTank.angle += 1;
  activeTank.angle = constrain(activeTank.angle, -180, 0);

  const powerDirection = (activeTank.id === 1) ? 1 : -1;
  if (keyIsDown(RIGHT_ARROW)) activeTank.power += 0.5 * powerDirection;
  if (keyIsDown(LEFT_ARROW)) activeTank.power -= 0.5 * powerDirection;
  activeTank.power = constrain(activeTank.power, 0, 100);

  // Tank Movement (A = Left, D = Right)
  let moved = false;
  if (keyIsDown(65)) { // 'A' key
    activeTank.x -= CONFIG.TANK_SPEED;
    moved = true;
  }
  if (keyIsDown(68)) { // 'D' key
    activeTank.x += CONFIG.TANK_SPEED;
    moved = true;
  }

  if (moved) {
    if (activeTank.id === 1) {
      // Tank 1 cannot move past Tank 2
      activeTank.x = constrain(activeTank.x, 0, state.tank2.x - activeTank.width);
    } else {
      // Tank 2 cannot move past Tank 1
      activeTank.x = constrain(activeTank.x, state.tank1.x + state.tank1.width, state.cols - activeTank.width);
    }
    dropTanksToGround();
  }
}

window.keyPressed = function() {
  if (keyCode === 82) { // R
    resetGame();
    return;
  }

  if (keyCode === 32) { // Spacebar
    if (state.gameState === GAME_STATE.P1_TURN && state.tank1.shotsLeft > 0) fire(state.tank1);
    else if (state.gameState === GAME_STATE.P2_TURN && state.tank2.shotsLeft > 0) fire(state.tank2);
  }
}
