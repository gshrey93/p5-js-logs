/**
 * @jest-environment jsdom
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, JUMP, GAP, PIPE_WIDTH } from './js/config.js';
import { Bird } from './js/bird.js';
import { PipeManager } from './js/pipes.js';
import { GameStateManager, STATE } from './js/game-state.js';
import { soundFX } from './js/audio.js';

describe('Flappy Kiro Unit Tests', () => {

  describe('SoundFX Audio Controller', () => {
    test('soundFX instance has jump and gameOver audio objects initialized', () => {
      expect(soundFX.sounds.jump).toBeDefined();
      expect(soundFX.sounds.gameOver).toBeDefined();
    });

    test('play() triggers sound playback without throwing errors', () => {
      // Mock Audio play method in jsdom environment
      window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
      expect(() => soundFX.play('jump')).not.toThrow();
      expect(() => soundFX.play('gameOver')).not.toThrow();
    });
  });

  describe('Bird Entity Physics & Sound Triggering', () => {
    let bird;
    beforeEach(() => {
      bird = new Bird(80, 320);
      window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
    });

    test('initializes at starting coordinates with zero velocity', () => {
      expect(bird.x).toBe(80);
      expect(bird.y).toBe(320);
      expect(bird.vy).toBe(0);
    });

    test('update() applies gravity to vertical velocity and position', () => {
      bird.update();
      expect(bird.vy).toBe(GRAVITY);
      expect(bird.y).toBe(320 + GRAVITY);
    });

    test('jump() sets velocity to upward jump impulse and plays jump sound', () => {
      const spy = jest.spyOn(soundFX, 'play');
      bird.jump();
      expect(bird.vy).toBe(JUMP);
      expect(spy).toHaveBeenCalledWith('jump');
      spy.mockRestore();
    });

    test('isOutOfBounds() detects top and bottom canvas boundaries', () => {
      bird.y = -5;
      expect(bird.isOutOfBounds(640)).toBe(true);

      bird.y = 650;
      expect(bird.isOutOfBounds(640)).toBe(true);

      bird.y = 300;
      expect(bird.isOutOfBounds(640)).toBe(false);
    });
  });

  describe('PipeManager Collision & Spawning', () => {
    let pipeManager;
    let bird;
    beforeEach(() => {
      pipeManager = new PipeManager();
      bird = new Bird(80, 320);
    });

    test('starts with an empty pipe list and zero frame count', () => {
      expect(pipeManager.pipes).toEqual([]);
      expect(pipeManager.frame).toBe(0);
    });

    test('detects collision when bird hits top or bottom pipe', () => {
      pipeManager.pipes = [
        { x: 80, top: 100, scored: false }
      ];

      // Bird inside top pipe -> collision
      bird.y = 50;
      expect(pipeManager.collidesWith(bird)).toBe(true);

      // Bird inside gap -> safe
      bird.y = 150;
      expect(pipeManager.collidesWith(bird)).toBe(false);

      // Bird inside bottom pipe -> collision
      bird.y = 100 + GAP + 10;
      expect(pipeManager.collidesWith(bird)).toBe(true);
    });

    test('triggers score increment when bird passes pipe', () => {
      pipeManager.pipes = [
        { x: 20, top: 100, scored: false } // Past bird.x = 80
      ];
      let scoreTriggered = false;
      pipeManager.update(bird, () => { scoreTriggered = true; });
      expect(scoreTriggered).toBe(true);
      expect(pipeManager.pipes[0].scored).toBe(true);
    });
  });

  describe('GameState Management & Audio', () => {
    let gameState;
    beforeEach(() => {
      gameState = new GameStateManager();
      window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
    });

    test('initializes in START state with zero score', () => {
      expect(gameState.state).toBe(STATE.START);
      expect(gameState.score).toBe(0);
    });

    test('start() transitions state to PLAY and resets score', () => {
      gameState.score = 5;
      gameState.start();
      expect(gameState.state).toBe(STATE.PLAY);
      expect(gameState.score).toBe(0);
    });

    test('incrementScore() increments current score', () => {
      gameState.start();
      gameState.incrementScore();
      expect(gameState.score).toBe(1);
    });

    test('gameOver() transitions state to OVER, triggers gameOver sound, and updates best score', () => {
      const spy = jest.spyOn(soundFX, 'play');
      gameState.start();
      gameState.score = 10;
      gameState.gameOver();
      expect(gameState.state).toBe(STATE.OVER);
      expect(gameState.best).toBeGreaterThanOrEqual(10);
      expect(spy).toHaveBeenCalledWith('gameOver');
      spy.mockRestore();
    });
  });

});
