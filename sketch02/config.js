// config.js — Game constants and state enum

export const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  GROUND_HEIGHT: 50,
  INITIAL_SPEED: 6,
  SPEED_INCREASE: 0.001,
  JUMP_FORCE: -18,
  GRAVITY: 0.8,
  DAY_NIGHT_SPEED: 0.0001,
  DINO_PIXEL_SIZE: 3,
  OBSTACLE_PIXEL_SIZE: 4,
  HITBOX_SHRINK: 0.8,
  BOOSTER_DURATION: 300,   // frames (~5 seconds at 60fps)
  STREAK_MILESTONE: 5,     // celebrate every N obstacles cleared
};

export const GAME_STATE = {
  START: 'START',
  PLAY: 'PLAY',
  GAME_OVER: 'GAME_OVER',
};
