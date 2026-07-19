# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Changed
- **Architecture**: Modularized the monolithic `sketch.js` file by moving game entities (`Player`, `Enemy`, `Projectile`, `Powerup`, `Particle`, `FloatingText`) into their own ES modules inside the `src/components/` directory.
- **State Management**: Extracted global variables into `src/state.js` and constants into `src/constants.js` to decouple logic from the global `window` object.
- **Testing**: Split `sketch.test.js` into individual component-level test files (`tests/Player.test.js`, `tests/Enemy.test.js`, etc.) and added `babel.config.json` to support ES module tests in Jest.
- **Powerups**: Allowed "Triple Shot" and "Plasma Beam" powerups to be stacked simultaneously. When both are active, the ship fires a triple spread of plasma beams.
- **HUD**: Added "TRIPLE BEAM" status label to indicate when both Triple Shot and Plasma Beam powerups are active. Powerup timers are now tracked independently.
