import { CONFIG } from './config.js';
import state from './state.js';

// --- TERRAIN GENERATION ---

export function generateTerrain() {
  let surfaceOffset = random(1000);
  let stoneOffset = random(1000);

  for (let x = 0; x < state.cols; x++) {
    state.grid[x] = [];
    let surfaceY = map(noise(surfaceOffset + x * 0.02), 0, 1, state.rows * 0.4, state.rows * 0.8);
    for (let y = 0; y < state.rows; y++) {
      if (y < surfaceY) state.grid[x][y] = 0;
      else {
        let stoneVal = noise(stoneOffset + x * 0.05, stoneOffset + y * 0.05);
        state.grid[x][y] = stoneVal > 0.65 ? 2 : 1;
      }
    }
  }
  state.terrainDirty = true;
}

// --- TERRAIN RENDERING (cached to offscreen buffer) ---

export function renderTerrainBuffer() {
  state.terrainBuffer.noStroke();
  state.terrainBuffer.clear();

  for (let x = 0; x < state.cols; x++) {
    for (let y = 0; y < state.rows; y++) {
      if (state.grid[x][y] === 1) {
        let texture = noise(x * 0.12, y * 0.18) * 20;
        state.terrainBuffer.fill(237 + texture * 0.35, 201 + texture * 0.45, 175 + texture * 0.25);
        state.terrainBuffer.rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, CONFIG.CELL_SIZE + 0.6, 1.2);

        if (y > 0 && state.grid[x][y - 1] === 0) {
          state.terrainBuffer.fill(250, 235, 210, 140);
          state.terrainBuffer.rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, 1.8, 1.0);
        }
      } else if (state.grid[x][y] === 2) {
        let texture = noise(x * 0.12, y * 0.10) * 18;
        state.terrainBuffer.fill(100 + texture, 100 + texture * 0.6, 110 + texture * 0.4);
        state.terrainBuffer.rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, CONFIG.CELL_SIZE + 0.6, 1.2);

        if (y > 0 && state.grid[x][y - 1] !== 2) {
          state.terrainBuffer.fill(160, 160, 170, 85);
          state.terrainBuffer.rect(x * CONFIG.CELL_SIZE + 0.5, y * CONFIG.CELL_SIZE + 0.5, CONFIG.CELL_SIZE + 0.6, 1.8, 1.0);
        }
      }
    }
  }

  state.terrainBuffer.fill(35, 60, 90, 18);
  state.terrainBuffer.rect(0, height - 10, width, 10);
  state.terrainDirty = false;
}

export function drawTerrain() {
  if (state.terrainDirty) {
    renderTerrainBuffer();
  }
  image(state.terrainBuffer, 0, 0);
}

export function dropTanksToGround() {
  for (let y = 0; y < state.rows; y++) {
    if (state.grid[state.tank1.x][y] !== 0) { state.tank1.y = y - state.tank1.height; break; }
  }
  for (let y = 0; y < state.rows; y++) {
    if (state.grid[state.tank2.x][y] !== 0) { state.tank2.y = y - state.tank2.height; break; }
  }
}
