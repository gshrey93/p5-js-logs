# Integration Test Instructions

## Purpose
Test interactions between game modules to ensure they work together correctly in the game loop.

## Test Scenarios

### Scenario 1: Difficulty → Ghosty Physics Integration
- **Description**: Verify that DifficultyManager parameters correctly affect Ghosty movement
- **Setup**: Create DifficultyManager and Ghosty instances
- **Test Steps**:
  1. Set score to 0, update difficulty, apply gravity to Ghosty
  2. Set score to 20, update difficulty, apply gravity to Ghosty
  3. Compare fall rates — higher score should produce faster fall
- **Expected Results**: Ghosty falls faster at higher scores
- **Manual Verification**: Play game, observe increasing difficulty

### Scenario 2: Wind → Ghosty → Background Integration
- **Description**: Verify wind affects Ghosty and provides visual cloud cue
- **Setup**: Create WindSystem, Ghosty, and ParallaxBackground
- **Test Steps**:
  1. Set wind target to positive value
  2. Update wind system for 100 frames
  3. Verify Ghosty receives force
  4. Verify cloud speed multiplier increases
- **Expected Results**: Ghosty pushed down, clouds speed up before force peaks

### Scenario 3: Wall Spawn → Collision → Game Over Integration
- **Description**: Verify wall collision triggers game over state
- **Setup**: Create Wall at Ghosty's position
- **Test Steps**:
  1. Position wall overlapping Ghosty
  2. Check collision
  3. Verify game state transitions to GAME_OVER
- **Expected Results**: Collision detected, state changes

### Scenario 4: PowerUp → SlowMotion → Wall Speed Integration
- **Description**: Verify power-up collection slows wall movement
- **Setup**: Create PowerUp, SlowMotionEffect, and walls
- **Test Steps**:
  1. Collect power-up (overlap rects)
  2. Activate slow-motion effect
  3. Update walls with effective speed (wall_speed * slow_mo multiplier)
  4. Verify walls move at 50% speed
- **Expected Results**: Walls move at half speed during effect

### Scenario 5: Score → High Score Persistence Integration
- **Description**: Verify score persists across game sessions
- **Test Steps**:
  1. Score 5 points, trigger game over
  2. Verify highscore.txt contains "5"
  3. Score 3 points, trigger game over
  4. Verify highscore.txt still contains "5"
- **Expected Results**: High score only updates when exceeded

## Running Integration Tests

These are manual gameplay verification scenarios. Run the game and verify:
```bash
python run.py
```

### Verification Checklist
- [ ] Game starts with title screen
- [ ] Ghosty blinks for ~1.5 seconds (invincibility)
- [ ] Walls spawn and scroll left
- [ ] Red walls start moving when close to Ghosty
- [ ] Wind indicator appears, Ghosty pushed accordingly
- [ ] Clouds speed up before wind force peaks
- [ ] Power-up (clock icon) appears occasionally
- [ ] Collecting power-up slows everything down with blue tint
- [ ] Slow-mo smoothly transitions back to normal
- [ ] Collision with wall triggers game over + sound
- [ ] Ground collision triggers game over
- [ ] Ceiling causes bounce (not death)
- [ ] Score increments on passing walls
- [ ] High score persists after restart
- [ ] "Play Again" button works
- [ ] Difficulty noticeably increases at score 15+
