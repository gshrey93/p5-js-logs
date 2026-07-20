import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert';

// Global mocks for DOM & HTMLMediaElement
global.window = {
  HTMLMediaElement: {
    prototype: {
      play: () => Promise.resolve()
    }
  }
};

global.Audio = class MockAudio {
  constructor(src) {
    this.src = src;
    this.currentTime = 0;
  }
  play() {
    return Promise.resolve();
  }
};

global.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val.toString(); },
    clear: () => { store = {}; }
  };
})();

// Dynamically import modules after mocks are setup
const { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, JUMP, GAP, PIPE_WIDTH } = await import('./js/config.js');
const { Bird } = await import('./js/bird.js');
const { PipeManager } = await import('./js/pipes.js');
const { GameStateManager, STATE } = await import('./js/game-state.js');
const { soundFX } = await import('./js/audio.js');

describe('Flappy Kiro Gameplay & Audio Tests', () => {

  describe('SoundFX Audio Controller', () => {
    test('soundFX instance has jump and gameOver audio assets registered', () => {
      assert.ok(soundFX.sounds.jump);
      assert.ok(soundFX.sounds.gameOver);
      assert.strictEqual(soundFX.sounds.jump.src, 'assets/jump.wav');
      assert.strictEqual(soundFX.sounds.gameOver.src, 'assets/game_over.wav');
    });

    test('play() triggers audio playback without throwing errors', () => {
      assert.doesNotThrow(() => soundFX.play('jump'));
      assert.doesNotThrow(() => soundFX.play('gameOver'));
    });
  });

  describe('Bird Entity Physics & Jump Audio', () => {
    let bird;
    beforeEach(() => {
      bird = new Bird(80, 320);
    });

    test('initializes at starting coordinates with zero vertical velocity', () => {
      assert.strictEqual(bird.x, 80);
      assert.strictEqual(bird.y, 320);
      assert.strictEqual(bird.vy, 0);
    });

    test('update() applies gravity to vertical velocity and position', () => {
      bird.update();
      assert.strictEqual(bird.vy, GRAVITY);
      assert.strictEqual(bird.y, 320 + GRAVITY);
    });

    test('jump() sets upward jump velocity impulse and triggers audio', () => {
      bird.jump();
      assert.strictEqual(bird.vy, JUMP);
    });

    test('isOutOfBounds() detects top and bottom canvas boundaries', () => {
      bird.y = -5;
      assert.strictEqual(bird.isOutOfBounds(640), true);

      bird.y = 650;
      assert.strictEqual(bird.isOutOfBounds(640), true);

      bird.y = 300;
      assert.strictEqual(bird.isOutOfBounds(640), false);
    });
  });

  describe('PipeManager Spawning & AABB Collision', () => {
    let pipeManager;
    let bird;
    beforeEach(() => {
      pipeManager = new PipeManager();
      bird = new Bird(80, 320);
    });

    test('starts with empty pipe list and zero frame count', () => {
      assert.deepStrictEqual(pipeManager.pipes, []);
      assert.strictEqual(pipeManager.frame, 0);
    });

    test('detects AABB collision when bird hits top or bottom pipe obstacle', () => {
      pipeManager.pipes = [{ x: 80, top: 100, scored: false }];

      // Bird inside top pipe -> collision
      bird.y = 50;
      assert.strictEqual(pipeManager.collidesWith(bird), true);

      // Bird inside gap -> safe
      bird.y = 150;
      assert.strictEqual(pipeManager.collidesWith(bird), false);

      // Bird inside bottom pipe -> collision
      bird.y = 100 + GAP + 10;
      assert.strictEqual(pipeManager.collidesWith(bird), true);
    });

    test('triggers score increment callback when bird successfully passes pipe', () => {
      pipeManager.pipes = [{ x: 20, top: 100, scored: false }];
      let scoreTriggered = false;
      pipeManager.update(bird, () => { scoreTriggered = true; });
      assert.strictEqual(scoreTriggered, true);
      assert.strictEqual(pipeManager.pipes[0].scored, true);
    });
  });

  describe('GameState Transitions, High Scores & Defeat Sound', () => {
    let gameState;
    beforeEach(() => {
      gameState = new GameStateManager();
    });

    test('initializes in START state with zero score', () => {
      assert.strictEqual(gameState.state, STATE.START);
      assert.strictEqual(gameState.score, 0);
    });

    test('start() transitions state to PLAY and resets score', () => {
      gameState.score = 5;
      gameState.start();
      assert.strictEqual(gameState.state, STATE.PLAY);
      assert.strictEqual(gameState.score, 0);
    });

    test('incrementScore() increments current score', () => {
      gameState.start();
      gameState.incrementScore();
      assert.strictEqual(gameState.score, 1);
    });

    test('gameOver() transitions state to OVER, plays defeat sound, and updates best score', () => {
      gameState.start();
      gameState.score = 15;
      gameState.gameOver();
      assert.strictEqual(gameState.state, STATE.OVER);
      assert.ok(gameState.best >= 15);
    });
  });

});
