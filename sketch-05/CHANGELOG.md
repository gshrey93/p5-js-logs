# Changelog — Sketch 05: Flappy Kiro

All notable changes to the **Sketch 05 (Flappy Kiro)** game are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-07-20

### Changed
- **Modular ES Architecture**: Refactored 180-line monolithic `sketch.js` IIFE into 5 single-responsibility ES modules under `sketch-05/js/`:
  - `js/config.js`: Physics & canvas dimension constants.
  - `js/audio.js`: SoundFX audio asset loader.
  - `js/bird.js`: Bird entity physics, bounds, and rendering.
  - `js/pipes.js`: Procedural pipe spawning, scrolling, recycling, and AABB collision.
  - `js/game-state.js`: Game state transitions, score tracking, LocalStorage persistence, and HUD.
- **Main Loop Entrypoint**: Converted `sketch.js` into an orchestrator entrypoint coordinating event listeners and `requestAnimationFrame` game loop.
- **HTML Script Module Entry**: Updated `index.html` script tag to `<script type="module" src="sketch.js"></script>`.

### Fixed
- **HTML/CSS Syntax Error**: Removed broken CSS syntax closing brace on line 10 in `index.html`.
- **Back Button Styling**: Added styled `.back-btn` floating navigation button matching repository design standards.

### Added
- **Audio Effects**: Integrated `assets/jump.wav` and `assets/game_over.wav` audio playback with non-blocking error handling.
- **Jest Test Suite**: Created `sketch.test.js` containing automated unit tests for bird physics, boundary detection, pipe collision, scoring, and state transitions.
- **Project Configuration**: Added `package.json` and `babel.config.js` for automated testing with Babel ES module support.
- **Documentation**: Published detailed `README.md`.

---

## [1.0.0] - 2026-07-16

### Added
- **Initial Game Engine**: Basic 2D Canvas Flappy Bird game loop with gravity, jump mechanics, procedural pipe obstacles, score tracking, and game over overlay.
