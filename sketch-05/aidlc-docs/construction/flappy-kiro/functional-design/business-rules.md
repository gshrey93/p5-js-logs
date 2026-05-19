# Flappy Kiro - Business Rules

## BR-01: Scoring Rules
- Player earns exactly 1 point when Ghosty's X position passes the right edge of a wall pair
- Score only increments once per wall pair (tracked via `passed` flag)
- Score resets to 0 on game restart
- High score persists to file, updated only when current score exceeds stored high score

## BR-02: Collision Rules
- **Wall collision**: Game ends immediately (unless invincible)
- **Ground collision**: Game ends immediately (even during invincibility)
- **Ceiling collision**: Ghosty bounces with 40% velocity retention, no death
- **Hitbox**: Exact sprite rectangle (40x40 pixels)
- **Detection**: Axis-aligned bounding box (AABB) intersection

## BR-03: Input Rules
- **Spacebar**: Only valid input during PLAYING state (triggers jump)
- **Spacebar during START**: Transitions to PLAYING state
- **Spacebar during GAME_OVER**: Restarts game
- **Mouse click on "Play Again" button**: Restarts game (GAME_OVER only)
- **No multi-tap buffering**: Each press = exactly one jump

## BR-04: Wall Spawn Rules
- Walls spawn at right screen edge (x = SCREEN_WIDTH)
- Spawn interval decreases with score (90 frames base, -0.5/point, min 55)
- Gap Y is random within valid bounds each spawn
- Moving wall probability: 25% base, +1%/point, max 50%
- **Soft cap**: Max 5 walls visible; if at cap, skip spawn and reset timer to half

## BR-05: Difficulty Progression Rules
- All difficulty parameters scale linearly with score
- Parameters have hard caps to prevent unplayable states
- Gap size remains constant (160px) — difficulty comes from speed and gravity
- Difficulty resets fully on game restart

## BR-06: Wind Rules
- Wind applies a vertical force to Ghosty each frame
- Wind direction shifts smoothly (lerp at 0.02/frame toward target)
- New wind target chosen every 180-300 frames (random interval)
- Wind force bounded by MAX_WIND (0.25 px/frame^2)
- **Cue**: Clouds accelerate in wind direction 1-2 seconds before force reaches full strength
- Wind does NOT affect walls or power-ups (only Ghosty)

## BR-07: Moving Wall Rules
- Moving walls are visually red (static walls are green)
- Activation trigger: Wall X within 180px of Ghosty X
- Movement: Oscillates vertically at 1.5 px/frame (constant speed)
- Bounces at gap positioning bounds (never moves gap off-screen)
- Movement speed does not scale with difficulty

## BR-08: Power-Up Rules (Slow Motion)
- 10% spawn chance per wall spawn event
- Moves left at current wall speed
- Collected on hitbox overlap with Ghosty
- Effect: 50% wall speed, 70% gravity for 3 seconds
- Visual: Blue screen tint during effect
- Does not stack — re-collecting resets timer
- Smooth 30-frame transition back to normal on expiry
- Only one power-up can exist on screen at a time

## BR-09: Invincibility Rules
- Active for 90 frames (1.5 seconds) at game start
- Ghosty blinks (visible/invisible toggle every 6 frames)
- Wall collisions ignored during invincibility
- Ground collision still kills (prevents exploit)
- Does not apply on restart after game over (always applies)

## BR-10: Game Over Rules
- Triggered by: wall collision (when not invincible) OR ground collision
- game_over.wav plays once on trigger
- High score file updated if current > stored
- Game state transitions to GAME_OVER
- All movement stops (walls, Ghosty, wind)
- Semi-transparent overlay displayed with score, high score, Play Again button

## BR-11: Boundary Rules
- **Left boundary**: Not applicable (Ghosty has fixed X)
- **Right boundary**: Walls spawn here, power-ups spawn here
- **Top boundary**: Ceiling bounce (BR-02)
- **Bottom boundary**: Ground at SCREEN_HEIGHT - 60px, collision = death
- **Playable area**: Y from 0 to SCREEN_HEIGHT - GROUND_HEIGHT
