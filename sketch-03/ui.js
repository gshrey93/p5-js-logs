import { CONFIG, GAME_STATE } from './config.js';
import state from './state.js';

// --- TANK DRAWING (highlights, barrels) ---

export function drawTanks() {
  let activeTank = state.gameState === GAME_STATE.P1_TURN ? state.tank1 : state.gameState === GAME_STATE.P2_TURN ? state.tank2 : null;

  state.tank1.drawBody();
  state.tank2.drawBody();

  if (activeTank === state.tank1) {
    stroke(255, 245, 120, 230); strokeWeight(5); noFill(); rect(state.tank1.x * CONFIG.CELL_SIZE - 3, state.tank1.y * CONFIG.CELL_SIZE - 3, state.tank1.width * CONFIG.CELL_SIZE + 6, state.tank1.height * CONFIG.CELL_SIZE + 6);
    stroke(255, 165, 0, 180); strokeWeight(2); noFill(); rect(state.tank1.x * CONFIG.CELL_SIZE - 1, state.tank1.y * CONFIG.CELL_SIZE - 1, state.tank1.width * CONFIG.CELL_SIZE + 2, state.tank1.height * CONFIG.CELL_SIZE + 2);
  } else if (activeTank === state.tank2) {
    stroke(255, 245, 120, 230); strokeWeight(5); noFill(); rect(state.tank2.x * CONFIG.CELL_SIZE - 3, state.tank2.y * CONFIG.CELL_SIZE - 3, state.tank2.width * CONFIG.CELL_SIZE + 6, state.tank2.height * CONFIG.CELL_SIZE + 6);
    stroke(255, 165, 0, 180); strokeWeight(2); noFill(); rect(state.tank2.x * CONFIG.CELL_SIZE - 1, state.tank2.y * CONFIG.CELL_SIZE - 1, state.tank2.width * CONFIG.CELL_SIZE + 2, state.tank2.height * CONFIG.CELL_SIZE + 2);
  }

  drawBarrel(state.tank1);
  drawBarrel(state.tank2);
}

function drawBarrel(tank) {
  push();
  translate((tank.x + tank.width / 2) * CONFIG.CELL_SIZE, tank.y * CONFIG.CELL_SIZE);
  rotate(radians(tank.angle));

  // Pulsing glow for "Big Shot" ready
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
  if ((tank === state.tank1 && state.gameState === GAME_STATE.P1_TURN) || (tank === state.tank2 && state.gameState === GAME_STATE.P2_TURN)) {
    strokeWeight(4); stroke(255, 245, 120, 255); line(20, 0, 20 + tank.power, 0);
    strokeWeight(1.5); stroke(255, 155, 40, 200); line(20, 0, 20 + tank.power, 0);
  }
  pop();
}

// --- AIM LINE ---

export function drawAimLine() {
  let activeTank = state.gameState === GAME_STATE.P1_TURN ? state.tank1 : state.gameState === GAME_STATE.P2_TURN ? state.tank2 : null;
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

    let x = startX + velocityX * t + 0.5 * state.wind * t * t;
    let y = startY + velocityY * t + 0.5 * state.gravityForce * t * t;
    vertex(x, y);

    if (x < 0 || x > width || y > height) break;

    let checkX = floor(x / CONFIG.CELL_SIZE);
    let checkY = floor(y / CONFIG.CELL_SIZE);
    if (checkX < 0 || checkX >= state.cols || checkY < 0 || checkY >= state.rows) break;
    if (state.grid[checkX][checkY] !== 0) break;
  }

  endShape();
  pop();
}

// --- HUD ---

function getTurnBannerText() {
  if (state.gameState === GAME_STATE.P1_TURN) return "Player 1 is aiming";
  if (state.gameState === GAME_STATE.P2_TURN) return "Player 2 is aiming";
  if (state.gameState === GAME_STATE.PROJECTILE_AIRBORNE) return "Shell in flight";
  return "Match complete";
}

function getActiveControlHint() {
  if (state.gameState === GAME_STATE.P1_TURN) {
    return "Player 1: Move A/D  |  Aim ↑ ↓  |  Power: Left reduces, Right increases  |  Fire Space";
  }
  if (state.gameState === GAME_STATE.P2_TURN) {
    return "Player 2: Move A/D  |  Aim ↑ ↓  |  Power: Left increases, Right reduces  |  Fire Space";
  }
  if (state.gameState === GAME_STATE.PROJECTILE_AIRBORNE) {
    return "Shell is airborne — wait for impact or turn change";
  }
  return "Press R to restart the match";
}

export function drawUI() {
  fill(0); noStroke();

  // --- PLAYER 1 UI ---
  textAlign(LEFT); textSize(16);
  let p1Combo = state.tank1.isBigShotReady() ? "BIG SHOT READY!" : `Combo: ${state.tank1.consecutiveHits}/3`;
  text(`HP: ${round(state.tank1.health)} | Shots: ${state.tank1.shotsLeft} | ${p1Combo}`, 10, 20);
  text(`Angle: ${abs(round(state.tank1.angle))}° | Power: ${round(state.tank1.power)}`, 10, 40);

  // --- PLAYER 2 UI ---
  fill(0); textAlign(RIGHT); textSize(16);
  let p2Combo = state.tank2.isBigShotReady() ? "BIG SHOT READY!" : `Combo: ${state.tank2.consecutiveHits}/3`;
  text(`HP: ${round(state.tank2.health)} | Shots: ${state.tank2.shotsLeft} | ${p2Combo}`, width - 10, 20);
  text(`Angle: ${abs(round(state.tank2.angle))}° | Power: ${round(state.tank2.power)}`, width - 10, 40);

  // --- CENTER STATUS (TURN + WIND + GRAVITY) ---
  textAlign(CENTER); textSize(20);

  if (state.gameState === GAME_STATE.GAME_OVER) {
    fill(0); textSize(30);
    let winner = state.tank1.health > state.tank2.health ? "Player 1 Wins!" : (state.tank2.health > state.tank1.health ? "Player 2 Wins!" : "Draw!");
    text(`GAME OVER: ${winner}`, width / 2, 30);
    fill(60); textSize(14);
    text("Press R or use the restart button to play again", width / 2, 58);
  } else {
    let bannerColor = state.gameState === GAME_STATE.P1_TURN ? color(220, 70, 70, 230) : state.gameState === GAME_STATE.P2_TURN ? color(60, 100, 220, 230) : color(45, 45, 45, 220);

    noStroke();
    fill(bannerColor);
    rect(width / 2 - 130, 6, 260, 34, 16);

    textAlign(CENTER);
    fill(255);
    text(getTurnBannerText(), width / 2, 29);

    // Wind & Gravity Output
    fill(50); textSize(16);
    let windStrength = abs(round(state.wind * 500));
    let windDir = state.wind > 0 ? "→" : state.wind < 0 ? "←" : "";

    let gText = (state.gravityForce / 0.2).toFixed(1) + "G";

    text(`Wind: ${windStrength === 0 ? "Calm" : windDir + " " + windStrength}  |  Gravity: ${gText}`, width / 2, 55);
  }

  // --- PERSISTENT INPUT GUIDE ---
  textAlign(CENTER); textSize(14);
  fill(50);
  text(getActiveControlHint(), width / 2, height - 20);

  textAlign(LEFT);
}

// --- WIND INDICATOR ---

function polyline(...points) {
  beginShape();
  for (let i = 0; i < arguments.length; i += 2) vertex(arguments[i], arguments[i+1]);
  endShape();
}

export function drawWindIndicator() {
  if (state.gameState === GAME_STATE.GAME_OVER) return;

  const indicatorX = width / 2;
  const indicatorY = 85;
  const maxWind = 0.02;
  const strength = abs(state.wind);

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
    const direction = Math.sign(state.wind);

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
