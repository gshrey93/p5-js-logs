# Changelog — Sketch 04: Fibonacci Palindrome Finder

All notable changes to the **Sketch 04 (Fibonacci Palindrome Finder)** sketch are documented in this file.

---

## [1.0.1] - 2026-07-20

### Fixed
- **Module Path Resolution**: Relocated `calculator-logic.js` into the `js/` subfolder (`sketch-04/js/calculator-logic.js`), resolving broken module import paths in `sketch.js` and `sketch.test.js` as well as aligning with `README.md` documentation.
- **Babel & Jest ES Module Setup**: Added `babel.config.js` and updated `package.json` with `@babel/preset-env` and `babel-jest` configuration, enabling Jest to transform ES modules.

---

## [1.0.0] - 2026-07-16

### Added
- **Arbitrary-Precision Fibonacci Calculation**: Implemented `getFibonacci(n)` using JavaScript `BigInt` to compute Nth Fibonacci terms without loss of precision.
- **Constructive Palindrome Search Algorithm**: Implemented `getNearestPalindromeConstructive(num)` algorithm for instant nearest palindrome calculation even on numbers with hundreds of digits.
- **Interactive Web UI**: Built clean, centered control panel with numeric input, input validation, formatted comma output (`toLocaleString()`), and p5.js animated background grid.
- **Copy Results**: Integrated clipboard export button for copying calculation output.
- **Jest Test Suite & Docs**: Created 17 Jest unit tests (`sketch.test.js`) and `test-cases.md` detailing manual and automated test matrices.
