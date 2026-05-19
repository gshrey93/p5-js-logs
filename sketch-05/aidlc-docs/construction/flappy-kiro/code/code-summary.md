# Flappy Kiro - Code Summary (JavaScript)

## Project Structure

```
.
├── index.html          # Game page (canvas element + styles)
├── game.js             # Complete game logic (single file, no build tools)
└── assets/
    ├── ghosty.png      # Ghost sprite
    ├── jump.wav        # Jump sound
    └── game_over.wav   # Game over sound
```

## Technology
- HTML5 Canvas + vanilla JavaScript
- No build tools, no dependencies
- Open `index.html` in any modern browser to play

## Architecture (all in game.js)

| Class/Module | Purpose |
|-------------|---------|
| DifficultyManager | Progressive score-based scaling (gravity, speed, spawn rate) |
| WindSystem | Smooth lerp-based wind with cloud visual cue |
| SlowMotionEffect | Power-up effect (50% speed, 70% gravity, smooth transition) |
| Ghosty | Player character (physics, bounce, invincibility blink) |
| Wall | Static (green) and moving (red) pipe obstacles |
| PowerUp | Slow-motion clock pickup with animated glow |
| ParallaxBackground | Sky gradient, clouds, scrolling ground |

## Key Mechanics

| Feature | Value |
|---------|-------|
| Progressive gravity | 0.4 → 0.7 (scales with score) |
| Progressive jump | -8.5 → -10.5 (scales with score) |
| Wall speed | 3.0 → 5.5 (scales with score) |
| Ceiling bounce | 40% velocity retention |
| Smooth wind | Lerp-based, new target every 3-5 sec |
| Moving walls (red) | Oscillate at 1.5 px/frame, activate at 180px |
| Slow-motion pickup | 3 sec, 50% speed / 70% gravity |
| Invincibility | 1.5 sec blink at game start |
| Soft wall cap | Max 5 visible |
| High score | localStorage persistence |

## Running

Just open `index.html` in a browser. No server needed.
