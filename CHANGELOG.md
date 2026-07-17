# Changelog

All notable changes to the **p5-js-logs** creative coding portfolio will be documented in this file.

---

## [Unreleased] - 2026-07-17

### Added
- **Sketch 02 (Pixel Dino Run)**:
  - Overhauled a single-file game into 5 clean ES modules (`config.js`, `dino.js`, `obstacle.js`, `booster.js`, `environment.js`) orchestrated by `sketch.js`.
  - Rebuilt the Dino sprite with a detailed pixel art style supporting 7 animation frames (running, jumping, crouching, hit, happy).
  - Added a streak tracker that triggers a happy victory pose (raised-arms celebration) and orbiting golden stars at streak milestones.
  - Introduced the flying **Pterodactyl** obstacle that flaps its wings and requires the player to crouch (`DOWN_ARROW`) to avoid.
  - Added collectible power-up boosters:
    - 🛡️ **Shield**: Absorbs one obstacle collision.
    - 🧲 **Magnet**: Pulls in nearby collectibles.
    - ⚡ **Speed Burst**: Grants invincibility and 2× speed/score multiplier.
    - 🐢 **Slow-Mo**: Slows down the game by 70% for 5 seconds to assist in reactions.
  - Integrated dynamic active booster timer bars at the top of the HUD.
  - Implemented high-impact collision feedback: screen shake, a translucent red flash overlay, particle debris explosions, and slow-motion death freeze.
  - Integrated persistent high scores (`HI: XXXXX`) backed by `localStorage` with color flash triggers.
  - Added screen-wide milestone celebrations (100, 500, 1000, 2000 points) with text popups.
  - Developed a comprehensive TDD Jest test suite (`sketch.test.js`) containing 56 passing unit tests.
- **Sketch 03 (Artillery Duel)**:
  - Created a Jest test suite (`sketch.test.js`) with 24 passing unit tests covering tank state, damage ranges, combo systems, and angle/power boundaries.

### Changed
- **Sketch 03 (Artillery Duel)**:
  - Redesigned and modularized the monolithic file structure into 7 modular files.
  - Added a dynamic **Horizontal Tank Movement** feature using the `A` and `D` keys during player turns to resolve high-gravity dead zones.
  - Shifted player HUD layout coordinates vertically to resolve overlap conflicts with the HTML "Back to Gallery" button on small screens.
  - Scaled the canvas resolution up to **1024x768** with fully responsive element scaling.
  - Upgraded the aim preview line to dynamically factor in wind drift.
  - Polished rendering aesthetics: added layered skies, clouds, impact rings, and barrel power charging animations.
  - Added audio safety checks to prevent runtime errors when sounds play before loading.

### Fixed
- **Sketch 02 (Pixel Dino Run)**:
  - Fixed a critical runtime crash where obstacles were checked for collisions after being spliced from the array.
  - Corrected hitbox math from magic numbers to percentage-based bounds.
- **Sketch 03 (Artillery Duel)**:
  - Fixed a critical game-crashing bug due to a missing `Math.sign()` wrapper in the wind HUD.
