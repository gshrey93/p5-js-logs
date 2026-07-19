# NEON STRIKE - Cyber Retro Arcade Space Shooter

![Version](https://img.shields.io/badge/version-1.3.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**NEON STRIKE** is a high-octane retro-arcade space shooter built with **p5.js**, **Web Audio API** sound synthesis, and a modern **ES Module architecture**. Pilot your cyber-fighter through vector space, destroy invading alien fleets, harvest stacking powerups, and battle endless scaling bosses in stationary Arena Mode!

---

## 🚀 Key Features

* **Neo-Vector Arcade Visuals**: Glowing HSL neon aesthetics, CRT scanline overlay, particle explosions, and smooth screen shake physics.
* **Stacking Powerups**:
  * 🛡️ **Shield (`S`)**: Absorbs incoming damage.
  * 🔫 **Triple Shot (`T`)**: Fires 3-laser spread barrages.
  * ⚡ **Plasma Beam (`B`)**: Fires high-damage plasma beams.
  * 💥 **Triple Beam**: Stack Triple Shot + Plasma Beam simultaneously to fire 3 plasma beams at once!
  * ❤️ **Repair (`H`)**: Restores player shield health.
* **Endless Boss Arena Mode**:
  * **Auto-Scroll Freezing**: Grid and starfield motion decelerates to a stop when a Boss enters, locking you into a high-stakes stationary arena.
  * **Infinite Scaling**: Boss HP (`400 + level * 150`), speed, and attack patterns scale endlessly.
  * **Enraged Phase (HP ≤ 50%)**: Crimson red glow, $+40\%$ speed, and upgraded 5-way or 7-way spread barrages.
  * **Minion Escorts & Targeted Beams**: Later bosses spawn Swarmer escorts and fire lock-on beams.
* **Pure Web Audio API**: Procedurally synthesized retro sound effects (lasers, explosions, hits, and powerup chimes) without external audio file assets.
* **Modular ES Architecture**: Clean component-based directory structure (`Player`, `Enemy`, `Projectile`, `Powerup`, `Particle`, `FloatingText`).

---

## 🕹️ Controls

| Action | Controls |
| :--- | :--- |
| **Move Ship** | Mouse or Arrow Keys / WASD (`W`/`A`/`S`/`D`) |
| **Fire Weapons** | Mouse Click or Spacebar |

---

## 🛠️ Project Architecture

```
sketch-07/
├── index.html               # Retro arcade cabinet container & stats HUD
├── sketch.js                 # Main p5.js lifecycle loop (setup, draw, inputs)
├── sound.js                  # Web Audio API sound synthesizer
├── CHANGELOG.md             # Documented release history
├── README.md                # Project documentation
├── package.json             # NPM dependencies & test scripts
├── babel.config.json        # Babel transform config for Jest ES modules
├── src/
│   ├── constants.js         # Color palette tokens & constants
│   ├── state.js             # Decoupled global game state
│   └── components/          # Modularized ES class components
│       ├── Player.js
│       ├── Enemy.js
│       ├── Projectile.js
│       ├── Powerup.js
│       ├── Particle.js
│       └── FloatingText.js
└── tests/                   # Jest unit testing suite
    ├── setup.js
    ├── Player.test.js
    ├── Enemy.test.js
    ├── Projectile.test.js
    └── Powerup.test.js
```

---

## 💻 Quick Start & Local Execution

### 1. Running the Game
Since the application uses browser-native **ES Modules** (`type="module"`), run a local web server (to avoid local CORS file protocol restrictions):

```bash
# Using npx serve
npx serve .
```
Then open `http://localhost:3000` in your web browser.

### 2. Running Unit Tests
Execute the Jest component test suite:

```bash
# Install dependencies
npm install

# Run Jest tests
npm test
```

---

## 📜 License

This project is licensed under the MIT License.
