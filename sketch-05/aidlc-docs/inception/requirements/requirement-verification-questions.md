# Requirements Clarification Questions

Please answer the following questions to help clarify the requirements for Flappy Kiro.

## Question 1
What technology should be used to build the game?

A) HTML5 Canvas + vanilla JavaScript (single HTML file, no build tools)
B) HTML5 Canvas + TypeScript (requires build step)
C) Phaser.js game framework (JavaScript game engine)
D) Other (please describe after [Answer]: tag below)

[Answer]: D Python with Pygame

## Question 2
How should the game camera/viewport work as Ghosty moves to the right?

A) Side-scrolling: Camera follows Ghosty, walls scroll into view from the right
B) Fixed screen: Ghosty stays centered horizontally, walls move left toward Ghosty (classic Flappy Bird style)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
What should happen when the game ends (collision with wall or ground)?

A) Show "Game Over" text with final score, play game_over.wav, click/spacebar to restart
B) Show a dedicated game over screen with score and a "Play Again" button
C) Immediately restart the game
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
Should there be a start screen before gameplay begins?

A) Yes, show a title screen with "Press Space to Start" prompt
B) No, start gameplay immediately on page load
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
What visual style should the walls/obstacles have?

A) Simple solid-colored rectangles (minimalist)
B) Styled rectangles with borders/gradients to look like pipes or barriers
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
Should the score persist between sessions (high score)?

A) Yes, save high score in browser localStorage
B) No, just show current score per session
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What background style should the game have?

A) Simple solid color or gradient background
B) Parallax scrolling background with layers (sky, clouds, ground)
C) Other (please describe after [Answer]: tag below)

[Answer]: B
