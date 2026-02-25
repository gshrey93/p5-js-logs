// --- GAME CONSTANTS ---
const CELL_SIZE = 4; 
let cols, rows;
let grid = []; // 0: Air, 1: Sand, 2: Stone

// --- GAME STATE ---
let gameState = "P1_TURN"; // P1_TURN, P2_TURN, PROJECTILE_AIRBORNE, GAME_OVER
let tank1, tank2;
let currentProjectile = null;

// Environment Modifiers
let wind = 0; 
let gravityForce = 0.2; // Baseline is 0.2

function setup() {
  createCanvas(800, 600);
  cols = width / CELL_SIZE;
  rows = height / CELL_SIZE;
  
  generateTerrain();
  
  // Initialize initial weather/gravity
  wind = random(-0.02, 0.02); 
  gravityForce = random(0.1, 0.35); // 0.1 is floaty, 0.35 is heavy
  
  // Initialize Tanks
  tank1 = { 
    id: 1, x: floor(cols * 0.15), y: 0, width: 6, height: 4,
    color: 'red', consecutiveHits: 0, shotsLeft: 10,
    angle: -45, power: 50, health: 100
  };
  
  tank2 = { 
    id: 2, x: floor(cols * 0.85), y: 0, width: 6, height: 4,
    color: 'blue', consecutiveHits: 0, shotsLeft: 10,
    angle: -135, power: 50, health: 100
  };
  
  dropTanksToGround();
}

function draw() {
  background(135, 206, 235); // Sky blue
  
  if (gameState === "P1_TURN" || gameState === "P2_TURN") {
    handleInput(); 
  }
  
  drawTerrain();
  drawTanks();
  
  if (gameState === "PROJECTILE_AIRBORNE" && currentProjectile) {
    updateProjectile();
    if (currentProjectile) {
      drawProjectile();
    }
  }
  
  drawUI();
}

// --- INPUT & FIRING ---
function handleInput() {
  let activeTank = gameState === "P1_TURN" ? tank1 : tank2;
  
  // Aiming (Same for both)
  if (keyIsDown(UP_ARROW)) activeTank.angle -= 1; 
  if (keyIsDown(DOWN_ARROW)) activeTank.angle += 1;
  activeTank.angle = constrain(activeTank.angle, -180, 0);

  // Power (Inverted for P2 for better ergonomics)
  if (activeTank === tank1) {
    if (keyIsDown(RIGHT_ARROW)) activeTank.power += 0.5;
    if (keyIsDown(LEFT_ARROW)) activeTank.power -= 0.5;
  } else if (activeTank === tank2) {
    if (keyIsDown(LEFT_ARROW)) activeTank.power += 0.5;
    if (keyIsDown(RIGHT_ARROW)) activeTank.power -= 0.5;
  }
  
  activeTank.power = constrain(activeTank.power, 0, 100);
}

function keyPressed() {
  if (keyCode === 32) { // Spacebar
    if (gameState === "P1_TURN" && tank1.shotsLeft > 0) fire(tank1);
    else if (gameState === "P2_TURN" && tank2.shotsLeft > 0) fire(tank2);
  }
}

function fire(tank) {
  tank.shotsLeft--;
  let angleInRadians = radians(tank.angle);
  let launchSpeed = tank.power * 0.2; 
  
  let startX = (tank.x + tank.width / 2) * CELL_SIZE + cos(angleInRadians) * 20;
  let startY = tank.y * CELL_SIZE + sin(angleInRadians) * 20;
  
  let isBigShot = tank.consecutiveHits >= 3;
  if (isBigShot) tank.consecutiveHits = 0; 

  currentProjectile = {
    pos: createVector(startX, startY),
    vel: createVector(cos(angleInRadians) * launchSpeed, sin(angleInRadians) * launchSpeed),
    gravity: createVector(0, gravityForce), // Use the dynamic gravity
    ownerId: tank.id,
    isBigPowerup: isBigShot
  };
  
  gameState = "PROJECTILE_AIRBORNE";
}

// --- PHYSICS & COLLISION ---
function updateProjectile() {
  currentProjectile.vel.add(currentProjectile.gravity);
  currentProjectile.vel.x += wind; // Apply dynamic wind
  
  let nextX = currentProjectile.pos.x + currentProjectile.vel.x;
  let nextY = currentProjectile.pos.y + currentProjectile.vel.y;
  
  let gridX = floor(nextX / CELL_SIZE);
  let gridY = floor(nextY / CELL_SIZE);
  
  if (gridX < 0 || gridX >= cols || nextY > height) {
    switchTurn();
    return;
  }
  
  if (gridY >= 0) {
    let cell = grid[gridX][gridY];
    if (cell === 2) { 
      currentProjectile.vel.y *= -0.7; 
      currentProjectile.vel.x *= 0.8;
      nextX = currentProjectile.pos.x;
      nextY = currentProjectile.pos.y;
    } else if (cell === 1) { 
      explode(currentProjectile.pos.x, currentProjectile.pos.y);
      switchTurn();
      return;
    }
  }
  
  if (isHittingTank(nextX, nextY, tank1) || isHittingTank(nextX, nextY, tank2)) {
    explode(currentProjectile.pos.x, currentProjectile.pos.y);
    switchTurn();
    return;
  }

  currentProjectile.pos.x = nextX;
  currentProjectile.pos.y = nextY;
}

function isHittingTank(px, py, tank) {
  let tx = tank.x * CELL_SIZE; let ty = tank.y * CELL_SIZE;
  let tw = tank.width * CELL_SIZE; let th = tank.height * CELL_SIZE;
  return (px >= tx && px <= tx + tw && py >= ty && py <= ty + th);
}

// --- EXPLOSIONS & DAMAGE ---
function explode(pixelX, pixelY) {
  let isBig = currentProjectile.isBigPowerup;
  let blastRadiusPixels = isBig ? 60 : 40; 
  let blastRadiusGrid = floor(blastRadiusPixels / CELL_SIZE);
  let gridX = floor(pixelX / CELL_SIZE);
  let gridY = floor(pixelY / CELL_SIZE);
  
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

function applyDamage(tank, ex, ey, radius, maxDmg, minDmg) {
  let tankCenterX = (tank.x + tank.width / 2) * CELL_SIZE;
  let tankCenterY = (tank.y + tank.height / 2) * CELL_SIZE;
  
  let d = dist(ex, ey, tankCenterX, tankCenterY);
  let maxHitDistance = radius + (tank.width * CELL_SIZE / 2);
  
  if (d < maxHitDistance) {
    let damage = map(d, 0, maxHitDistance, maxDmg, minDmg); 
    tank.health -= damage; 
    if (tank.health < 0) tank.health = 0; 
    return damage; 
  }
  return 0; 
}

function switchTurn() {
  let lastOwner = currentProjectile ? currentProjectile.ownerId : null;
  currentProjectile = null; 
  
  if (tank1.health <= 0 || tank2.health <= 0 || (tank1.shotsLeft === 0 && tank2.shotsLeft === 0)) {
    gameState = "GAME_OVER";
    return;
  }
  
  if (lastOwner === 1) gameState = "P2_TURN";
  else if (lastOwner === 2) gameState = "P1_TURN";
  else gameState = gameState === "P1_TURN" ? "P2_TURN" : "P1_TURN";
  
  // Randomize environment modifiers for the new turn
  wind = random(-0.02, 0.02);
  gravityForce = random(0.1, 0.35);
  
  dropTanksToGround();
}

// --- TERRAIN GENERATION ---
function generateTerrain() {
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
function drawTerrain() {
  noStroke();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(237, 201, 175); rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (grid[x][y] === 2) {
        fill(100); rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function dropTanksToGround() {
  for (let y = 0; y < rows; y++) { if (grid[tank1.x][y] !== 0) { tank1.y = y - tank1.height; break; } }
  for (let y = 0; y < rows; y++) { if (grid[tank2.x][y] !== 0) { tank2.y = y - tank2.height; break; } }
}

function drawTanks() {
  fill(tank1.color); noStroke(); rect(tank1.x * CELL_SIZE, tank1.y * CELL_SIZE, tank1.width * CELL_SIZE, tank1.height * CELL_SIZE);
  fill(tank2.color); noStroke(); rect(tank2.x * CELL_SIZE, tank2.y * CELL_SIZE, tank2.width * CELL_SIZE, tank2.height * CELL_SIZE);
  drawBarrel(tank1); drawBarrel(tank2);
}

function drawBarrel(tank) {
  push();
  translate((tank.x + tank.width / 2) * CELL_SIZE, tank.y * CELL_SIZE);
  rotate(radians(tank.angle));
  
  strokeWeight(3); stroke(0); line(0, 0, 20, 0);
  if ((tank === tank1 && gameState === "P1_TURN") || (tank === tank2 && gameState === "P2_TURN")) {
    strokeWeight(2); stroke(255, 255, 0, 150); line(20, 0, 20 + tank.power, 0); 
  }
  pop();
}

function drawProjectile() {
  if (!currentProjectile) return;

  if (currentProjectile.isBigPowerup) {
    fill(255, 50, 50); stroke(255, 255, 0); strokeWeight(2);
    circle(currentProjectile.pos.x, currentProjectile.pos.y, 14); 
  } else {
    fill(0); noStroke();
    circle(currentProjectile.pos.x, currentProjectile.pos.y, 8); 
  }
}

function drawUI() {
  fill(0); noStroke(); 
  
  // --- PLAYER 1 UI ---
  textAlign(LEFT); textSize(16);
  let p1Combo = tank1.consecutiveHits >= 3 ? "BIG SHOT READY!" : `Combo: ${tank1.consecutiveHits}/3`;
  text(`HP: ${round(tank1.health)} | Shots: ${tank1.shotsLeft} | ${p1Combo}`, 10, 20);
  text(`Angle: ${abs(round(tank1.angle))}° | Power: ${round(tank1.power)}`, 10, 40);
  
  if (gameState === "P1_TURN") {
    fill('red'); textSize(14);
    text("Controls: Aim [UP/DOWN]  |  Power [- Left / + Right]  |  Fire [SPACE]", 10, 60);
  }
  
  // --- PLAYER 2 UI ---
  fill(0); textAlign(RIGHT); textSize(16);
  let p2Combo = tank2.consecutiveHits >= 3 ? "BIG SHOT READY!" : `Combo: ${tank2.consecutiveHits}/3`;
  text(`HP: ${round(tank2.health)} | Shots: ${tank2.shotsLeft} | ${p2Combo}`, width - 10, 20);
  text(`Angle: ${abs(round(tank2.angle))}° | Power: ${round(tank2.power)}`, width - 10, 40);
  
  if (gameState === "P2_TURN") {
    fill('blue'); textSize(14);
    text("Controls: Aim [UP/DOWN]  |  Power [+ Left / - Right]  |  Fire [SPACE]", width - 10, 60);
  }
  
  // --- CENTER STATUS (WIND & GRAVITY) ---
  textAlign(CENTER); textSize(20);
  
  if (gameState === "GAME_OVER") {
    fill(0); textSize(32);
    let winner = tank1.health > tank2.health ? "Player 1 Wins!" : (tank2.health > tank1.health ? "Player 2 Wins!" : "Draw!");
    text(`GAME OVER: ${winner}`, width / 2, height / 2);
  } else {
    if (gameState === "P1_TURN") fill('red'); 
    else if (gameState === "P2_TURN") fill('blue'); 
    else fill(0); 
    text(`Current Turn: ${gameState}`, width / 2, 30);
    
    // Wind & Gravity Output
    fill(50); textSize(16);
    let windStrength = abs(round(wind * 500)); 
    let windText = "";
    if (wind < -0.005) windText = `<<< ${windStrength}`;
    else if (wind > 0.005) windText = `${windStrength} >>>`;
    else windText = "0 (Calm)";
    
    // Calculate Gravity relative to base (0.2 = 1.0G)
    let gText = (gravityForce / 0.2).toFixed(1) + "G";
    
    text(`Wind: ${windText}   |   Gravity: ${gText}`, width / 2, 55);
  }
  
  textAlign(LEFT); 
}
