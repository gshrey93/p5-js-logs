# Flappy Kiro - Business Logic Model

## Game State Machine

```
+----------+     Space      +---------+    Collision    +-----------+
|  START   | ------------> | PLAYING | -------------> | GAME_OVER |
+----------+               +---------+                +-----------+
     ^                          |                          |
     |                          | (ceiling bounce)         |
     |                          v                          |
     |                     +---------+                     |
     |                     | PLAYING |                     |
     |                     +---------+                     |
     |                                                     |
     +-----------------------------------------------------+
                    Space / Click "Play Again"
```

## Core Game Loop (per frame at 60 FPS)

1. Process input events (Space = jump)
2. Update wind system (smooth directional shift)
3. Apply physics to Ghosty (gravity + wind + velocity)
4. Update walls (move left, activate moving walls, oscillate)
5. Check spawn timer (spawn new wall if interval reached, respect soft cap)
6. Check power-up spawn/collection
7. Detect collisions (walls, ground, ceiling bounce)
8. Update score (wall passed check)
9. Update difficulty parameters (progressive gravity, wall speed)
10. Update background (parallax layers, cloud speed for wind cue)
11. Render all layers

## Physics Model

### Gravity (Progressive)
- **Base gravity**: 0.4 px/frame^2 (floaty start)
- **Max gravity**: 0.7 px/frame^2 (snappy at high scores)
- **Scaling formula**: `gravity = BASE_GRAVITY + (score * GRAVITY_INCREMENT)`
- **GRAVITY_INCREMENT**: 0.015 per point, capped at MAX_GRAVITY
- **Jump velocity base**: -8.5 px/frame (floaty start)
- **Jump velocity max**: -10.5 px/frame (snappy at high scores)
- **Jump scaling**: `jump_vel = BASE_JUMP - (score * JUMP_INCREMENT)` (more negative = stronger)
- **JUMP_INCREMENT**: 0.1 per point, capped at MAX_JUMP
- **Max fall speed**: 12 px/frame (constant)

### Ceiling Bounce
- When Ghosty.rect.top <= 0: reverse velocity with damping
- `velocity = -velocity * 0.4` (40% energy retained)
- Clamp position to y=0

### Wind System (Gradual/Smooth)
- Wind direction shifts smoothly using linear interpolation
- **Target force**: Random value in [-MAX_WIND, +MAX_WIND]
- **Transition speed**: 0.02 per frame (takes ~50 frames to fully shift)
- **Current force** lerps toward target: `current += (target - current) * 0.02`
- **New target** chosen every 180-300 frames (3-5 seconds)
- **MAX_WIND**: 0.25 px/frame^2 (base), scales slightly with score
- **Cloud speed cue**: When wind target changes, clouds accelerate in wind direction 1-2 seconds before force reaches Ghosty

## Difficulty Scaling (Gradual)

| Parameter | Base Value | Increment/Point | Cap |
|-----------|-----------|-----------------|-----|
| Wall speed | 3 px/frame | +0.05 | 5.5 px/frame |
| Gravity | 0.4 px/frame^2 | +0.015 | 0.7 px/frame^2 |
| Jump velocity | -8.5 px/frame | -0.1 | -10.5 px/frame |
| Spawn interval | 90 frames | -0.5 | 55 frames |
| Moving wall chance | 25% | +1% | 50% |
| Wall gap | 160 px | 0 (fixed) | 160 px |

## Wall Spawn Logic

### Soft Cap
- **Max visible walls**: 5
- **Behavior when at cap**: Skip spawn, reset timer to half interval
- **Rationale**: Prevents screen clutter at high speeds where walls haven't scrolled off yet

### Gap Positioning
- Random Y within bounds: `[GAP/2 + 40, SCREEN_H - GROUND_H - GAP/2 - 40]`
- Ensures minimum 40px of wall visible at top and bottom

## Moving Wall Behavior

- **Activation**: When wall X is within 180px of Ghosty's X position
- **Movement**: Oscillates up/down at constant 1.5 px/frame
- **Bounds**: Same as gap positioning bounds (bounces at edges)
- **Speed**: Constant regardless of difficulty (per Q9=B)
- **Visual**: Red color scheme to distinguish from static green walls

## Power-Up: Slow Motion

### Spawn Rules
- **Spawn chance**: 10% per wall spawn event (checked independently)
- **Position**: Random Y within playable area, spawns at right edge
- **Movement**: Moves left at wall speed
- **Visual**: Glowing clock/hourglass icon (drawn programmatically)
- **Collection**: Ghosty hitbox overlaps power-up hitbox

### Effect
- **Duration**: 3 seconds (180 frames)
- **Wall speed reduction**: 50% of current wall speed
- **Gravity reduction**: 70% of current gravity (slightly floatier)
- **Visual feedback**: Screen tint (slight blue overlay), walls move visibly slower
- **Stacking**: Does not stack — collecting while active resets timer
- **End**: Smooth transition back to normal speed over 30 frames

## Invincibility at Start

- **Duration**: 90 frames (1.5 seconds)
- **Visual**: Ghosty blinks/flashes (alternates visible/invisible every 6 frames)
- **Behavior**: Collisions with walls are ignored during this period
- **Ground collision**: Still kills (prevents falling through floor)
- **First wall**: Spawns at normal interval (invincibility covers the gap)
