# Changelog — Sketch 03: Artillery Duel

All notable changes to the **Sketch 03 (Artillery Duel)** tank battle game are documented in this file.

---

## [Unreleased] - 2026-07-15

### Added
- **Horizontal Tank Movement**: Players can now move their tanks left and right using the **`A`** and **`D`** keys during their turn, allowing them to reposition to overcome high-gravity or short-range situations.
- **Dynamic Terrain Alignment**: Moved tanks automatically adjust their vertical alignment to stay placed on top of the dynamic procedural terrain.
- **Control Hints HUD**: The HUD dynamically displays `Move A/D` details alongside aim and power options based on whose turn is active.
- **Enhanced Canvas Resolution**: Upgraded the game resolution from `800x600` to **`1024x768`**, with all visual elements automatically scaling to the larger layout.
- **Aesthetic Refinements**: Added dynamic gradient sky backgrounds, drifting clouds, projectile explosion impact pulses, and pulsing glow animations when the "Big Shot" is active.
- **Sound Playback Safeguards**: Added verification checks in `projectile.js` to ensure the audio assets (`fire.wav` and `explosion.wav`) are fully loaded before calling `.play()`, preventing type error crashes.
- **Unit Test Suite**: Created a comprehensive Jest test suite (`sketch.test.js`) containing 24 unit tests covering tank health, damage values, combo updates, power/angle limits, and movement boundaries.

### Changed
- **Modular Refactoring**: Restructured a 712-line monolithic codebase into 7 modules:
  - `ui.js`: Orchestrator, p5 lifecycle hooks, and HUD rendering.
  - `state.js`: Centralized mutable game state.
  - `terrain.js`: Procedural generation and ground drops.
  - `projectile.js`: Physics update, damage calculation, and turns.
  - `particles.js`: Launch sparks and impact rings.
  - `environment.js`: Sky backdrops and clouds.
  - `tank.js`: Core Tank class properties.
- **HUD Overlap Fix**: Moved Player 1 and Player 2 HUD text coordinates vertically from `y: 20/40` to `y: 65/85` to prevent stats from being obscured by the floating "← Back to Gallery" button.
- **Aim Line wind factor**: The trajectory line preview now incorporates the wind drift formula (`0.5 * wind * t²`) for visual accuracy.
- **Terrain Caching**: The terrain is rendered to an offscreen buffer and only updated when "dirty" (e.g., when hit by an explosion), improving frame rate.

### Fixed
- **Missing `Math.sign()` Crash**: Resolved a critical runtime crash where the wind indicator indicator crashed due to a missing `Math.sign()` call.
- **State Enum Consistency**: Replaced all raw state string checks with static `GAME_STATE` references.
