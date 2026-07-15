# Artillery Duel - Test Cases

This document outlines the test cases for the `sketch-03` Artillery Duel game, covering core gameplay mechanics, UI, and environmental factors.

## 1. Game State & Turn Logic

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-GS-01 | Verify initial game state | 1. Load the game. | Game state is `P1_TURN`. Tank 1 is highlighted as active. |
| TC-GS-02 | Verify turn switch after firing | 1. As Player 1, fire a shot. 2. Wait for the projectile to land or go off-screen. | Game state switches to `P2_TURN`. Tank 2 becomes active. |
| TC-GS-03 | Verify turn switch after P2 fires | 1. Complete P1's turn. 2. As Player 2, fire a shot. 3. Wait for the projectile to land or go off-screen. | Game state switches back to `P1_TURN`. Tank 1 becomes active. |
| TC-GS-04 | Verify game state during projectile flight | 1. As any player, fire a shot. | Game state is `PROJECTILE_AIRBORNE`. No player can control their tank. |
| TC-GS-05 | Verify game over state (Health) | 1. Damage one tank until its health is <= 0. | Game state switches to `GAME_OVER`. The "Match Complete" overlay appears with the correct winner. |
| TC-GS-06 | Verify game over state (Ammo) | 1. Both players expend all their shots (`MAX_SHOTS`). | Game state switches to `GAME_OVER`. The "Match Complete" overlay appears with the correct winner based on remaining health. |

## 2. Player Controls & Input

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-PC-01 | P1 Angle Control | 1. As Player 1, press `Up Arrow` and `Down Arrow`. | Tank 1's barrel angle changes accordingly. Angle is constrained between -180 and 0 degrees. |
| TC-PC-02 | P1 Power Control | 1. As Player 1, press `Left Arrow` and `Right Arrow`. | Tank 1's power changes accordingly. Power is constrained between 0 and 100. |
| TC-PC-03 | P2 Angle Control | 1. As Player 2, press `Up Arrow` and `Down Arrow`. | Tank 2's barrel angle changes accordingly. Angle is constrained between -180 and 0 degrees. |
| TC-PC-04 | P2 Power Control (Inverted) | 1. As Player 2, press `Left Arrow` and `Right Arrow`. | Tank 2's power changes with inverted controls (Left increases, Right decreases). Power is constrained between 0 and 100. |
| TC-PC-05 | Firing | 1. As the active player, press `Spacebar`. | A projectile is fired. The tank's `shotsLeft` count decreases by 1. The fire sound plays. |
| TC-PC-06 | Firing when out of ammo | 1. As the active player, reduce `shotsLeft` to 0. 2. Press `Spacebar`. | No projectile is fired. |
| TC-PC-07 | Input during projectile flight | 1. While a projectile is airborne, press any control keys. | No change in either tank's angle or power. |
| TC-PC-08 | Game Restart | 1. At any point during the game, press `R`. | The game resets to its initial state (new terrain, full health/ammo). |

## 3. Physics & Environment

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-PE-01 | Projectile trajectory with gravity | 1. Fire a shot with no wind. | The projectile follows a parabolic arc downwards due to gravity. |
| TC-PE-02 | Projectile trajectory with wind | 1. Fire a shot when the wind indicator shows a non-zero value. | The projectile's horizontal path is visibly affected in the direction of the wind. |
| TC-PE-03 | Terrain destruction | 1. Fire a shot into a sand part of the terrain. | A crater is created at the point of impact. The explosion sound plays. |
| TC-PE-04 | Projectile bouncing on stone | 1. Fire a shot so it lands on a stone (grey) part of the terrain. | The projectile bounces off the stone with reduced velocity. |
| TC-PE-05 | Wind indicator display | 1. Observe the wind indicator at the start of several turns. | The indicator correctly shows "Calm" for no wind, and chevrons pointing left or right for wind, with more chevrons for stronger wind. |

## 4. Damage & Power-Ups

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-DP-01 | Tank takes damage | 1. Hit an enemy tank with a projectile. | The enemy tank's health decreases. The amount of damage depends on the proximity to the blast center. |
| TC-DP-02 | "Big Shot" combo gain | 1. As Player 1, land a damaging hit on Player 2. | Player 1's `consecutiveHits` counter increases by 1. |
| TC-DP-03 | "Big Shot" combo reset | 1. As Player 1, land a hit that deals minimal damage (splash only) or miss entirely. | Player 1's `consecutiveHits` counter resets to 0. |
| TC-DP-04 | "Big Shot" activation | 1. Land 3 consecutive damaging hits. | The UI displays "BIG SHOT READY!". The tank's barrel has a visible glowing effect. |
| TC-DP-05 | Firing a "Big Shot" | 1. With a Big Shot ready, fire a projectile. | The projectile is visually distinct. The subsequent explosion is larger and deals more damage than a standard shot. The `consecutiveHits` counter resets to 0. |

## 5. UI/UX & Visuals

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-UX-01 | Active player indicator | 1. Observe the screen during P1's turn and P2's turn. | The active tank has a yellow highlight border. The top banner correctly states the active player. |
| TC-UX-02 | Health and Ammo display | 1. Take damage and fire shots. | The HP and Shots counters in the UI update correctly for both players. |
| TC-UX-03 | Aiming trajectory line | 1. As the active player, adjust angle and power. | A dotted line appears, predicting the projectile's path based on current settings and gravity. |
| TC-UX-04 | Game Over overlay | 1. Trigger a game over condition. | The `game-overlay` appears, is not hidden, and displays the correct winner message and a restart button. |
| TC-UX-05 | Restart button functionality | 1. On the Game Over overlay, click the "Restart Match" button. | The game resets, and the overlay becomes hidden. |