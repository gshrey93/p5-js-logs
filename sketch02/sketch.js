// DINO RUN: A Captivating Endless Runner
// By: An AI Assistant & You
// INSTRUCTIONS ARE ON-SCREEN

// --- Game State & Configuration ---
let gameState = 'START'; // START, PLAY, GAME_OVER
let score = 0;
let gameSpeed = 6;
const initialGameSpeed = 6;
const gameSpeedIncrease = 0.001;

// --- Player (Dino) ---
let dino;

// --- Obstacles ---
let obstacles = [];
let obstacleTimer = 0;
let nextObstacleTime = 0;

// --- Environment ---
const groundHeight = 50;
let timeOfDay = 0; // 0 to 1, where 0 is noon, 0.5 is midnight
const dayNightCycleSpeed = 0.0001;
let skyColor;
let groundColor;
let mountainColor;

// --- Background Layers (for parallax) ---
let farClouds = [];
let nearClouds = [];
let mountains = [];

// --- Fonts & Styling ---
let pixelFont;

// --- Art Assets (drawn programmatically) ---
const dinoArt = {
  run1: [
    "       ███     ",
    "      █████    ",
    "      ██████   ",
    "      ██████   ",
    "██    ██████   ",
    "████  ██████   ",
    "████████████   ",
    "███████████    ",
    " ██████████    ",
    "  ████████     ",
    "   ██████      ",
    "    ████       ",
    "    ██ ██      ",
    "    ██  ██     ",
    "    ██         ",
    "     ██        "
  ],
  run2: [
    "       ███     ",
    "      █████    ",
    "      ██████   ",
    "      ██████   ",
    "██    ██████   ",
    "████  ██████   ",
    "████████████   ",
    "███████████    ",
    " ██████████    ",
    "  ████████     ",
    "   ██████      ",
    "    ████       ",
    "    ██  ██     ",
    "    ██   ██    ",
    "    ██         ",
    "     ██        "
  ]
};

const cactusArt = {
  small: [
    "  █  ",
    " ██  ",
    "███  ",
    " █   ",
    " █   "
  ],
  medium: [
    "  █  ",
    "█ █ ██",
    "█ █ █ ",
    "  █   ",
    "  █   "
  ],
  large: [
    " █  █ ",
    "██  █ ",
    "███ █ ",
    "  █   ",
    "  █   "
  ]
};

// =================================================================
// P5.JS SETUP FUNCTION - Runs once at the beginning
// =================================================================
function setup() {
  createCanvas(800, 400);
  textFont('monospace');
  noSmooth(); // Essential for a crisp pixelated look

  // Initialize background elements
  for (let i = 0; i < 5; i++) {
    mountains.push({ x: random(width), y: height - groundHeight - random(20, 80), w: random(100, 300), h: random(50, 100) });
  }
  for (let i = 0; i < 10; i++) {
    farClouds.push({ x: random(width), y: random(50, 150), w: random(40, 80), h: random(10, 20) });
    nearClouds.push({ x: random(width), y: random(150, 200), w: random(60, 100), h: random(15, 30) });
  }
  
  resetGame();
}

// =================================================================
// P5.JS DRAW FUNCTION - Runs continuously in a loop
// =================================================================
function draw() {
  updateColors();

  switch (gameState) {
    case 'START':
      drawBackground();
      drawGround();
      drawStartScreen();
      break;
    case 'PLAY':
      handleGameLogic();
      drawGameElements();
      break;
    case 'GAME_OVER':
      drawGameElements(); // Draw the final state
      drawGameOverScreen();
      break;
  }
}

// =================================================================
// Game State Handlers
// =================================================================

function handleGameLogic() {
  // Update game elements
  dino.update();
  updateObstacles();
  updateBackgroundElements();
  
  // Update score and difficulty
  score += 0.1 * (gameSpeed / initialGameSpeed);
  gameSpeed += gameSpeedIncrease;
  
  // Update day/night cycle
  timeOfDay = (timeOfDay + dayNightCycleSpeed * (gameSpeed / initialGameSpeed)) % 1;
}

function drawGameElements() {
  drawBackground();
  drawObstacles();
  dino.draw();
  drawGround();
  drawHUD();
}

// =================================================================
// Game Setup and Reset
// =================================================================

function resetGame() {
  score = 0;
  gameSpeed = initialGameSpeed;
  obstacles = [];
  obstacleTimer = 0;
  setNextObstacleTime();
  
  // Create the player character
  dino = new Dino();
}

// =================================================================
// Player Input
// =================================================================

function keyPressed() {
  if (gameState === 'PLAY' && (key === ' ' || keyCode === UP_ARROW)) {
    dino.jump();
  } else if (gameState === 'START' || gameState === 'GAME_OVER') {
    resetGame();
    gameState = 'PLAY';
  }
}

function mousePressed() {
  if (gameState === 'PLAY') {
    dino.jump();
  } else if (gameState === 'START' || gameState === 'GAME_OVER') {
    resetGame();
    gameState = 'PLAY';
  }
}


// =================================================================
// Drawing Functions
// =================================================================

function drawBackground() {
  background(skyColor);
  
  // Draw sun/moon
  let sunMoonX = width / 2;
  let sunMoonY = map(sin(timeOfDay * TWO_PI), -1, 1, height/2, 50);
  fill(timeOfDay < 0.25 || timeOfDay > 0.75 ? color(255, 255, 200) : color(230, 230, 250));
  noStroke();
  ellipse(sunMoonX, sunMoonY, 50, 50);

  // Far clouds (slowest)
  fill(red(skyColor)+15, green(skyColor)+15, blue(skyColor)+15, 200);
  farClouds.forEach(c => rect(c.x, c.y, c.w, c.h, 10));
  
  // Mountains
  fill(mountainColor);
  mountains.forEach(m => {
    beginShape();
    vertex(m.x, m.y + m.h);
    vertex(m.x + m.w / 2, m.y);
    vertex(m.x + m.w, m.y + m.h);
    endShape(CLOSE);
  });
  
  // Near clouds (faster)
  fill(red(skyColor)+30, green(skyColor)+30, blue(skyColor)+30, 220);
  nearClouds.forEach(c => rect(c.x, c.y, c.w, c.h, 15));
}

function drawGround() {
  fill(groundColor);
  noStroke();
  rect(0, height - groundHeight, width, groundHeight);
}

function drawObstacles() {
  obstacles.forEach(obs => obs.draw());
}

function drawHUD() {
  fill(255);
  stroke(0);
  strokeWeight(3);
  textAlign(LEFT);
  textSize(24);
  text(`SCORE: ${floor(score)}`, 20, 30);
}

function drawStartScreen() {
  fill(255);
  stroke(0);
  strokeWeight(5);
  textAlign(CENTER, CENTER);
  
  textSize(50);
  text('PIXEL DINO RUN', width / 2, height / 2 - 80);
  
  textSize(24);
  text('Press SPACE or Click to JUMP', width / 2, height / 2);
  
  textSize(20);
  text('Press ANY KEY or Click to START', width / 2, height / 2 + 50);
}

function drawGameOverScreen() {
  fill(255, 50, 50);
  stroke(0);
  strokeWeight(7);
  textAlign(CENTER, CENTER);
  
  textSize(60);
  text('GAME OVER', width / 2, height / 2 - 80);

  fill(255);
  strokeWeight(5);
  textSize(30);
  text(`Final Score: ${floor(score)}`, width / 2, height / 2);
  
  textSize(20);
  text('Press ANY KEY or Click to RESTART', width / 2, height / 2 + 50);
}

/**
 * A generic function to draw pixel art from a string array.
 * @param {string[]} artArray The array of strings representing the art.
 * @param {number} x The top-left x-coordinate to start drawing.
 * @param {number} y The top-left y-coordinate to start drawing.
 * @param {number} pixelSize The size of each "pixel" block.
 */
function drawPixelArt(artArray, x, y, pixelSize) {
  for (let i = 0; i < artArray.length; i++) {
    for (let j = 0; j < artArray[i].length; j++) {
      if (artArray[i][j] === '█') {
        rect(x + j * pixelSize, y + i * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// =================================================================
// Update Functions
// =================================================================

function updateObstacles() {
  // Spawn new obstacles
  obstacleTimer += deltaTime;
  if (obstacleTimer > nextObstacleTime) {
    obstacles.push(new Obstacle());
    setNextObstacleTime();
  }

  // Update existing obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    if (obstacles[i].isOffscreen()) {
      obstacles.splice(i, 1);
    }
    
    // Check for collision
    if (obstacles[i].collidesWith(dino)) {
      gameState = 'GAME_OVER';
    }
  }
}

function setNextObstacleTime() {
  obstacleTimer = 0;
  // Make obstacles appear faster as game speed increases
  let baseTime = 1500;
  nextObstacleTime = random(baseTime, baseTime * 1.5) / (gameSpeed / initialGameSpeed);
}

function updateBackgroundElements() {
  // Parallax scrolling
  mountains.forEach(m => {
    m.x -= gameSpeed * 0.1;
    if (m.x + m.w < 0) { m.x = width + random(50); }
  });
  farClouds.forEach(c => {
    c.x -= gameSpeed * 0.2;
    if (c.x + c.w < 0) { c.x = width + random(50); }
  });
  nearClouds.forEach(c => {
    c.x -= gameSpeed * 0.5;
    if (c.x + c.w < 0) { c.x = width + random(50); }
  });
}

function updateColors() {
    // Define keyframe colors for the day/night cycle
    const noonSky = color(135, 206, 235);
    const duskSky = color(255, 140, 0);
    const nightSky = color(25, 25, 112);
    const dawnSky = color(255, 105, 180);

    const noonGround = color(139, 69, 19);
    const nightGround = color(47, 23, 7);

    const noonMountain = color(169, 169, 169);
    const nightMountain = color(60, 60, 60);

    if (timeOfDay < 0.25) { // Day -> Dusk
        let t = map(timeOfDay, 0, 0.25, 0, 1);
        skyColor = lerpColor(noonSky, duskSky, t);
        groundColor = lerpColor(noonGround, nightGround, t);
        mountainColor = lerpColor(noonMountain, nightMountain, t);
    } else if (timeOfDay < 0.5) { // Dusk -> Night
        let t = map(timeOfDay, 0.25, 0.5, 0, 1);
        skyColor = lerpColor(duskSky, nightSky, t);
        groundColor = nightGround;
        mountainColor = nightMountain;
    } else if (timeOfDay < 0.75) { // Night -> Dawn
        let t = map(timeOfDay, 0.5, 0.75, 0, 1);
        skyColor = lerpColor(nightSky, dawnSky, t);
        groundColor = lerpColor(nightGround, noonGround, t);
        mountainColor = lerpColor(nightMountain, noonMountain, t);
    } else { // Dawn -> Day
        let t = map(timeOfDay, 0.75, 1, 0, 1);
        skyColor = lerpColor(dawnSky, noonSky, t);
        groundColor = noonGround;
        mountainColor = noonMountain;
    }
}


// =================================================================
// CLASSES
// =================================================================

class Dino {
  constructor() {
    this.pixelSize = 3;
    this.baseY = height - groundHeight;
    this.w = 18 * this.pixelSize; // Based on art width
    this.h = 16 * this.pixelSize; // Based on art height
    this.x = 60;
    this.y = this.baseY - this.h;

    this.velocityY = 0;
    this.gravity = 0.8;
    this.jumpForce = -18;
    this.onGround = true;
  }

  jump() {
    if (this.onGround) {
      this.velocityY = this.jumpForce;
      this.onGround = false;
    }
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.baseY - this.h) {
      this.y = this.baseY - this.h;
      this.velocityY = 0;
      this.onGround = true;
    }
  }

  draw() {
    // Choose running animation frame
    let currentArt = (floor(frameCount / 6) % 2 === 0) ? dinoArt.run1 : dinoArt.run2;

    // Set color based on day/night
    fill(lerpColor(color(80), color(220), 0.5 + 0.5 * sin(timeOfDay * TWO_PI)));
    noStroke();
    drawPixelArt(currentArt, this.x, this.y, this.pixelSize);
  }
}

class Obstacle {
  constructor() {
    this.pixelSize = 4;
    let types = ['small', 'medium', 'large'];
    this.type = random(types);
    this.art = cactusArt[this.type];
    
    this.w = this.art[0].length * this.pixelSize;
    this.h = this.art.length * this.pixelSize;
    this.x = width;
    this.y = height - groundHeight - this.h;
  }

  update() {
    this.x -= gameSpeed;
  }

  draw() {
    // Set color based on day/night
    let baseColor = color(0, 100, 0);
    let nightColor = color(0, 50, 0);
    let currentColor = lerpColor(baseColor, nightColor, 0.5 - 0.5*sin(timeOfDay * TWO_PI));
    fill(currentColor);
    noStroke();
    drawPixelArt(this.art, this.x, this.y, this.pixelSize);
  }
  
  isOffscreen() {
    return this.x + this.w < 0;
  }
  
  collidesWith(player) {
    // Simple Axis-Aligned Bounding Box (AABB) collision
    let dinoBox = { x: player.x, y: player.y, w: player.w-10, h: player.h-10 }; // Make hitbox a little smaller
    let obsBox = { x: this.x, y: this.y, w: this.w-10, h: this.h-10 };
    
    return dinoBox.x < obsBox.x + obsBox.w &&
           dinoBox.x + dinoBox.w > obsBox.x &&
           dinoBox.y < obsBox.y + obsBox.h &&
           dinoBox.y + dinoBox.h > obsBox.y;
  }
}
