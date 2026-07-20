/**
 * @jest-environment jsdom
 */

import { roundTo6 } from './js/utils.js';
import { ConversionRegistry, convertTemperature, FACTORS } from './js/conversion-registry.js';

describe('Calculator & Unit Converter Logic (Modular)', () => {

  describe('Rounding Utility roundTo6()', () => {
    test('strips trailing zeros', () => {
      expect(roundTo6(3.5000)).toBe('3.5');
    });
    test('strips trailing decimal point when integer', () => {
      expect(roundTo6(4.0)).toBe('4');
    });
    test('rounds to 6 decimal places', () => {
      expect(roundTo6(1.123456789)).toBe('1.123457');
    });
    test('fixes floating point inaccuracy (0.1 + 0.2)', () => {
      expect(roundTo6(0.1 + 0.2)).toBe('0.3');
    });
  });

  describe('Percentage Logic', () => {
    test('standalone percentage (50%)', () => {
      expect(roundTo6(50 / 100)).toBe('0.5');
    });
    test('additive percentage (200 + 15%)', () => {
      const base = 200;
      const pct = 15;
      const secondOperand = base * (pct / 100);
      expect(roundTo6(base + secondOperand)).toBe('230');
    });
    test('multiplicative percentage (200 * 15%)', () => {
      const base = 200;
      const pct = 15;
      const secondOperand = pct / 100; // 0.15
      expect(roundTo6(base * secondOperand)).toBe('30');
    });
  });

  describe('Unit Conversions via ConversionRegistry', () => {
    test('Length: km to m', () => {
      expect(ConversionRegistry.convert(1, 'km', 'm', 'Length')).toBe(1000);
    });
    test('Length: mile to km', () => {
      expect(ConversionRegistry.convert(1, 'mile', 'km', 'Length')).toBeCloseTo(1.609344);
    });
    test('Speed: exact m/s to km/h (1 m/s = 3.6 km/h)', () => {
      expect(ConversionRegistry.convert(1, 'm/s', 'km/h', 'Speed')).toBeCloseTo(3.6);
    });
    test('Temperature: 0 °C to 32 °F', () => {
      expect(ConversionRegistry.convert(0, '°C', '°F', 'Temperature')).toBe(32);
    });
    test('Temperature: -40 °C to -40 °F', () => {
      expect(ConversionRegistry.convert(-40, '°C', '°F', 'Temperature')).toBe(-40);
    });
    test('Temperature: rejects temperatures below Absolute Zero', () => {
      expect(ConversionRegistry.convert(-300, '°C', 'K', 'Temperature')).toBeNaN();
    });
    test('Weight: kg to g', () => {
      expect(ConversionRegistry.convert(1, 'kg', 'g', 'Weight/Mass')).toBe(1000);
    });
    test('Area: km² to m²', () => {
      expect(ConversionRegistry.convert(1, 'km²', 'm²', 'Area')).toBe(1000000);
    });
    test('Categories and units query', () => {
      expect(ConversionRegistry.getCategories()).toEqual(['Length', 'Weight/Mass', 'Temperature', 'Area', 'Volume', 'Speed']);
      expect(ConversionRegistry.getUnits('Temperature')).toEqual(['°C', '°F', 'K']);
    });
  });
});
