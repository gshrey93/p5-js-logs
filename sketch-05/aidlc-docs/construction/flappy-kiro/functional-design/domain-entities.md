# Flappy Kiro - Domain Entities

## Entity Relationship Diagram

```
+-------------+       updates        +----------------+
|   GameLoop  | ------------------> |  DifficultyMgr |
+-------------+                      +----------------+
      |                                     |
      | owns                                | provides params
      v                                     v
+-------------+    wind force     +----------------+
|   Ghosty    | <---------------- |   WindSystem   |
+-------------+                   +----------------+
      |
      | collides with
      v
+-------------+       spawns      +----------------+
|    Wall     | <---------------- |  WallSpawner   |
+-------------+                   +----------------+
      |
      | (same spawner)
      v
+-------------+
|   PowerUp   |
+-------------+
      |
      | collected by Ghosty
      v
+----------------+
| SlowMotionFX  |
+----------------+

+-------------------+
| ParallaxBackground|  (independent, updated by GameLoop)
+-------------------+

+-------------------+
|   ScoreManager    |  (tracks score, high score, file I/O)
+-------------------+
```

## Entities

### Ghosty
| Attribute | Type | Description |
|-----------|------|-------------|
| sprite | Surface | Loaded from assets/ghosty.png, scaled to 40x40 |
| rect | Rect | Position and collision box (40x40) |
| velocity | float | Current vertical velocity (px/frame) |
| angle | float | Rotation angle for visual tilt |
| invincible | bool | Whether currently invincible |
| invincible_timer | int | Frames remaining of invincibility |

| Method | Description |
|--------|-------------|
| jump(jump_vel) | Set velocity to jump_vel |
| update(gravity, wind_force) | Apply gravity + wind, update position, tilt |
| draw(surface) | Render rotated sprite (blink if invincible) |
| reset(x, y) | Reset position, velocity, invincibility |
| is_visible() | Returns whether to draw (for blink effect) |

### Wall
| Attribute | Type | Description |
|-----------|------|-------------|
| x | float | Horizontal position |
| gap_y | float | Center Y of the gap |
| is_moving | bool | Whether this is a moving (red) wall |
| moving_active | bool | Whether vertical movement has started |
| move_direction | int | +1 (down) or -1 (up) |
| passed | bool | Whether Ghosty has passed this wall |
| top_rect | Rect | Top pipe collision rect |
| bottom_rect | Rect | Bottom pipe collision rect |

| Method | Description |
|--------|-------------|
| update(wall_speed, ghosty_x) | Move left, activate/oscillate if moving |
| draw(surface) | Render with green (static) or red (moving) style |
| is_off_screen() | True if fully past left edge |
| collides_with(rect) | AABB collision check against both pipes |

### WindSystem
| Attribute | Type | Description |
|-----------|------|-------------|
| current_force | float | Current wind force applied to Ghosty |
| target_force | float | Target force being lerped toward |
| lerp_speed | float | Rate of interpolation (0.02) |
| change_timer | int | Frames until next target change |
| change_interval | int | Random interval (180-300 frames) |

| Method | Description |
|--------|-------------|
| update() | Lerp current toward target, check timer for new target |
| get_force() | Return current_force |
| get_cloud_speed_multiplier() | Return value for cloud cue effect |
| reset() | Reset to zero force, new random timer |

### DifficultyManager
| Attribute | Type | Description |
|-----------|------|-------------|
| score | int | Current score (drives all scaling) |
| gravity | float | Current gravity value |
| jump_velocity | float | Current jump velocity |
| wall_speed | float | Current wall horizontal speed |
| spawn_interval | float | Current frames between wall spawns |
| moving_wall_chance | float | Current probability of moving wall |

| Method | Description |
|--------|-------------|
| update(score) | Recalculate all parameters from score |
| get_gravity() | Return current gravity |
| get_jump_velocity() | Return current jump velocity |
| get_wall_speed() | Return current wall speed |
| get_spawn_interval() | Return current spawn interval |
| get_moving_chance() | Return current moving wall probability |
| reset() | Reset all to base values |

### PowerUp (Slow Motion)
| Attribute | Type | Description |
|-----------|------|-------------|
| x | float | Horizontal position |
| y | float | Vertical position |
| rect | Rect | Collision hitbox |
| active | bool | Whether currently on screen |

| Method | Description |
|--------|-------------|
| update(wall_speed) | Move left at wall speed |
| draw(surface) | Render clock/hourglass icon |
| is_off_screen() | True if past left edge |
| collides_with(rect) | Check collection by Ghosty |

### SlowMotionEffect
| Attribute | Type | Description |
|-----------|------|-------------|
| active | bool | Whether effect is currently active |
| timer | int | Frames remaining |
| transition_timer | int | Frames for smooth end transition |
| speed_multiplier | float | Current speed multiplier (0.5 when active) |
| gravity_multiplier | float | Current gravity multiplier (0.7 when active) |

| Method | Description |
|--------|-------------|
| activate() | Start/reset effect timer |
| update() | Decrement timer, handle transition |
| get_speed_mult() | Return current speed multiplier |
| get_gravity_mult() | Return current gravity multiplier |
| is_active() | Return whether effect is active |

### ParallaxBackground
| Attribute | Type | Description |
|-----------|------|-------------|
| cloud_positions | list | Cloud positions [x, y, w, h] |
| ground_offset | float | Scrolling offset for ground pattern |
| cloud_speed_mult | float | Multiplier for wind cue effect |

| Method | Description |
|--------|-------------|
| update(wall_speed, wind_cue) | Scroll layers, apply wind cue to clouds |
| draw(surface) | Render sky gradient, clouds, ground |

### ScoreManager
| Attribute | Type | Description |
|-----------|------|-------------|
| score | int | Current game score |
| high_score | int | Persisted best score |
| file_path | str | Path to highscore.txt |

| Method | Description |
|--------|-------------|
| increment() | Add 1 to score |
| check_high_score() | Update high_score if score > high_score |
| save() | Write high_score to file |
| load() | Read high_score from file |
| reset() | Reset score to 0 (keep high_score) |

## Data Flow

```
Input (Space) --> Ghosty.jump()
                       |
                       v
Frame Update:  DifficultyMgr.update(score)
                       |
               +-------+-------+
               |               |
               v               v
        WindSystem.update()   WallSpawner (spawn/soft-cap check)
               |               |
               v               v
        Ghosty.update(      Wall.update(speed, ghosty_x)
          gravity,              |
          wind_force)           v
               |          Collision Check
               |               |
               v               v
        Boundary Check    Score / Game Over
               |
               v
        PowerUp.update() --> SlowMotionEffect
               |
               v
           Render All
```
