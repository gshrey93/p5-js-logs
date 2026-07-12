# p5-js-logs
All JS browser scripts coded using GenAi chats
## Overview
**p5-js-logs** is a creative coding repository dedicated to "vibe coding" and rapid prototyping. It serves as a collection of small JavaScript utilities, interactive sketches, and games generated with the assistance of various AI models and AI-powered IDEs. The project is purely front-end and is hosted live for immediate interaction.

Live Demo: [https://gshrey93.github.io/p5-js-logs/](https://gshrey93.github.io/p5-js-logs/)

## Architecture
The application follows a straightforward static site architecture. Each sketch or game is isolated within its own directory, relying on a standard HTML file to load the p5.js library and the associated JavaScript logic. The rendering happens entirely client-side on the HTML5 Canvas.

## Repo Structure
The repository is structured to modularize each game or utility into its own self-contained folder.

```text
p5-js-logs/
├── [Sketch Folder 1]/
│   ├── index.html       # Entry point loading p5.js and sketch.js
│   └── sketch.js        # Core game/utility logic
├── [Sketch Folder 2]/
│   ├── index.html
│   └── sketch.js
└── README.md
```
## Installation Script
Since this is a collection of static, client-side front-end files, no complex installation or build scripts are required.
1. Clone the repository:
bash
`git clone https://github.com/gshrey93/p5-js-logs.git
cd p5-js-logs`

2. Run locally:
You can simply open any index.html file directly in your web browser.
Alternatively, for a better development experience (to avoid CORS issues with local assets), serve the folder using a local web server, such as Node's http-server or VS Code's "Live Server" extension:
`npx http-server .`
## Data Structures
Data structures in this repository are scoped within individual sketch.js files. Commonly, they consist of standard JavaScript Objects and Arrays used to manage:

_Game State_: Tracking scores, active screens (menu, playing, game over).

_Entity Coordinates_: x and y vector properties for drawing shapes or game characters on the canvas.

_Configurations_: Setting objects for canvas dimensions, colors, and physics parameters (like gravity or speed).

_Rules Logic_: All rules logic that help build a number to be calculated basis a predeinfed series

## Release Notes
### Summary
This PR focuses on visual polish for the Tank Duel sketch while preserving the current gameplay loop. The goal is to improve readability and presentation without changing the underlying controls or rules.

### What changed
- Added layered sky shading and drifting clouds to improve atmosphere and overall scene depth.
- Slowed projectile speed to a more deliberate, classic arcade pace.
- Strengthened turn-state highlighting, launch feedback, and impact pulses to make each shot easier to follow.
- Refined terrain and tank rendering to move the presentation away from harsh pixel-block styling and toward a cleaner modern arcade aesthetic.

This is a presentation and UX pass rather than a gameplay redesign.

