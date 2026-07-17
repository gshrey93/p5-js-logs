// sketch.test.js — TDD Red Phase: All tests written BEFORE implementation
// These define the contract for every module.

import { CONFIG, GAME_STATE } from './config.js';
import { Dino, dinoArt } from './dino.js';
import { Obstacle, cactusArt } from './obstacle.js';
import { Booster, BOOSTER_TYPE } from './booster.js';

// ============================================================
// Mock p5.js globals used by game classes
// ============================================================
beforeAll(() => {
  // p5 drawing stubs — these do nothing but prevent ReferenceErrors
  global.color = (...args) => ({ r: args[0], g: args[1], b: args[2], a: args[3] });
  global.fill = () => {};
  global.noFill = () => {};
  global.stroke = () => {};
  global.noStroke = () => {};
  global.strokeWeight = () => {};
  global.rect = () => {};
  global.ellipse = () => {};
  global.push = () => {};
  global.pop = () => {};
  global.translate = () => {};
  global.beginShape = () => {};
  global.endShape = () => {};
  global.vertex = () => {};
  global.lerpColor = (a, b, t) => a;
  global.sin = Math.sin;
  global.cos = Math.cos;
  global.map = (v, s1, e1, s2, e2) => s2 + ((v - s1) / (e1 - s1)) * (e2 - s2);
  global.constrain = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  global.floor = Math.floor;
  global.random = (...args) => {
    if (args.length === 0) return 0.5;
    if (args.length === 1) {
      if (Array.isArray(args[0])) return args[0][0];
      return args[0] * 0.5;
    }
    return (args[0] + args[1]) / 2;
  };
  global.width = CONFIG.CANVAS_WIDTH;
  global.height = CONFIG.CANVAS_HEIGHT;
  global.frameCount = 10;
  global.TWO_PI = Math.PI * 2;
  global.CLOSE = 'CLOSE';
});

// ============================================================
// 1. CONFIG & GAME_STATE
// ============================================================
describe('CONFIG', () => {
  test('has all expected keys with valid number values', () => {
    const expectedKeys = [
      'CANVAS_WIDTH', 'CANVAS_HEIGHT', 'GROUND_HEIGHT',
      'INITIAL_SPEED', 'SPEED_INCREASE', 'JUMP_FORCE',
      'GRAVITY', 'DAY_NIGHT_SPEED', 'DINO_PIXEL_SIZE',
      'HITBOX_SHRINK', 'BOOSTER_DURATION', 'STREAK_MILESTONE',
    ];
    expectedKeys.forEach(key => {
      expect(CONFIG).toHaveProperty(key);
      expect(typeof CONFIG[key]).toBe('number');
    });
  });

  test('CANVAS dimensions are positive', () => {
    expect(CONFIG.CANVAS_WIDTH).toBeGreaterThan(0);
    expect(CONFIG.CANVAS_HEIGHT).toBeGreaterThan(0);
  });

  test('JUMP_FORCE is negative (upward)', () => {
    expect(CONFIG.JUMP_FORCE).toBeLessThan(0);
  });

  test('GRAVITY is positive (downward)', () => {
    expect(CONFIG.GRAVITY).toBeGreaterThan(0);
  });

  test('HITBOX_SHRINK is between 0 and 1', () => {
    expect(CONFIG.HITBOX_SHRINK).toBeGreaterThan(0);
    expect(CONFIG.HITBOX_SHRINK).toBeLessThanOrEqual(1);
  });
});

describe('GAME_STATE', () => {
  test('has START, PLAY, GAME_OVER values', () => {
    expect(GAME_STATE.START).toBeDefined();
    expect(GAME_STATE.PLAY).toBeDefined();
    expect(GAME_STATE.GAME_OVER).toBeDefined();
  });

  test('all values are unique', () => {
    const values = Object.values(GAME_STATE);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ============================================================
// 2. DINO
// ============================================================
describe('Dino', () => {
  let dino;

  beforeEach(() => {
    dino = new Dino();
  });

  // --- Constructor ---
  test('initializes with correct ground position', () => {
    const expectedBaseY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
    expect(dino.baseY).toBe(expectedBaseY);
    expect(dino.y).toBe(expectedBaseY - dino.h);
  });

  test('starts on the ground', () => {
    expect(dino.onGround).toBe(true);
  });

  test('starts with zero velocity', () => {
    expect(dino.velocityY).toBe(0);
  });

  test('starts with zero streak count', () => {
    expect(dino.streakCount).toBe(0);
  });

  test('starts not crouching', () => {
    expect(dino.isCrouching).toBe(false);
  });

  // --- Jump ---
  test('jump() applies jumpForce when on ground', () => {
    dino.jump();
    expect(dino.velocityY).toBe(CONFIG.JUMP_FORCE);
    expect(dino.onGround).toBe(false);
  });

  test('jump() does nothing when already airborne', () => {
    dino.jump();
    const velocityAfterFirstJump = dino.velocityY;
    dino.jump(); // try again mid-air
    expect(dino.velocityY).toBe(velocityAfterFirstJump);
  });

  // --- Update / Gravity ---
  test('update() applies gravity to velocity', () => {
    dino.jump();
    const velocityBeforeUpdate = dino.velocityY;
    dino.update();
    expect(dino.velocityY).toBe(velocityBeforeUpdate + CONFIG.GRAVITY);
  });

  test('update() clamps dino to ground', () => {
    // Force dino below ground
    dino.y = dino.baseY + 100;
    dino.velocityY = 10;
    dino.onGround = false;
    dino.update();
    expect(dino.y).toBe(dino.baseY - dino.h);
    expect(dino.onGround).toBe(true);
    expect(dino.velocityY).toBe(0);
  });

  // --- Crouch ---
  test('crouch() sets isCrouching to true', () => {
    dino.crouch();
    expect(dino.isCrouching).toBe(true);
  });

  test('uncrouch() sets isCrouching to false', () => {
    dino.crouch();
    dino.uncrouch();
    expect(dino.isCrouching).toBe(false);
  });

  test('crouching reduces hitbox height', () => {
    const normalBox = dino.getHitbox();
    dino.crouch();
    const crouchBox = dino.getHitbox();
    expect(crouchBox.h).toBeLessThan(normalBox.h);
  });

  test('crouching repositions dino Y to stay on ground', () => {
    dino.crouch();
    // Dino should still be touching the ground plane
    const box = dino.getHitbox();
    expect(box.y + box.h).toBeLessThanOrEqual(dino.baseY + 5); // small tolerance
  });

  // --- Hitbox ---
  test('getHitbox() returns object with x, y, w, h', () => {
    const box = dino.getHitbox();
    expect(box).toHaveProperty('x');
    expect(box).toHaveProperty('y');
    expect(box).toHaveProperty('w');
    expect(box).toHaveProperty('h');
  });

  test('hitbox is smaller than visual size (shrink factor)', () => {
    const box = dino.getHitbox();
    expect(box.w).toBeLessThan(dino.w);
    expect(box.h).toBeLessThan(dino.h);
  });

  // --- Streak / Celebration ---
  test('incrementStreak() increases streakCount', () => {
    dino.incrementStreak();
    expect(dino.streakCount).toBe(1);
    dino.incrementStreak();
    expect(dino.streakCount).toBe(2);
  });

  test('resetStreak() sets streakCount to zero', () => {
    dino.incrementStreak();
    dino.incrementStreak();
    dino.resetStreak();
    expect(dino.streakCount).toBe(0);
  });

  test('isCelebrating() returns true at streak milestones', () => {
    for (let i = 0; i < CONFIG.STREAK_MILESTONE; i++) {
      dino.incrementStreak();
    }
    expect(dino.isCelebrating()).toBe(true);
  });

  test('isCelebrating() returns false between milestones', () => {
    dino.incrementStreak(); // just 1
    expect(dino.isCelebrating()).toBe(false);
  });
});

describe('dinoArt', () => {
  test('has run1, run2, jump, crouch1, crouch2, happy, hit frames', () => {
    expect(dinoArt).toHaveProperty('run1');
    expect(dinoArt).toHaveProperty('run2');
    expect(dinoArt).toHaveProperty('jump');
    expect(dinoArt).toHaveProperty('crouch1');
    expect(dinoArt).toHaveProperty('crouch2');
    expect(dinoArt).toHaveProperty('happy');
    expect(dinoArt).toHaveProperty('hit');
  });

  test('all frames are non-empty arrays of strings', () => {
    Object.values(dinoArt).forEach(frame => {
      expect(Array.isArray(frame)).toBe(true);
      expect(frame.length).toBeGreaterThan(0);
      frame.forEach(row => expect(typeof row).toBe('string'));
    });
  });

  test('happy frame has raised arms (█ characters higher than run1)', () => {
    // The happy frame should have filled pixels in the upper rows
    // that represent raised arms — we check that row 0-2 have more
    // filled chars than the run1 frame (arms up vs arms down)
    const happyTopPixels = dinoArt.happy.slice(0, 4).join('').replace(/[^█]/g, '').length;
    const run1TopPixels = dinoArt.run1.slice(0, 4).join('').replace(/[^█]/g, '').length;
    expect(happyTopPixels).toBeGreaterThan(run1TopPixels);
  });
});

// ============================================================
// 3. OBSTACLE
// ============================================================
describe('Obstacle', () => {
  let obs;

  beforeEach(() => {
    obs = new Obstacle(6); // pass gameSpeed
  });

  test('spawns at right edge of screen', () => {
    expect(obs.x).toBe(CONFIG.CANVAS_WIDTH);
  });

  test('spawns on the ground', () => {
    const expectedBottom = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
    expect(obs.y + obs.h).toBeCloseTo(expectedBottom, 0);
  });

  test('has positive width and height', () => {
    expect(obs.w).toBeGreaterThan(0);
    expect(obs.h).toBeGreaterThan(0);
  });

  test('update() moves obstacle left by gameSpeed', () => {
    const startX = obs.x;
    obs.update(6);
    expect(obs.x).toBe(startX - 6);
  });

  test('isOffscreen() returns false when on screen', () => {
    expect(obs.isOffscreen()).toBe(false);
  });

  test('isOffscreen() returns true when fully past left edge', () => {
    obs.x = -obs.w - 1;
    expect(obs.isOffscreen()).toBe(true);
  });

  // --- Collision ---
  test('collidesWith() returns true when overlapping', () => {
    const fakeDino = {
      getHitbox: () => ({ x: obs.x, y: obs.y, w: obs.w, h: obs.h })
    };
    expect(obs.collidesWith(fakeDino)).toBe(true);
  });

  test('collidesWith() returns false when dino is far left', () => {
    const fakeDino = {
      getHitbox: () => ({ x: 0, y: obs.y, w: 20, h: 20 })
    };
    expect(obs.collidesWith(fakeDino)).toBe(false);
  });

  test('collidesWith() returns false when dino is above', () => {
    const fakeDino = {
      getHitbox: () => ({ x: obs.x, y: 0, w: 20, h: 5 })
    };
    expect(obs.collidesWith(fakeDino)).toBe(false);
  });

  test('hitbox uses percentage-based shrink, not magic number', () => {
    const box = obs.getHitbox();
    // Should be smaller than full visual size
    expect(box.w).toBeLessThan(obs.w);
    expect(box.h).toBeLessThan(obs.h);
    // Should be close to HITBOX_SHRINK ratio
    expect(box.w).toBeCloseTo(obs.w * CONFIG.HITBOX_SHRINK, 0);
    expect(box.h).toBeCloseTo(obs.h * CONFIG.HITBOX_SHRINK, 0);
  });
});

describe('cactusArt', () => {
  test('has small, medium, large types', () => {
    expect(cactusArt).toHaveProperty('small');
    expect(cactusArt).toHaveProperty('medium');
    expect(cactusArt).toHaveProperty('large');
  });
});

// ============================================================
// 4. BOOSTER
// ============================================================
describe('BOOSTER_TYPE', () => {
  test('has SHIELD, MAGNET, SPEED_BURST, SLOW_MO types', () => {
    expect(BOOSTER_TYPE.SHIELD).toBeDefined();
    expect(BOOSTER_TYPE.MAGNET).toBeDefined();
    expect(BOOSTER_TYPE.SPEED_BURST).toBeDefined();
    expect(BOOSTER_TYPE.SLOW_MO).toBeDefined();
  });

  test('does NOT have DOUBLE_JUMP', () => {
    expect(BOOSTER_TYPE.DOUBLE_JUMP).toBeUndefined();
  });

  test('all values are unique', () => {
    const values = Object.values(BOOSTER_TYPE);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('Booster', () => {
  let booster;

  beforeEach(() => {
    booster = new Booster(BOOSTER_TYPE.SHIELD, 6);
  });

  test('spawns at right edge of screen', () => {
    expect(booster.x).toBe(CONFIG.CANVAS_WIDTH);
  });

  test('has a type property', () => {
    expect(booster.type).toBe(BOOSTER_TYPE.SHIELD);
  });

  test('starts as not collected', () => {
    expect(booster.collected).toBe(false);
  });

  test('update() moves booster left', () => {
    const startX = booster.x;
    booster.update(6);
    expect(booster.x).toBe(startX - 6);
  });

  test('isOffscreen() returns true when past left edge', () => {
    booster.x = -booster.w - 1;
    expect(booster.isOffscreen()).toBe(true);
  });

  test('collidesWith() returns true when overlapping dino', () => {
    const fakeDino = {
      getHitbox: () => ({ x: booster.x, y: booster.y, w: booster.w, h: booster.h })
    };
    expect(booster.collidesWith(fakeDino)).toBe(true);
  });

  test('collidesWith() returns false when dino is far away', () => {
    const fakeDino = {
      getHitbox: () => ({ x: 0, y: 0, w: 10, h: 10 })
    };
    expect(booster.collidesWith(fakeDino)).toBe(false);
  });
});

describe('Booster — SLOW_MO duration', () => {
  test('SLOW_MO booster duration is 5 seconds (300 frames)', () => {
    const slowMo = new Booster(BOOSTER_TYPE.SLOW_MO, 6);
    // 5 seconds at 60fps = 300 frames
    expect(slowMo.duration).toBe(300);
  });
});

describe('Booster — SHIELD behavior', () => {
  test('shield booster has 1 hit of protection', () => {
    const shield = new Booster(BOOSTER_TYPE.SHIELD, 6);
    expect(shield.hits).toBe(1);
  });
});

// ============================================================
// 5. SCORE & HIGH SCORE
// ============================================================
describe('High Score (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns 0 when no high score is stored', () => {
    const stored = localStorage.getItem('dinoHighScore');
    expect(stored).toBeNull();
  });

  test('stores and retrieves a high score', () => {
    localStorage.setItem('dinoHighScore', '42');
    expect(localStorage.getItem('dinoHighScore')).toBe('42');
  });

  test('overwrites high score with a higher value', () => {
    localStorage.setItem('dinoHighScore', '42');
    const current = 100;
    const stored = parseInt(localStorage.getItem('dinoHighScore'), 10);
    if (current > stored) {
      localStorage.setItem('dinoHighScore', String(current));
    }
    expect(localStorage.getItem('dinoHighScore')).toBe('100');
  });

  test('does NOT overwrite high score with a lower value', () => {
    localStorage.setItem('dinoHighScore', '100');
    const current = 42;
    const stored = parseInt(localStorage.getItem('dinoHighScore'), 10);
    if (current > stored) {
      localStorage.setItem('dinoHighScore', String(current));
    }
    expect(localStorage.getItem('dinoHighScore')).toBe('100');
  });
});
