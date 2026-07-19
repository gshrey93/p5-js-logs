import './setup.js';
import { state } from '../src/state.js';
import { Enemy } from '../src/components/Enemy.js';

describe('Enemy Types', () => {
  beforeEach(() => {
    state.level = 1;
    state.projectiles = [];
  });

  test('spawns drone with default parameters', () => {
    const enemy = new Enemy('drone');
    expect(enemy.health).toBe(15);
    expect(enemy.scoreValue).toBe(100);
    expect(enemy.isBoss).toBe(false);
  });

  test('spawns boss with scaled health and score', () => {
    state.level = 2;
    const enemy = new Enemy('boss');
    expect(enemy.health).toBe(700); // 400 + level * 150
    expect(enemy.maxHealth).toBe(700);
    expect(enemy.scoreValue).toBe(1400); // 1000 + level * 200
    expect(enemy.isBoss).toBe(true);
  });

  test('boss enters enraged phase below 50% health and fires 5-way spread', () => {
    state.level = 15;
    const enemy = new Enemy('boss');
    enemy.health = enemy.maxHealth * 0.4; // 40% health -> Enraged
    enemy.fireBarrage(true);
    
    expect(state.projectiles.length).toBe(5);
  });

  test('correctly registers death status', () => {
    const enemy = new Enemy('swarmer');
    expect(enemy.isDead()).toBe(false);
    enemy.damage(10);
    expect(enemy.isDead()).toBe(true);
  });
});
