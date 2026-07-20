# Sketch-02: Pixel Dino Run

A Chrome-style endless runner built with p5.js, featuring a high-detail pixel-art dinosaur, day/night cycles, dynamic difficulty, power-up boosters, and responsive gameplay animations.

---

## Game Objective

Survive as long as possible by jumping over cacti and ducking under flying pterodactyls. The game speed increases over time, requiring faster reflexes and strategic use of collected power-ups. Keep an eye on your streak to trigger celebrations!

---

## How to Play

- **Jump / Start Game:** Press `SPACE` or `UP_ARROW` (or Click/Tap).
- **Crouch / Duck:** Press and hold `DOWN_ARROW`. Use this to slide under low-flying pterodactyls.
- **Restart Game:** Press any key or click the screen when the match is complete.

---

## Features

- **Expressive Dino Poses & Animations:** The Dino features 7 distinct visual states: running (alternating leg cycles), jumping, crouching, happy/celebration, and hit (dizzy face on collision).
- **Happiness Cues & Celebration:** Successful dodges increment a streak counter. Clearing 5 consecutive obstacles in a streak triggers a special celebration state where the Dino raises its tiny hands in human-like victory, accompanied by orbiting golden stars (⭐ ✨).
- **New Flying Obstacles:** In addition to small, medium, and large ground cacti, low-flying pterodactyls with animated wings spawn once the score exceeds 200, demanding quick crouching maneuvers to pass safely.
- **Dynamic Day/Night Cycle:** The sky and environment transition smoothly through noon, dusk, midnight, and dawn phases, adjusting the colors of the background, mountains, ground, and sprites.
- **Collectible Gameplay Boosters:** Glow-ringed power-ups float across the screen, each displaying a countdown timer bar at the top of the HUD when active:
  - **🛡️ Shield:** Absorbs one obstacle collision. Shatters on impact to protect your run.
  - **🧲 Magnet:** Pulls in collectible points automatically.
  - **⚡ Speed Burst:** Grants invincibility and temporary 2× speed with double score generation.
  - **🐢 Slow-Mo:** Slows the gameplay speed by 70% for 5 seconds, giving you extra time to react.
- **High-Impact Collision Feedback:** Crashing triggers camera screen shake, a screen-wide red flash overlay, physical particle explosions, and a slow-motion impact freeze.
- **Score Milestones & High Scores:** Tracks and saves your high score persistently via `localStorage`. Celebrates major score achievements (100, 500, 1000, 2000 points) with screen flashes and floating banner labels.

---

## Technical Architecture

The code is highly modular, split into 5 ES modules:
- `config.js`: Centralized game configurations and `GAME_STATE` enums.
- `dino.js`: Dino player physics, animations, and streak trackers.
- `obstacle.js`: Ground cacti and flying pterodactyl animation and hitboxes.
- `booster.js`: Power-ups, timers, and shield absorption logic.
- `environment.js`: Parallax mountains/clouds and day/night transitions.
- `sketch.js`: Minimal main orchestration loop.

---

## Running Tests

This project includes a Jest-based test suite verifying all physics, hitboxes, state triggers, and booster durations.

1. Navigate to the sketch directory:
   ```bash
   cd sketch-02
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the tests:
   ```bash
   npm test
   ```
