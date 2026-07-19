import './setup.js';
import { Projectile } from '../src/components/Projectile.js';
import { Enemy } from '../src/components/Enemy.js';

describe('Projectile Logic', () => {
  test('updates coordinate based on velocity', () => {
    const proj = new Projectile(100, 200, 2, -6, true);
    proj.update();
    expect(proj.x).toBe(102);
    expect(proj.y).toBe(194);
  });

  test('correctly identifies offscreen coordinates', () => {
    const p1 = new Projectile(100, 200, 0, 0, true);
    const p2 = new Projectile(100, -100, 0, 0, true); 
    const p3 = new Projectile(100, 800, 0, 0, true);  

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
