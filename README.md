# p5-js-logs
All JS browser scripts coded using GenAi chats
## Overview
**p5-js-logs** is a creative coding repository that started with "vibe coding" via simple ChatGPT/Gemini 2.5, with prompt refining and a lot of to-and-fro. These sketches in this repo started with monolithic sketch.js and index.html files, and over time, as I learnt to code agents, set up VSCode, browse repo folders, and finally commit syncs, I was able to break it down into modular components. It is a collection of small JavaScript utilities, interactive sketches, and games generated with assistance from various AI models and AI-powered IDEs. The project is purely front-end and is hosted live for immediate interaction.

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

## Available Sketches

Each sketch is located in its own directory and has a detailed README specific to its gameplay, UI, and test instructions:

- **🦖 [Sketch 02: Pixel Dino Run](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-02/README.md)**: Chrome-style endless runner featuring modular architecture, active boosters, crouch controls, flying enemies, human-like raised-arms celebration, and a 56-test Jest suite.
- **🕹️ [Sketch 03: Artillery Duel](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-03/README.md)**: Turn-based 2D tank battle game with procedural destructible terrain, dynamic wind/gravity, horizontal tank movement, and a 24-test Jest suite.
- **🌀 [Sketch 04: Geometric Loops](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-04/README.md)**: Mathematical/visual loop sketch exploring geometry and Fibonacci palindrome calculations.
- **🐦 [Sketch 05: Floppy Bird](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-05/README.md)**: Classic Flappy Bird browser game.
- **🧮 [Sketch 06: Calculator & Unit Converter](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-06/README.md)**: Modular Progressive Web App (PWA) calculator and multi-category unit converter with history logging and custom theming.
- **👾 [Sketch 07: Neon Strike Arcade Shooter](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-07/README.md)**: High-octane vector neon space shooter with stacking powerups, endless scaling boss arena mode, and synthesized Web Audio API sound effects.



