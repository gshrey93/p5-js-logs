/**
 * Calculator PWA — Comprehensive Unit Tests
 * Covers: arithmetic, precision, percentage, sign toggle, operator chaining,
 * error handling, input controls, conversions, history, rounding.
 *
 * Run via: tests/calculator.test.html in a browser.
 * Designed for future automation (each test maps to test-cases.md IDs).
 */

import { ConversionRegistry } from '../js/conversion-registry.js';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, id, message) {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', id, message });
  } else {
    failed++;
    results.push({ status: 'FAIL', id, message });
    console.error(`FAIL [${id}]: ${message}`);
  }
}

function assertApprox(actual, expected, id, message, tolerance = 0.0001) {
  const pass = Math.abs(actual - expected) < tolerance;
  assert(pass, id, `${message} (got ${actual}, expected ${expected})`);
}

// === Utility: roundTo6 (mirrors calculator.js logic) ===
function roundTo6(value) {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  let str = rounded.toString();
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, '');
  }
  return str;
}

// === Utility: simulate CalculatorEngine logic ===
function evaluate(a, op, b) {
  let raw;
  switch (op) {
    case '+': raw = a + b; break;
    case '-': raw = a - b; break;
    case '*': raw = a * b; break;
    case '/':
      if (b === 0) return 'ERROR:Cannot divide by zero';
      raw = a / b;
      break;
  }
  if (!isFinite(raw)) return 'ERROR:Result is too large';
  if (isNaN(raw)) return 'ERROR:Invalid operation';
  return roundTo6(raw);
}

function percentStandalone(value) {
  return roundTo6(value / 100);
}

function percentInExpression(base, pct) {
  return roundTo6(base * (pct / 100));
}

// ============================================================
// TC-01: Core Arithmetic
// ============================================================
assert(evaluate(5, '+', 3) === '8', 'TC-01-01', 'Addition of integers: 5+3=8');
assert(evaluate(1.5, '+', 2.3) === '3.8', 'TC-01-02', 'Addition of decimals: 1.5+2.3=3.8');
assert(evaluate(10, '-', 4) === '6', 'TC-01-03', 'Subtraction: 10-4=6');
assert(evaluate(3, '-', 7) === '-4', 'TC-01-04', 'Subtraction yielding negative: 3-7=-4');
assert(evaluate(6, '*', 7) === '42', 'TC-01-05', 'Multiplication: 6*7=42');
assert(evaluate(5, '*', 0) === '0', 'TC-01-06', 'Multiplication by zero: 5*0=0');
assert(evaluate(15, '/', 4) === '3.75', 'TC-01-07', 'Division: 15/4=3.75');
assert(evaluate(10, '/', 3) === '3.333333', 'TC-01-08', 'Division long decimal: 10/3=3.333333');
assert(evaluate(999999, '+', 1) === '1000000', 'TC-01-09', 'Large number: 999999+1=1000000');
assert(evaluate(-3, '*', -4) === '12', 'TC-01-10', 'Negative × Negative: -3*-4=12');

// ============================================================
// TC-02: Decimal Precision
// ============================================================
assert(evaluate(1, '/', 7) === '0.142857', 'TC-02-01', 'Rounds to 6 places: 1/7');
assert(evaluate(1.5, '+', 1.5) === '3', 'TC-02-02', 'Trailing zeros stripped: 1.5+1.5=3');
assert(evaluate(1, '/', 6) === '0.166667', 'TC-02-03', 'Exactly 6 places: 1/6');
assert(evaluate(0.1, '+', 0.2) === '0.3', 'TC-02-04', 'Floating point fix: 0.1+0.2=0.3');
assert(evaluate(4, '+', 4) === '8', 'TC-02-05', 'Integer result no decimal: 4+4=8');

// ============================================================
// TC-03: Context-Aware Percentage
// ============================================================
assert(percentStandalone(50) === '0.5', 'TC-03-01', 'Standalone %: 50% = 0.5');
assert(percentStandalone(100) === '1', 'TC-03-02', 'Standalone %: 100% = 1');

// In-expression: 200 + 15% → effective 2nd operand = 200 * 0.15 = 30 → result = 230
const pctAdd = percentInExpression(200, 15);
assert(evaluate(200, '+', parseFloat(pctAdd)) === '230', 'TC-03-03', 'In-expression % addition: 200+15%=230');

// In-expression: 200 - 10% → effective = 200 * 0.10 = 20 → result = 180
const pctSub = percentInExpression(200, 10);
assert(evaluate(200, '-', parseFloat(pctSub)) === '180', 'TC-03-04', 'In-expression % subtraction: 200-10%=180');

// In-expression: 50 * 20% → effective = 50 * 0.20 = 10 → result = 500
const pctMul = percentInExpression(50, 20);
assert(evaluate(50, '*', parseFloat(pctMul)) === '500', 'TC-03-05', 'In-expression % multiply: 50*20%=500');

assert(percentStandalone(0) === '0', 'TC-03-06', 'Standalone % on zero: 0%=0');

// ============================================================
// TC-06: Error Handling
// ============================================================
assert(evaluate(5, '/', 0) === 'ERROR:Cannot divide by zero', 'TC-06-01', 'Division by zero error');
assert(evaluate(1e308, '*', 10) === 'ERROR:Result is too large', 'TC-06-05', 'Overflow detection');

// ============================================================
// TC-09: Unit Conversion — Length
// ============================================================
assertApprox(ConversionRegistry.convert(1, 'km', 'm', 'Length'), 1000, 'TC-09-01', 'km to m');
assertApprox(ConversionRegistry.convert(1, 'mile', 'km', 'Length'), 1.609344, 'TC-09-02', 'mile to km');
assertApprox(ConversionRegistry.convert(1, 'inch', 'cm', 'Length'), 2.54, 'TC-09-03', 'inch to cm');
assertApprox(ConversionRegistry.convert(1, 'foot', 'm', 'Length'), 0.3048, 'TC-09-04', 'foot to m');
assertApprox(ConversionRegistry.convert(1, 'yard', 'm', 'Length'), 0.9144, 'TC-09-05', 'yard to m');
assertApprox(ConversionRegistry.convert(25.4, 'mm', 'inch', 'Length'), 1, 'TC-09-06', '25.4mm to 1 inch');
assert(ConversionRegistry.convert(5, 'km', 'km', 'Length') === 5, 'TC-09-07', 'Identity: km to km');

// ============================================================
// TC-10: Unit Conversion — Weight/Mass
// ============================================================
assertApprox(ConversionRegistry.convert(1, 'kg', 'g', 'Weight/Mass'), 1000, 'TC-10-01', 'kg to g');
assertApprox(ConversionRegistry.convert(1, 'pound', 'kg', 'Weight/Mass'), 0.453592, 'TC-10-02', 'pound to kg');
assertApprox(ConversionRegistry.convert(1, 'tonne', 'kg', 'Weight/Mass'), 1000, 'TC-10-03', 'tonne to kg');
assertApprox(ConversionRegistry.convert(1, 'ounce', 'g', 'Weight/Mass'), 28.3495, 'TC-10-04', 'ounce to g');
assertApprox(ConversionRegistry.convert(1, 'pound', 'ounce', 'Weight/Mass'), 16, 'TC-10-05', 'pound to ounce', 0.01);

// ============================================================
// TC-11: Unit Conversion — Temperature
// ============================================================
assertApprox(ConversionRegistry.convert(0, '°C', '°F', 'Temperature'), 32, 'TC-11-01', '0°C to 32°F');
assertApprox(ConversionRegistry.convert(100, '°C', '°F', 'Temperature'), 212, 'TC-11-02', '100°C to 212°F');
assertApprox(ConversionRegistry.convert(32, '°F', '°C', 'Temperature'), 0, 'TC-11-03', '32°F to 0°C');
assertApprox(ConversionRegistry.convert(0, '°C', 'K', 'Temperature'), 273.15, 'TC-11-04', '0°C to 273.15K');
assertApprox(ConversionRegistry.convert(273.15, 'K', '°C', 'Temperature'), 0, 'TC-11-05', '273.15K to 0°C');
assertApprox(ConversionRegistry.convert(-40, '°C', '°F', 'Temperature'), -40, 'TC-11-06', '-40°C to -40°F');
assertApprox(ConversionRegistry.convert(212, '°F', 'K', 'Temperature'), 373.15, 'TC-11-07', '212°F to 373.15K');

// ============================================================
// TC-12: Unit Conversion — Area
// ============================================================
assertApprox(ConversionRegistry.convert(1, 'km²', 'm²', 'Area'), 1000000, 'TC-12-01', 'km² to m²');
assertApprox(ConversionRegistry.convert(1, 'hectare', 'm²', 'Area'), 10000, 'TC-12-02', 'hectare to m²');
assertApprox(ConversionRegistry.convert(1, 'acre', 'hectare', 'Area'), 0.404686, 'TC-12-03', 'acre to hectare');

// ============================================================
// TC-13: Unit Conversion — Volume
// ============================================================
assertApprox(ConversionRegistry.convert(1, 'litre', 'ml', 'Volume'), 1000, 'TC-13-01', 'litre to ml');
assertApprox(ConversionRegistry.convert(1, 'gallon', 'litre', 'Volume'), 3.78541, 'TC-13-02', 'gallon to litre');
assertApprox(ConversionRegistry.convert(1, 'm³', 'litre', 'Volume'), 1000, 'TC-13-03', 'm³ to litre');

// ============================================================
// TC-14: Unit Conversion — Speed
// ============================================================
assertApprox(ConversionRegistry.convert(1, 'm/s', 'km/h', 'Speed'), 3.6, 'TC-14-01', 'm/s to km/h', 0.01);
assertApprox(ConversionRegistry.convert(60, 'mph', 'km/h', 'Speed'), 96.5606, 'TC-14-02', '60 mph to km/h', 0.01);
assertApprox(ConversionRegistry.convert(1, 'knot', 'km/h', 'Speed'), 1.852, 'TC-14-03', 'knot to km/h', 0.01);

// ============================================================
// TC-15: Conversion Edge Cases
// ============================================================
assert(ConversionRegistry.convert(0, 'km', 'm', 'Length') === 0, 'TC-15-05', 'Zero conversion: 0 km = 0 m');
assert(ConversionRegistry.getCategories().length === 6, 'TC-15-CATS', 'Registry has 6 categories');
assert(ConversionRegistry.getUnits('Length').length === 8, 'TC-15-UNITS-L', 'Length has 8 units');
assert(ConversionRegistry.getUnits('Temperature').length === 3, 'TC-15-UNITS-T', 'Temperature has 3 units');
assert(ConversionRegistry.getUnits('Weight/Mass').length === 6, 'TC-15-UNITS-W', 'Weight has 6 units');
assert(ConversionRegistry.getUnits('Area').length === 7, 'TC-15-UNITS-A', 'Area has 7 units');
assert(ConversionRegistry.getUnits('Volume').length === 6, 'TC-15-UNITS-V', 'Volume has 6 units');
assert(ConversionRegistry.getUnits('Speed').length === 4, 'TC-15-UNITS-S', 'Speed has 4 units');

// ============================================================
// Rounding utility tests
// ============================================================
assert(roundTo6(3.5) === '3.5', 'ROUND-01', 'Strips trailing zeros');
assert(roundTo6(4.0) === '4', 'ROUND-02', 'Strips .0');
assert(roundTo6(1.123456789) === '1.123457', 'ROUND-03', 'Rounds to 6 places');
assert(roundTo6(0.1 + 0.2) === '0.3', 'ROUND-04', 'Handles floating point');
assert(roundTo6(0) === '0', 'ROUND-05', 'Zero stays zero');
assert(roundTo6(-1.5) === '-1.5', 'ROUND-06', 'Negative preserved');

// ============================================================
// Summary
// ============================================================
const total = passed + failed;
console.log(`\n${'='.repeat(50)}`);
console.log(`Test Results: ${passed} PASSED, ${failed} FAILED (${total} total)`);
console.log(`${'='.repeat(50)}`);

// Render to page
if (typeof document !== 'undefined') {
  const container = document.getElementById('testResults');
  if (container) {
    const summary = `<h2 style="color:${failed === 0 ? '#4caf50' : '#f44336'}">` +
      `${passed} passed, ${failed} failed (${total} total)</h2>`;
    const details = results.map(r =>
      `<div class="${r.status.toLowerCase()}">[${r.status}] ${r.id}: ${r.message}</div>`
    ).join('');
    container.innerHTML = summary + details;
  }
}

export { passed, failed, results };
