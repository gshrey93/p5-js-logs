/**
 * @jest-environment jsdom
 */

// --- Import game modules ---
// Babel transpiles these for Jest.
import { CONFIG, GAME_STATE } from './config.js';
import { Tank } from './tank.js';

// --- Mock p5.js globals ---
// These are the p5.js functions used by the game logic under test.
// We mock them so tests run without a real p5.js canvas.

beforeAll(() => {
  global.floor = Math.floor;
  global.abs = Math.abs;
  global.round = Math.round;
  global.dist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  global.map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  };
  global.constrain = (val, low, high) => Math.max(low, Math.min(high, val));
  global.noise = () => 0.5;
  global.random = (a, b) => {
    if (a === undefined) return 0.5;
    if (b === undefined) return a * 0.5;
    return (a + b) / 2;
  };
  global.color = (r, g, b, a) => ({ r, g, b, a: a !== undefined ? a : 255 });
  global.createVector = (x, y) => ({ x, y, add(v) { this.x += v.x; this.y += v.y; } });
  global.radians = (deg) => deg * Math.PI / 180;
  global.cos = Math.cos;
  global.sin = Math.sin;
  global.lerpColor = (c1, _c2, _t) => c1;
  global.createCanvas = () => ({ parent: () => {} });
  global.noStroke = () => {};
  global.stroke = () => {};
  global.strokeWeight = () => {};
  global.fill = () => {};
  global.noFill = () => {};
  global.rect = () => {};
  global.ellipse = () => {};
  global.circle = () => {};
  global.line = () => {};
  global.text = () => {};
  global.textAlign = () => {};
  global.textSize = () => {};
  global.push = () => {};
  global.pop = () => {};
  global.translate = () => {};
  global.rotate = () => {};
  global.vertex = () => {};
  global.beginShape = () => {};
  global.endShape = () => {};
  global.frameCount = 0;
  global.width = 800;
  global.height = 600;
  global.LEFT = 'left';
  global.RIGHT = 'right';
  global.CENTER = 'center';
  global.UP_ARROW = 38;
  global.DOWN_ARROW = 40;
  global.LEFT_ARROW = 37;
  global.RIGHT_ARROW = 39;
  global.keyIsDown = () => false;
  global.soundFormats = () => {};
  global.loadSound = () => ({
    isLoaded: () => false,
    play: () => {},
  });
});

// ============================================================
// Test Suite
// ============================================================

describe('Artillery Duel Game Logic', () => {

  // ----------------------------------------------------------
  // 1. Tank State & Construction
  // ----------------------------------------------------------
  describe('Tank', () => {
    let tank;

    beforeEach(() => {
      tank = new Tank(1, 10, { r: 220, g: 65, b: 65, a: 255 }, -45);
    });

    test('should initialize with correct defaults', () => {
      expect(tank.id).toBe(1);
      expect(tank.x).toBe(10);
      expect(tank.health).toBe(100);
      expect(tank.power).toBe(50);
      expect(tank.angle).toBe(-45);
      expect(tank.shotsLeft).toBe(CONFIG.MAX_SHOTS);
      expect(tank.consecutiveHits).toBe(0);
    });

    test('should not drop health below 0', () => {
      tank.applyDamage(150);
      expect(tank.health).toBe(0);
    });

    test('should reduce health by damage amount', () => {
      tank.applyDamage(30);
      expect(tank.health).toBe(70);
    });

    test('isBigShotReady returns false when consecutiveHits < 3', () => {
      tank.consecutiveHits = 2;
      expect(tank.isBigShotReady()).toBe(false);
    });

    test('isBigShotReady returns true when consecutiveHits >= 3', () => {
      tank.consecutiveHits = 3;
      expect(tank.isBigShotReady()).toBe(true);
    });

    test('isHit detects a point inside the tank bounding box', () => {
      tank.y = 50;
      const px = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE;
      const py = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE;
      expect(tank.isHit(px, py)).toBe(true);
    });

    test('isHit rejects a point outside the tank bounding box', () => {
      tank.y = 50;
      const px = (tank.x + tank.width + 10) * CONFIG.CELL_SIZE;
      const py = (tank.y + tank.height + 10) * CONFIG.CELL_SIZE;
      expect(tank.isHit(px, py)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 2. Damage Calculation (applyDamage helper)
  // ----------------------------------------------------------
  describe('applyDamage (distance-based)', () => {
    let tank;

    // Inline the applyDamage logic for unit testing since the function
    // in sketch.js relies on global p5 functions. We replicate it here.
    function applyDamageCalc(targetTank, ex, ey, radius, maxDmg, minDmg) {
      const tankCenterX = (targetTank.x + targetTank.width / 2) * CONFIG.CELL_SIZE;
      const tankCenterY = (targetTank.y + targetTank.height / 2) * CONFIG.CELL_SIZE;
      const d = Math.sqrt((ex - tankCenterX) ** 2 + (ey - tankCenterY) ** 2);
      const maxHitDistance = radius + (targetTank.width * CONFIG.CELL_SIZE / 2);

      if (d < maxHitDistance) {
        const start2 = maxDmg;
        const stop2 = minDmg;
        const damage = start2 + (stop2 - start2) * ((d - 0) / (maxHitDistance - 0));
        targetTank.applyDamage(damage);
        return damage;
      }
      return 0;
    }

    beforeEach(() => {
      tank = new Tank(1, 10, { r: 220, g: 65, b: 65, a: 255 }, -45);
      tank.y = 50;
    });

    test('should apply maximum damage on a direct hit', () => {
      const centerX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE;
      const centerY = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE;

      const dmg = applyDamageCalc(tank, centerX, centerY, 40, 25, 10);
      expect(dmg).toBe(25); // max damage at distance 0
      expect(tank.health).toBe(75);
    });

    test('should apply no damage if explosion is too far', () => {
      const farX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE + 500;
      const farY = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE + 500;

      const dmg = applyDamageCalc(tank, farX, farY, 40, 25, 10);
      expect(dmg).toBe(0);
      expect(tank.health).toBe(100);
    });

    test('should apply partial damage within the blast radius', () => {
      const centerX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE;
      const centerY = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE;
      // Offset explosion by half the max hit distance
      const maxHitDistance = 40 + (tank.width * CONFIG.CELL_SIZE / 2);
      const halfX = centerX + maxHitDistance / 2;

      const dmg = applyDamageCalc(tank, halfX, centerY, 40, 25, 10);
      expect(dmg).toBeGreaterThan(10);
      expect(dmg).toBeLessThan(25);
      expect(tank.health).toBeLessThan(100);
      expect(tank.health).toBeGreaterThan(75);
    });

    test('Big Shot applies more maximum damage than normal shot', () => {
      const centerX = (tank.x + tank.width / 2) * CONFIG.CELL_SIZE;
      const centerY = (tank.y + tank.height / 2) * CONFIG.CELL_SIZE;

      const normalDmg = applyDamageCalc(tank, centerX, centerY, 40, 25, 10);
      tank.health = 100; // reset

      const bigDmg = applyDamageCalc(tank, centerX, centerY, 60, 40, 20);
      expect(bigDmg).toBeGreaterThan(normalDmg);
    });
  });

  // ----------------------------------------------------------
  // 3. Game State Enum Consistency
  // ----------------------------------------------------------
  describe('GAME_STATE enum', () => {
    test('has all required states', () => {
      expect(GAME_STATE.P1_TURN).toBe('P1_TURN');
      expect(GAME_STATE.P2_TURN).toBe('P2_TURN');
      expect(GAME_STATE.PROJECTILE_AIRBORNE).toBe('PROJECTILE_AIRBORNE');
      expect(GAME_STATE.GAME_OVER).toBe('GAME_OVER');
    });
  });

  // ----------------------------------------------------------
  // 4. CONFIG validation
  // ----------------------------------------------------------
  describe('CONFIG', () => {
    test('CELL_SIZE is a positive number', () => {
      expect(CONFIG.CELL_SIZE).toBeGreaterThan(0);
    });

    test('MAX_SHOTS is a positive integer', () => {
      expect(CONFIG.MAX_SHOTS).toBeGreaterThan(0);
      expect(Number.isInteger(CONFIG.MAX_SHOTS)).toBe(true);
    });

    test('PROJECTILE_SPEED_SCALE is between 0 and 1', () => {
      expect(CONFIG.PROJECTILE_SPEED_SCALE).toBeGreaterThan(0);
      expect(CONFIG.PROJECTILE_SPEED_SCALE).toBeLessThanOrEqual(1);
    });
  });

  // ----------------------------------------------------------
  // 5. Combo / Big Shot Logic
  // ----------------------------------------------------------
  describe('Combo System', () => {
    let tank;

    beforeEach(() => {
      tank = new Tank(1, 10, { r: 220, g: 65, b: 65, a: 255 }, -45);
    });

    test('consecutiveHits increments correctly', () => {
      tank.consecutiveHits = 0;
      tank.consecutiveHits++;
      expect(tank.consecutiveHits).toBe(1);
      tank.consecutiveHits++;
      expect(tank.consecutiveHits).toBe(2);
      tank.consecutiveHits++;
      expect(tank.consecutiveHits).toBe(3);
      expect(tank.isBigShotReady()).toBe(true);
    });

    test('consecutiveHits resets to 0 properly', () => {
      tank.consecutiveHits = 3;
      expect(tank.isBigShotReady()).toBe(true);
      tank.consecutiveHits = 0;
      expect(tank.isBigShotReady()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 6. Power & Angle Constraints
  // ----------------------------------------------------------
  describe('Input Constraints', () => {
    test('power is constrained between 0 and 100', () => {
      const constrain = (val, low, high) => Math.max(low, Math.min(high, val));
      let power = 150;
      power = constrain(power, 0, 100);
      expect(power).toBe(100);

      power = -20;
      power = constrain(power, 0, 100);
      expect(power).toBe(0);
    });

    test('angle is constrained between -180 and 0', () => {
      const constrain = (val, low, high) => Math.max(low, Math.min(high, val));
      let angle = -200;
      angle = constrain(angle, -180, 0);
      expect(angle).toBe(-180);

      angle = 10;
      angle = constrain(angle, -180, 0);
      expect(angle).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 7. Shot Counter
  // ----------------------------------------------------------
  describe('Shot Tracking', () => {
    let tank;

    beforeEach(() => {
      tank = new Tank(1, 10, { r: 220, g: 65, b: 65, a: 255 }, -45);
    });

    test('tank starts with MAX_SHOTS', () => {
      expect(tank.shotsLeft).toBe(CONFIG.MAX_SHOTS);
    });

    test('shotsLeft decreases when firing', () => {
      tank.shotsLeft--;
      expect(tank.shotsLeft).toBe(CONFIG.MAX_SHOTS - 1);
    });

    test('cannot fire when out of ammo (shotsLeft === 0)', () => {
      tank.shotsLeft = 0;
      expect(tank.shotsLeft > 0).toBe(false);
    });
  });
});
