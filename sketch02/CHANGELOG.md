# Changelog — Sketch 02: Pixel Dino Run

All notable changes to the **Sketch 02 (Pixel Dino Run)** endless runner game are documented in this file.

---

## [Unreleased] - 2026-07-17

### Added
- **Modular Refactoring**: Split monolithic code into 5 dedicated modules (`config.js`, `dino.js`, `obstacle.js`, `booster.js`, `environment.js`) orchestrated by a minimal `sketch.js`.
- **Dino Animations**: Created a detailed pixel art style supporting 7 animation frames: running (alternating leg cycles), jumping, crouching (low-profile sliding), happy (victory pose), and hit (dizzy face).
- **Streak Tracker & Raised-Arms Celebration**: Tracks consecutive successful obstacle dodges. Reaching milestones (multiples of 5) triggers a human-like victory celebration pose (raised arms) with orbiting golden stars (⭐ ✨).
- **Pterodactyl Obstacle**: Added flying pterodactyl enemies with 2-frame flapping wings that spawn above score 200, requiring players to crouch (`DOWN_ARROW`) to avoid.
- **Gameplay Boosters**: Spawns glowing, bobbing collectible power-up pickups:
  - 🛡️ **Shield**: Absorbs one obstacle collision. Shatters into debris to protect the run.
  - 🧲 **Magnet**: Auto-collects points.
  - ⚡ **Speed Burst**: Grants invincibility, 2× speed, and double score generation.
  - 🐢 **Slow-Mo**: Slows down the game by 70% for 5 seconds to assist in reactions.
- **HUD Timer Bars**: Displays active booster durations dynamically at the top of the HUD.
- **High-Impact Collision Feedback**: Added camera screen shake, screen-wide red flash, slow-motion impact freeze, and physics-simulated particle debris explosions on crash.
- **Persistent High Scores**: Saves and displays high scores persistently across browser refreshes via `localStorage` with Gold flash triggers.
- **Score Milestones**: Flashes the screen white and pops up text celebrations at 100, 500, 1000, and 2000 points.
- **TDD Jest Test Suite**: Developed `sketch.test.js` containing 56 passing unit tests validating all physical states, crouching hitbox offsets, power-ups, and score behaviors.

### Fixed
- **Crash Bug**: Fixed a critical crash where the game attempted to check collision on an obstacle index immediately after it was spliced from the array.
- **Hitbox Scaling**: Replaced hardcoded magic numbers with dynamic, percentage-based hitbox bounds.
