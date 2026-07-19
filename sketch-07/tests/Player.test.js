import './setup.js';
import { state } from '../src/state.js';
import { Player } from '../src/components/Player.js';
import { Projectile } from '../src/components/Projectile.js';

describe('Player Logic', () => {
  let player;

  beforeEach(() => {
    player = new Player();
    state.particles = [];
    state.projectiles = [];
  });

  test('initializes with correct defaults', () => {
    expect(player.x).toBe(300); // width / 2
    expect(player.y).toBe(570); // height - 80
    expect(player.health).toBe(100);
    expect(player.shieldActive).toBe(false);
    expect(player.tripleTime).toBe(0);
    expect(player.beamTime).toBe(0);
  });

  test('updates position towards mouse cursor', () => {
    global.mouseX = 400;
    global.mouseY = 550;
    player.update();
    expect(player.x).toBeGreaterThan(300);
    expect(player.y).toBeLessThan(570);
  });

  test('keeps ship constrained inside boundary', () => {
    global.mouseX = 1000;
    global.mouseY = 1000;
    player.update();
    expect(player.x).toBeLessThanOrEqual(600 - player.width / 2);
    expect(player.y).toBeLessThanOrEqual(650 - 30);
  });

  test('takes health damage and spawns particles', () => {
    player.damage(30);
    expect(player.health).toBe(70);
    expect(state.particles.length).toBeGreaterThan(0);
    expect(global.sounds.playHit).toHaveBeenCalled();
  });

  test('shield powerup absorbs damage without losing health', () => {
    player.applyPowerup('shield');
    expect(player.shieldActive).toBe(true);
    
    player.damage(30);
    expect(player.health).toBe(100); 
  });

  test('spawns projectiles when shooting', () => {
    player.shoot();
    expect(state.projectiles.length).toBe(1);
    expect(global.sounds.playLaser).toHaveBeenCalled();
  });

  test('triple shot powerup shoots 3 lasers at once', () => {
    player.applyPowerup('triple');
    player.shoot();
    expect(state.projectiles.length).toBe(3);
  });

  test('triple shot and plasma beam powerups can stack', () => {
    player.applyPowerup('triple');
    player.applyPowerup('beam');
    player.shoot();
    expect(state.projectiles.length).toBe(3);
    expect(state.projectiles[0].type).toBe('beam');
    expect(state.projectiles[1].type).toBe('beam');
    expect(state.projectiles[2].type).toBe('beam');
  });

  test('health repair heals player but stays within max limit', () => {
    player.health = 40;
    player.applyPowerup('repair');
    expect(player.health).toBe(80);

    player.applyPowerup('repair');
    expect(player.health).toBe(100);
  });
});
