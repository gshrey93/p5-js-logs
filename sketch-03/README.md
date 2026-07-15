# Sketch-03: Artillery Duel

A classic turn-based artillery game built with p5.js, inspired by hits like *Scorched Earth* and *Pocket Tanks*. Two players command their tanks on a procedurally generated, destructible terrain, adjusting their aim, power, and strategy to account for dynamic wind and gravity.

![Artillery Duel Gameplay](https://raw.githubusercontent.com/gshrey93/p5-js-logs/main/sketch-03/artillery-duel-preview.png)

## Game Objective

The objective is simple: be the last tank standing. Players must use their limited supply of ammunition to inflict damage on their opponent, reducing their health to zero. The challenge lies in mastering the firing arc and power while adapting to the ever-changing battlefield conditions.

## How to Play

The game is a duel between two players on the same keyboard.

- **Player 1 (Red Tank):**
  - **Aim:** `Up` / `Down` Arrow Keys
  - **Power:** `Left` / `Right` Arrow Keys
  - **Fire:** `Spacebar`

- **Player 2 (Blue Tank):**
  - **Aim:** `Up` / `Down` Arrow Keys
  - **Power:** `Left` / `Right` Arrow Keys (controls are inverted for ergonomic play)
  - **Fire:** `Spacebar`

- **Restart:** Press `R` at any time to start a new match.

## Features

- **Procedurally Generated Terrain:** Every match features a unique, fully destructible landscape made of sand and stone. No two games are the same, requiring players to constantly re-evaluate their position and strategy.
- **Dynamic Environment:** The battlefield is alive and unpredictable.
  - **Wind:** The wind speed and direction change at the start of each turn, subtly (or dramatically) altering the trajectory of your shots. A visual indicator at the top of the screen helps you gauge the current conditions.
  - **Gravity:** The force of gravity can vary from match to match, making some rounds feel light and floaty, while others feel heavy. This affects how quickly your projectiles drop.
  - **Destructible Landscape:** Every explosion carves away at the terrain, creating craters and altering the tactical landscape. Use this to your advantage to dig in or expose your opponent.
- **"Big Shot" Power-Up:** Land 3 consecutive damaging hits on your opponent to charge up a powerful "Big Shot" for your next turn, which creates a much larger explosion.
- **Rich Visuals & Audio:** The game includes particle effects for sparks and explosions, layered sky and cloud rendering, and sound effects for firing and impacts.
- **Polished UI:** Clear indicators for the active player, health, ammo, power-up status, and controls.

## Running Tests

This project uses Jest for unit testing. To run the tests:

1.  Navigate to this sketch's directory:
    ```bash
    cd sketch-03
    ```

2.  Install the required development dependencies:
    ```bash
    npm install
    ```

3.  Run the test suite:
    ```bash
    npm test
    ```