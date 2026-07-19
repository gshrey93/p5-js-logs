# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-07-20
### Added
- **Endless Boss Arena**: Implemented auto-scroll deceleration (`scrollSpeed`) that freezes starfield and grid motion to lock the jet into a stationary arena during boss encounters.
- **Infinite Scaling Bosses**: Added endless algorithmic boss spawning (every 5–8 levels) with infinitely scaling HP (`400 + level * 150`), speed scaling, and multi-tier barrage attacks (3-way, 5-way, and 7-way spread shots).
- **Boss Phases & Minions**: Added Phase 2 Enraged state (crimson aura, +40% speed, faster cooldown at HP ≤ 50%), escort Swarmer minion spawns (Level 30+), and targeted lock-on laser stream bursts (Level 50+).
- **UI & Warning Banner**: Added flashing retro canvas warning banner `⚠️ WARNING: BOSS ARENA LOCK (LEVEL [X]) ⚠️`.

## [1.2.0] - 2026-07-20
### Changed
- **Difficulty**: Reduced the spawn probability of the **Repair** (`H`) powerup to 10% (down from 25%) via weighted selection to increase game difficulty and survival challenge.

## [1.1.0] - 2026-07-20
### Changed
- **Architecture**: Modularized the monolithic `sketch.js` file by moving game entities (`Player`, `Enemy`, `Projectile`, `Powerup`, `Particle`, `FloatingText`) into their own ES modules inside the `src/components/` directory.
- **State Management**: Extracted global variables into `src/state.js` and constants into `src/constants.js` to decouple logic from the global `window` object.
- **Testing**: Split `sketch.test.js` into individual component-level test files (`tests/Player.test.js`, `tests/Enemy.test.js`, etc.) and added `babel.config.json` to support ES module tests in Jest.
- **Powerups**: Allowed "Triple Shot" and "Plasma Beam" powerups to be stacked simultaneously. When both are active, the ship fires a triple spread of plasma beams.
- **HUD**: Added "TRIPLE BEAM" status label to indicate when both Triple Shot and Plasma Beam powerups are active. Powerup timers are now tracked independently.
