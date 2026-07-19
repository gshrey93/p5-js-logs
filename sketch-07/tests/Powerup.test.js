import './setup.js';
import { Powerup } from '../src/components/Powerup.js';

describe('Powerup Logic', () => {
  test('moves downward under gravity speed', () => {
    const power = new Powerup(200, 100);
    power.update();
    expect(power.y).toBeGreaterThan(100);
  });
});
