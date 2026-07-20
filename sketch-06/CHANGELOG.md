# Changelog — Sketch 06: Calculator and Unit Converter PWA

All notable changes to the **Sketch 06 (Calculator and Unit Converter PWA)** application are documented in this file.

## [1.1.0] - 2026-07-20

### Changed
- **Modular Code Architecture**: Refactored the monolithic 548-line `sketch.js` file into 8 dedicated single-responsibility ES modules under `sketch-06/js/`:
  - `js/event-bus.js`: Pub/Sub event bus.
  - `js/storage-service.js`: LocalStorage wrapper.
  - `js/utils.js`: `roundTo6()` decimal formatting utility.
  - `js/theme-manager.js`: Dark/Light theme controller.
  - `js/calculator-engine.js`: Arithmetic engine and state machine.
  - `js/conversion-registry.js`: Unit conversion lookup & temperature calculations.
  - `js/unit-converter.js`: Converter UI controller.
  - `js/history-manager.js`: Calculation/conversion log & LocalStorage persistence.
- **App Shell Orchestration**: Converted `sketch.js` into a lean orchestrator entrypoint coordinating component initialization and DOM event handlers.
- **HTML Script Module Entry**: Updated `index.html` to load `<script type="module" src="sketch.js">`.

---

## [1.0.1] - 2026-07-20

### Fixed
- **Multiplicative Percentage Calculation**: Updated `inputPercent()` logic so that multiplication and division (`A × B%`) evaluate `B%` as `B / 100` (e.g., `200 × 15% = 30`), rather than applying additive percentage scaling (`A × (A * B/100)` = `6000`).
- **Stale Result State Persistence**: Fixed an issue where `this.result` was retained when starting a new calculation post-equals (`=`). Typing a new digit now clears `this.result`, preventing operator switching mid-entry from corrupting operands with past results.
- **Repeated Equals (`=`) Operation**: Implemented `lastOperator` and `lastOperand2` tracking to enable standard repeated equals functionality (e.g., `5 + 3 = 8`, pressing `=` yields `11`, then `14`).
- **Conversion Factor Precision**: Replaced hardcoded floating point decimals with exact ratios (e.g., `5/18` for `km/h`), resolving rounding drift such as `1 m/s` converting to `3.600001 km/h` instead of exact `3.6`.
- **Absolute Zero Temperature Validation**: Added validation in `convertTemperature()` to reject inputs resulting in temperatures below Absolute Zero ($0 \text{ K}$).
- **Keyboard Shortcuts**: Added support for `x` / `X` (multiplication) and `Delete` (All Clear / AC).

### Added
- **Jest Test Suite**: Created `sketch.test.js` containing unit tests for arithmetic, percentages, repeated operations, unit conversions, and rounding utilities.
- **Project Configuration**: Added `package.json` and `babel.config.js` for automated testing with Babel ES module support.

---

## [1.0.0] - 2026-07-16

### Added
- **Dual Mode PWA Calculator**: Built standard arithmetic calculator and multi-category unit converter (Length, Weight, Area, Volume, Speed, Temperature).
- **History Tracking & Storage**: LocalStorage persistence with tap-to-reuse entry functionality.
- **Theme Manager**: Light/Dark theme toggle with user preference persistence.
