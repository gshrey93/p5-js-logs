import { Player, Projectile, Enemy, Powerup, Particle, FloatingText, COLORS } from './sketch.js';

// Setup Mock Environment for p5.js and DOM
beforeAll(() => {
  global.width = 600;
  global.height = 650;
  global.min = Math.min;
  global.max = Math.max;
  global.LEFT_ARROW = 37;
  global.RIGHT_ARROW = 39;
  global.UP_ARROW = 38;
  global.DOWN_ARROW = 40;
  global.random = (a, b) => {
    if (Array.isArray(a)) return a[0];
    if (typeof a === 'number' && typeof b === 'number') return (a + b) / 2;
    if (typeof a === 'number') return a * 0.5;
    return 0.5;
  };
  global.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  global.constrain = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  global.map = (v, s1, e1, s2, e2) => s2 + ((v - s1) / (e1 - s1)) * (e2 - s2);
  global.lerp = (start, stop, amt) => start + (stop - start) * amt;
  global.floor = Math.floor;
  global.sin = Math.sin;
  global.cos = Math.cos;
  global.deltaTime = 16.67; // 60 fps simulation
  global.millis = () => Date.now();
  global.color = (c) => ({
    setAlpha: () => {}
  });
  global.frameCount = 1;
  global.createCanvas = () => ({ parent: () => {} });
  global.background = () => {};
  global.translate = () => {};
  global.stroke = () => {};
  global.strokeWeight = () => {};
  global.noStroke = () => {};
  global.fill = () => {};
  global.noFill = () => {};
  global.ellipse = () => {};
  global.line = () => {};
  global.rect = () => {};
  global.beginShape = () => {};
  global.vertex = () => {};
  global.endShape = () => {};
  global.push = () => {};
  global.pop = () => {};
  global.rectMode = () => {};
  global.textSize = () => {};
  global.textAlign = () => {};
  global.textStyle = () => {};
  global.text = () => {};
  global.keyIsDown = () => false;
  global.keyCode = 0;
  global.key = '';
  global.mouseX = 300;
  global.mouseY = 500;
  global.CLOSE = 'CLOSE';
  global.CENTER = 'CENTER';
  global.BOLD = 'BOLD';
  global.drawingContext = { shadowBlur: 0, shadowColor: '' };

  // Setup sound mock
  global.sounds = {
    init: jest.fn(),
    playLaser: jest.fn(),
    playExplosion: jest.fn(),
    playHit: jest.fn(),
    playPowerup: jest.fn(),
    playGameOver: jest.fn()
  };

  // Mock global variables used in sketch updating
  global.particles = [];
  global.projectiles = [];
  global.enemies = [];
  global.powerups = [];
  global.floatingTexts = [];
  global.score = 0;
  global.highScore = 0;
  global.level = 1;
  global.bossActive = false;
  global.shakeTime = 0;
  global.shakeIntensity = 0;
  global.triggerScreenShake = jest.fn();

  // Mock DOM HUD Elements
  document.body.innerHTML = `
    <div id="hud-score">0</div>
    <div id="hud-high-score">0</div>
    <div id="hud-level">1</div>
    <div id="hud-powerup">NONE</div>
    <div id="health-bar-fill" style="width: 100%"></div>
    <div id="start-overlay"></div>
    <div id="gameover-overlay"></div>
    <div id="final-score">0</div>
  `;
});

describe('Player Logic', () => {
  let player;

  beforeEach(() => {
    player = new Player();
    global.particles = [];
    global.projectiles = [];
  });

  test('initializes with correct defaults', () => {
    expect(player.x).toBe(300); // width / 2
    expect(player.y).toBe(570); // height - 80
    expect(player.health).toBe(100);
    expect(player.shieldActive).toBe(false);
    expect(player.weaponType).toBe('normal');
  });

  test('updates position towards mouse cursor', () => {
    global.mouseX = 400;
    global.mouseY = 550;
    player.update();
    // Position should move towards mouse coordinate
    expect(player.x).toBeGreaterThan(300);
    expect(player.y).toBeLessThan(570);
  });

  test('keeps ship constrained inside boundary', () => {
    // Force mouse coordinates outside canvas boundaries
    global.mouseX = 1000;
    global.mouseY = 1000;
    player.update();
    expect(player.x).toBeLessThanOrEqual(600 - player.width / 2);
    expect(player.y).toBeLessThanOrEqual(650 - 30);
  });

  test('takes health damage and spawns particles', () => {
    player.damage(30);
    expect(player.health).toBe(70);
    expect(global.particles.length).toBeGreaterThan(0);
    expect(global.sounds.playHit).toHaveBeenCalled();
  });

  test('shield powerup absorbs damage without losing health', () => {
    player.applyPowerup('shield');
    expect(player.shieldActive).toBe(true);
    
    player.damage(30);
    expect(player.health).toBe(100); // No damage taken
  });

  test('spawns projectiles when shooting', () => {
    player.shoot();
    expect(global.projectiles.length).toBe(1);
    expect(global.sounds.playLaser).toHaveBeenCalled();
  });

  test('triple shot powerup shoots 3 lasers at once', () => {
    player.applyPowerup('triple');
    player.shoot();
    expect(global.projectiles.length).toBe(3);
  });

  test('health repair heals player but stays within max limit', () => {
    player.health = 40;
    player.applyPowerup('repair');
    expect(player.health).toBe(80);

    player.applyPowerup('repair');
    expect(player.health).toBe(100); // capped at maxHealth (100)
  });
});

describe('Projectile Logic', () => {
  test('updates coordinate based on velocity', () => {
    const proj = new Projectile(100, 200, 2, -6, true);
    proj.update();
    expect(proj.x).toBe(102);
    expect(proj.y).toBe(194);
  });

  test('correctly identifies offscreen coordinates', () => {
    const p1 = new Projectile(100, 200, 0, 0, true);
    const p2 = new Projectile(100, -100, 0, 0, true); // off top
    const p3 = new Projectile(100, 800, 0, 0, true);  // off bottom

    expect(p1.isOffscreen()).toBe(false);
    expect(p2.isOffscreen()).toBe(true);
    expect(p3.isOffscreen()).toBe(true);
  });

  test('registers collision hits', () => {
    const proj = new Projectile(100, 200, 0, 0, true);
    const enemy = new Enemy('drone');
    enemy.x = 102;
    enemy.y = 202;

    expect(proj.hits(enemy)).toBe(true);
  });
});

describe('Enemy Types', () => {
  test('spawns drone with default parameters', () => {
    const enemy = new Enemy('drone');
    expect(enemy.health).toBe(15);
    expect(enemy.scoreValue).toBe(100);
    expect(enemy.isBoss).toBe(false);
  });

  test('spawns boss with scaled health', () => {
    global.level = 2;
    const enemy = new Enemy('boss');
    expect(enemy.health).toBe(600); // 400 + level*100
    expect(enemy.scoreValue).toBe(1000);
    expect(enemy.isBoss).toBe(true);
  });

  test('correctly registers death status', () => {
    const enemy = new Enemy('swarmer');
    expect(enemy.isDead()).toBe(false);
    enemy.damage(10);
    expect(enemy.isDead()).toBe(true);
  });
});

describe('Powerup Logic', () => {
  test('moves downward under gravity speed', () => {
    const power = new Powerup(200, 100);
    power.update();
    expect(power.y).toBeGreaterThan(100);
  });
});
