# Tank Duel Sketch

A lightweight two-player artillery game built with p5.js and plain browser JavaScript.

## Game Objective

Destroy the opposing tank by adjusting angle, power, wind, and gravity during each turn.

## Controls

- Player 1:
  - Aim: Up / Down Arrow
  - Power: Left / Right Arrow
  - Fire: Space
- Player 2:
  - Aim: Up / Down Arrow
  - Power: Left / Right Arrow
  - Fire: Space
- Restart: R

## How to Run

You can open the sketch directly in the browser, or serve the repository locally:

```bash
cd p5-js-logs
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/sketch-03/index.html
```

## Notes

- Terrain is generated dynamically for each round.
- Wind and gravity vary between turns.
- A restart overlay appears at the end of a match for quick replay.

## To Add
- Moving the tank vehicle
