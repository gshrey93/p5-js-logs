import { CONFIG, GAME_STATE } from './config.js';

// Shared mutable game state — imported by all modules.
// This avoids passing state through function parameters everywhere
// while keeping a single source of truth.

const state = {
  cols: 0,
  rows: 0,
  grid: [],
  terrainBuffer: null,
  terrainDirty: true,

  gameState: GAME_STATE.P1_TURN,
  tank1: null,
  tank2: null,
  currentProjectile: null,
  impactEffects: [],
  launchSparks: [],
  clouds: [],

  // DOM / UI helpers
  gameOverlay: null,
  gameStatusText: null,
  restartButton: null,

  // Sound Effects
  fireSound: null,
  explosionSound: null,

  // Environment Modifiers
  wind: 0,
  gravityForce: 0.2,
};

export default state;
