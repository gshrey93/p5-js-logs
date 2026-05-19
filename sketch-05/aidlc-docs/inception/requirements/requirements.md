# Flappy Kiro - Requirements Document

## Intent Analysis

- **User Request**: Build a Flappy Bird clone called "Flappy Kiro" featuring a ghost character (Ghosty)
- **Request Type**: New Project
- **Scope Estimate**: Single Component (one game application)
- **Complexity Estimate**: Moderate (game loop, physics, collision detection, state management, audio, persistence)

## Functional Requirements

### FR-01: Game Character (Ghosty)
- Ghosty is rendered using the existing `assets/ghosty.png` sprite
- Ghosty is positioned at a fixed horizontal location on screen (classic Flappy Bird style)
- Ghosty continuously descends due to gravity
- Ghosty ascends when the player presses the spacebar
- Jump sound (`assets/jump.wav`) plays on each spacebar press

### FR-02: Wall Obstacles
- Walls appear from the right side of the screen and move left
- Each wall pair consists of a top wall and a bottom wall with a gap between them
- Gaps are equally sized but placed at random vertical positions
- Walls are styled with borders/gradients to resemble pipes or barriers
- Walls spawn at regular intervals

### FR-03: Scoring
- Player earns one point for each wall pair successfully passed
- Current score is displayed during gameplay
- High score is persisted between sessions using a local file

### FR-04: Collision & Game Over
- Game ends when Ghosty collides with a wall or the ground
- `assets/game_over.wav` plays on collision
- A dedicated game over screen is shown with:
  - Final score
  - High score
  - "Play Again" button to restart

### FR-05: Start Screen
- Title screen displayed on launch with game title "Flappy Kiro"
- "Press Space to Start" prompt shown
- Game begins when player presses spacebar

### FR-06: Viewport & Camera
- Fixed screen: Ghosty stays at a fixed horizontal position
- Walls move from right to left (classic Flappy Bird scrolling)
- Screen does not scroll with Ghosty

### FR-07: Background
- Parallax scrolling background with multiple layers (sky, clouds, ground)
- Background layers scroll at different speeds to create depth effect

## Non-Functional Requirements

### NFR-01: Technology
- Python with Pygame library
- No external build tools required beyond Python + pip

### NFR-02: Performance
- Smooth 60 FPS gameplay
- No perceptible input lag on spacebar press

### NFR-03: Usability
- Simple one-button control (spacebar)
- Clear visual feedback for game state transitions
- Readable score display

### NFR-04: Portability
- Runs on any system with Python 3.x and Pygame installed
- Uses relative paths for all assets

### NFR-05: Maintainability
- Clean separation of game states (start, playing, game over)
- Well-structured code with clear game loop

## Assets (Pre-existing)
| Asset | Path | Purpose |
|-------|------|---------|
| Ghost sprite | `assets/ghosty.png` | Player character |
| Jump sound | `assets/jump.wav` | Played on spacebar press |
| Game over sound | `assets/game_over.wav` | Played on collision |
