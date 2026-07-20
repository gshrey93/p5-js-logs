# Changelog — Sketch 06: Calculator and Unit Converter PWA

All notable changes to the **Sketch 06 (Calculator and Unit Converter PWA)** application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-07-20

### Changed
- **Modular Code Architecture**: Refactored monolithic `sketch.js` (548 lines) into 8 single-responsibility ES modules under `sketch-06/js/`:
  - `js/event-bus.js`: Pub/Sub event bus.
  - `js/storage-service.js`: LocalStorage wrapper.
  - `js/utils.js`: `roundTo6()` decimal formatting utility.
  - `js/theme-manager.js`: Dark/Light theme controller.
  - `js/calculator-engine.js`: Arithmetic engine and state machine.
  - `js/conversion-registry.js`: Unit conversion lookup & temperature calculations.
  - `js/unit-converter.js`: Converter UI controller.
  - `js/history-manager.js`: Calculation/conversion log & LocalStorage persistence.
- **App Shell Orchestration**: Converted `sketch.js` into a lean 75-line orchestrator entrypoint coordinating component initialization and DOM event handlers.
- **HTML Script Module Entry**: Updated `index.html` script tag to `<script type="module" src="sketch.js"></script>`.
- **Jest Test Suite Imports**: Updated `sketch.test.js` to import logic directly from `./js/` modules.

---

## [1.0.1] - 2026-07-20

### Fixed
- **Multiplicative Percentage Calculation**: Fixed `inputPercent()` so multiplication and division (`A × B%`) evaluate `B%` as `B / 100` (e.g., `200 × 15% = 30`), replacing incorrect additive scaling (`A × (A * B/100)` = `6000`).
- **Stale Result State Persistence**: Fixed an issue where `this.result` was retained when starting a new calculation post-equals (`=`), preventing operator switching mid-entry from corrupting operands with past results.
- **Repeated Equals (`=`) Operation**: Implemented `lastOperator` and `lastOperand2` tracking to enable standard repeated equals functionality (e.g., `5 + 3 = 8`, pressing `=` yields `11`, then `14`).
- **Conversion Factor Precision**: Replaced hardcoded floating-point decimals with exact ratios (e.g., `5/18` for `km/h`), resolving rounding drift such as `1 m/s` converting to `3.600001 km/h` instead of exact `3.6`.
- **Absolute Zero Temperature Validation**: Added validation in `convertTemperature()` to reject inputs resulting in temperatures below Absolute Zero ($0 \text{ K}$).
- **Keyboard Shortcuts**: Added keyboard mapping for `x` / `X` (multiplication) and `Delete` (All Clear / AC).

### Added
- **Jest Test Suite**: Created `sketch.test.js` containing automated unit tests for arithmetic, percentages, repeated operations, unit conversions, and rounding utilities.
- **Project Configuration**: Added `package.json` and `babel.config.js` for testing with Babel ES module support.

---

## [1.0.0] - 2026-07-16

### Added
- **Dual Mode PWA Calculator**: Built standard arithmetic calculator and multi-category unit converter (Length, Weight, Area, Volume, Speed, Temperature).
- **History Tracking & Storage**: LocalStorage persistence with tap-to-reuse entry functionality.
- **Theme Manager**: Light/Dark theme toggle with user preference persistence.
