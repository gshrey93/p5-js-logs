import './setup.js';
import { state } from '../src/state.js';
import { Enemy } from '../src/components/Enemy.js';

describe('Enemy Types', () => {
  beforeEach(() => {
    state.level = 1;
  });

  test('spawns drone with default parameters', () => {
    const enemy = new Enemy('drone');
    expect(enemy.health).toBe(15);
    expect(enemy.scoreValue).toBe(100);
    expect(enemy.isBoss).toBe(false);
  });

  test('spawns boss with scaled health', () => {
    state.level = 2;
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
