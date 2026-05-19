# Flappy Kiro - Functional Design Plan

## Plan Steps
- [x] Collect answers to functional design questions
- [x] Resolve any ambiguities via follow-up questions
- [x] Generate business-logic-model.md (game mechanics, state machine, algorithms)
- [x] Generate business-rules.md (validation, constraints, game rules)
- [x] Generate domain-entities.md (classes, relationships, data structures)

---

# Functional Design Questions

Please answer the following questions to help define the detailed game logic.

## Business Logic Modeling

### Question 1
How should gravity and jump feel? Should Ghosty have a "floaty" feel (slow gravity, gentle jump) or a "snappy" feel (strong gravity, quick jump)?

A) Floaty - slow descent, gentle arc on jump (more forgiving)
B) Snappy - fast descent, sharp jump (more challenging, classic Flappy Bird)
C) Progressive - starts floaty, gets snappier as score increases (difficulty ramp)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
How should difficulty scale as the player progresses?

A) Fixed difficulty - same wall speed, gap size, and spawn rate throughout
B) Gradual increase - walls speed up and/or gaps shrink over time
C) Score-based tiers - distinct difficulty jumps at score thresholds (e.g., every 10 points)
D) Mixed - wall speed increases AND moving wall frequency increases
E) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
Should there be a maximum number of walls on screen at once, or should they just keep spawning at the interval?

A) No limit - walls spawn at fixed interval regardless of how many are on screen
B) Soft cap - reduce spawn rate if too many walls are visible
C) Hard cap - never more than N walls on screen (specify N if choosing this)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Domain Model

### Question 4
How large should Ghosty's collision hitbox be relative to the sprite?

A) Exact sprite size (40x40 pixels) - pixel-perfect feel
B) Slightly smaller than sprite (e.g., 30x30) - more forgiving, feels fair
C) Circular hitbox inscribed in sprite - rounded collision
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What should the wall gap size be relative to Ghosty's size?

A) 4x Ghosty height (160px) - comfortable, casual
B) 3.5x Ghosty height (140px) - moderate challenge
C) Dynamic - starts at 4x and shrinks to 3x as difficulty increases
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Business Rules - Wind System

### Question 6
How should wind gusts behave?

A) Random direction and strength each gust, with pauses between gusts
B) Gradual wind that shifts direction smoothly (like real wind)
C) Predictable pattern - alternates up/down so player can anticipate
D) Increasing intensity - wind gets stronger as score increases
E) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 7
Should the player receive a visual warning before wind starts?

A) Yes - show a wind arrow indicator 1-2 seconds before the gust hits
B) No warning - wind appears suddenly (adds surprise challenge)
C) Subtle cue - clouds speed up or background shifts slightly before gust
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Business Rules - Moving Walls

### Question 8
How should moving (red) walls behave once activated?

A) Move in one direction only (up or down) until off-screen
B) Oscillate up and down continuously (bouncing between bounds)
C) Move toward Ghosty's current vertical position (homing behavior)
D) Random direction changes at intervals
E) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 9
Should moving walls move faster as difficulty increases?

A) Yes - movement speed scales with score
B) No - constant movement speed throughout
C) Variable per wall - each moving wall gets a random speed within a range
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Error Handling & Edge Cases

### Question 10
What should happen if Ghosty goes above the top of the screen?

A) Block at ceiling - Ghosty stops at y=0, velocity resets (current behavior)
B) Instant death - hitting the ceiling kills Ghosty like hitting the ground
C) Bounce - Ghosty bounces off the ceiling with reversed velocity
D) Wrap - Ghosty appears at the bottom (unlikely but creative)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 11
Should there be a brief invincibility/grace period at game start?

A) Yes - 1-2 seconds of invincibility after pressing Start
B) No - game is live immediately, first wall is far enough away
C) Soft start - first wall spawns further away to give reaction time
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Business Scenarios

### Question 12
Should the game have any power-ups or bonus items?

A) No - pure skill-based, no power-ups
B) Yes - occasional shield that blocks one collision
C) Yes - slow-motion pickup that temporarily slows wall speed
D) Yes - score multiplier pickup
E) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 13
Should there be any visual/audio feedback when passing through a wall pair (scoring)?

A) No extra feedback - just the score number incrementing
B) Subtle visual flash or particle effect on score
C) Short sound effect on each point scored
D) Both visual and audio feedback
E) Other (please describe after [Answer]: tag below)

[Answer]: A
