# Flappy Kiro - Code Generation Plan

## Unit Context
- **Unit**: flappy-kiro (single unit - complete game)
- **Technology**: Python 3.x + Pygame
- **Project Type**: Greenfield single unit
- **Code Location**: Workspace root with `src/` structure
- **Existing Assets**: `assets/ghosty.png`, `assets/jump.wav`, `assets/game_over.wav`
- **Functional Design**: `aidlc-docs/construction/flappy-kiro/functional-design/`

## Code Structure
```
.
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point, game loop, state management, rendering
│   ├── constants.py         # All game constants, colors, physics, difficulty caps
│   ├── ghosty.py            # Player character (gravity, jump, bounce, invincibility)
│   ├── wall.py              # Wall obstacle (static green, moving red, oscillation)
│   ├── wind.py              # Smooth wind system (lerp, target, cloud cue)
│   ├── background.py        # Parallax background (sky, clouds, ground)
│   ├── score.py             # Score tracking and file persistence
│   ├── difficulty.py        # DifficultyManager (progressive scaling)
│   ├── powerup.py           # SlowMotion power-up entity
│   └── effects.py           # SlowMotionEffect (timer, multipliers, transition)
├── tests/
│   ├── __init__.py
│   ├── test_ghosty.py
│   ├── test_wall.py
│   ├── test_wind.py
│   ├── test_score.py
│   ├── test_difficulty.py
│   └── test_powerup.py
├── assets/
├── requirements.txt
└── run.py
```

## Generation Steps

### Step 1: Project Structure Setup
- [x] Create `requirements.txt` (pygame, pytest)
- [x] Create `run.py` launcher
- [x] Create `src/__init__.py`
- [x] Create `tests/__init__.py`

### Step 2: Constants Module
- [x] Create `src/constants.py` — screen, colors, physics base/cap values, difficulty increments, wind params, power-up params, invincibility params

### Step 3: Ghosty Module
- [x] Create `src/ghosty.py` — Ghosty class per domain-entities.md (progressive gravity/jump, wind response, ceiling bounce, invincibility blink)

### Step 4: Wall Module
- [x] Create `src/wall.py` — Wall class (static green, moving red, activation distance, oscillation, styled pipe rendering)

### Step 5: Wind Module
- [x] Create `src/wind.py` — WindSystem class (smooth lerp, random target intervals, cloud speed multiplier for cue)

### Step 6: Difficulty Module
- [x] Create `src/difficulty.py` — DifficultyManager class (score-based scaling for gravity, jump_vel, wall_speed, spawn_interval, moving_chance)

### Step 7: Power-Up & Effects Modules
- [x] Create `src/powerup.py` — PowerUp class (spawn, move, draw clock icon, collection)
- [x] Create `src/effects.py` — SlowMotionEffect class (activate, timer, multipliers, smooth transition)

### Step 8: Background Module
- [x] Create `src/background.py` — ParallaxBackground class (sky gradient, clouds with wind cue, scrolling ground)

### Step 9: Score Module
- [x] Create `src/score.py` — ScoreManager class (increment, high score check, file save/load)

### Step 10: Main Game Loop
- [x] Create `src/main.py` — Game loop integrating all modules: state machine, event handling, spawn logic with soft cap, invincibility, power-up spawning/collection, HUD rendering, game over screen

### Step 11: Unit Tests
- [x] Create `tests/test_ghosty.py`
- [x] Create `tests/test_wall.py`
- [x] Create `tests/test_wind.py`
- [x] Create `tests/test_score.py`
- [x] Create `tests/test_difficulty.py`
- [x] Create `tests/test_powerup.py`

### Step 12: Documentation
- [x] Update `aidlc-docs/construction/flappy-kiro/code/code-summary.md`

## Story Traceability
- FR-01 (Ghosty): Steps 3, 10
- FR-02 (Walls): Steps 4, 10
- FR-03 (Scoring): Steps 9, 10
- FR-04 (Collision & Game Over): Steps 3, 4, 10
- FR-05 (Start Screen): Step 10
- FR-06 (Viewport): Step 10
- FR-07 (Background): Step 8, 10
- Wind Mechanic: Steps 5, 3, 10
- Moving Walls: Steps 4, 10
- Progressive Difficulty: Steps 6, 10
- Slow-Motion Power-Up: Steps 7, 10
- Invincibility: Steps 3, 10
- Ceiling Bounce: Steps 3, 10
