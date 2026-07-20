import { CANVAS_WIDTH, CANVAS_HEIGHT } from './js/config.js';
import { Bird } from './js/bird.js';
import { PipeManager } from './js/pipes.js';
import { GameStateManager, STATE } from './js/game-state.js';

/*
 * Flappy Kiro — Orchestrator Entrypoint (sketch.js)
 * Coordinates canvas setup, user input events, physics loop, and rendering.
 */
document.title = "Flappy Kiro";

// Setup Canvas
const canvas = document.createElement("canvas");
canvas.id = "game";
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// Game Instances
const bird = new Bird();
const pipeManager = new PipeManager();
const gameState = new GameStateManager();

function reset() {
  bird.reset();
  pipeManager.reset();
  gameState.start();
}

function onTap() {
  if (gameState.state === STATE.START) {
    reset();
    return;
  }
  if (gameState.state === STATE.OVER) {
    reset();
    return;
  }
  bird.jump();
}

// Input Event Handlers
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    onTap();
  }
});

canvas.addEventListener("click", onTap);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  onTap();
});

// Update Cycle
function update() {
  if (gameState.state !== STATE.PLAY) return;

  bird.update();
  pipeManager.update(bird, () => gameState.incrementScore());

  if (pipeManager.collidesWith(bird)) {
    gameState.gameOver();
  }
}

// Draw Cycle
function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  gameState.renderHUD(ctx);

  if (gameState.state !== STATE.START) {
    pipeManager.render(ctx);
    bird.render(ctx);
    gameState.renderScore(ctx);
  }

  gameState.renderGameOver(ctx);
}

// Main Game Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
