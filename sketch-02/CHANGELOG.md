# Changelog — Sketch 02: Pixel Dino Run

All notable changes to the **Sketch 02 (Pixel Dino Run)** endless runner game are documented in this file.

## [1.2.1] - 2026-07-20

### Changed
- **Directory Naming Standardization**: Renamed project directory from `sketch02` to `sketch-02` to adhere to repository-wide `sketch-XX` naming conventions.
- **Dependency & Reference Updates**: Updated directory path references across root `index.html` navigation cards and root `README.md` documentation links.
- **Package Metadata**: Updated `package.json` and `package-lock.json` package name from `sketch02-dino-run` to `sketch-02-dino-run` and bumped version to `1.2.1`.
- **Local Documentation**: Updated setup and run instructions in `sketch-02/README.md`.

---

## [1.2.0] - 2026-07-17

### Added
- **Dynamic Spawning System**: Obstacles now spawn in cyclical waves of high/low density (created using sin(frameCount)), introducing challenging bursts of rapid-fire obstacles followed by breathing room.
- **Dodge Streak Booster Spawning**: Maintaining a high streak rewards the player by increasing the spawning rate of power-up boosters.
- **Adaptive Visual Outlines**: Added a smooth, high-contrast outline rendering layer for Dino, Cacti, and Pterodactyls. Outlines dynamically switch from crisp solid black during the day to a glowing neon warning outline at night (cyan for Dino, orange/red for obstacles), resolving poor nighttime contrast.
- **Multi-Colored Sprite Elements**: Refined the pixel art renderer to draw eye highlights (white) and crash highlights (red cross) in their respective colors.
- **Variable Obstacle Heights**: Completely redesigned cacti sprites to have clearly distinct heights: small (20px / 5 rows), medium (32px / 8 rows), and large (48px / 12 rows).
- **Drifting & Blinking Night Stars**: Spawns 35 slowly drifting stars that blink using a sinusoidal wave, with opacity fading in/out during day/night cycles.
- **Trailing Running Dust**: Added a particle trail that emits dust behind the Dino's heels while running on the ground (particles darken at night).
- **Custom Pterodactyl Speed**: Pterodactyls now fly 35% faster than ground cacti speed to add a distinct threat.
- **Modular Refactoring**: Split monolithic code into 5 dedicated modules (`config.js`, `dino.js`, `obstacle.js`, `booster.js`, `environment.js`) orchestrated by a minimal `sketch.js`.
- **Dino Animations**: Created a detailed, expressive pixel art style supporting 7 animation frames: running (leg cycle 1/2), jumping (legs tucked), crouching (low-profile sliding 1/2), happy (arms raised in victory), and hit (dizzy eyes).
- **Streak Tracker & Raised-Arms Celebration**: Tracks consecutive successful obstacle dodges. Reaching milestones (multiples of 5) triggers a human-like victory celebration pose (raised arms) with orbiting golden stars (⭐ ✨) and sparkling tail emitters.
- **Gameplay Boosters**: Spawns glowing, bobbing collectible power-up pickups with dynamic countdown timer bars on the HUD:
  - 🛡️ **Shield**: Absorbs one obstacle collision and shatters into colored particles instead of causing a game over.
  - 🧲 **Magnet**: Pulls in score points automatically.
  - ⚡ **Speed Burst**: Grants invincibility and temporary 2× speed with double score generation.
  - 🐢 **Slow-Mo**: Slows down the game by 70% for **5 full seconds (300 frames)** to assist in tight reaction moments.
- **High-Impact Collision Feedback**: Added camera screen shake, screen-wide red flash, slow-motion impact freeze, and physics-simulated particle debris explosions on crash.
- **Persistent High Scores**: Saves and displays high scores persistently across browser refreshes via `localStorage` with Gold flash triggers.
- **Score Milestones**: Flashes the screen white and pops up text celebrations at 100, 500, 1000, and 2000 points.
- **TDD Jest Test Suite**: Developed `sketch.test.js` containing 56 passing unit tests validating all physical states, crouching hitbox offsets, power-ups, and score behaviors.

### Fixed
- **Crash Bug**: Fixed a critical crash where the game attempted to check collision on an obstacle index immediately after it was spliced from the array.
- **Hitbox Scaling**: Replaced hardcoded magic numbers with dynamic, percentage-based hitbox bounds.
