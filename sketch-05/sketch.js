(function () {
  "use strict";

  /* ── Page Setup ─────────────────────────────────────────────── */
  document.title = "Flappy Kiro";

  // Inject CSS styles
  var style = document.createElement("style");
  style.textContent = [
    "* { margin: 0; padding: 0; box-sizing: border-box; }",
    "body { display: flex; justify-content: center; align-items: center;",
    "  min-height: 100vh; background: #1a1a2e; }",
    "canvas { border: 2px solid #333; image-rendering: pixelated; }"
  ].join("\n");
  document.head.appendChild(style);

  // Create the game canvas
  var canvas = document.createElement("canvas");
  canvas.id = "game";
  canvas.width = 480;
  canvas.height = 640;
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");

  /* ── Game Constants ─────────────────────────────────────────── */
  var GRAVITY    = 0.35;
  var JUMP       = -6;
  var PIPE_WIDTH = 52;
  var GAP        = 140;
  var PIPE_SPEED = 2.5;
  var SPAWN_RATE = 90;       // frames between new pipes

  /* ── Game State ─────────────────────────────────────────────── */
  var bird = { x: 80, y: canvas.height / 2, w: 30, h: 22, vy: 0 };
  var pipes = [];
  var frame = 0;
  var score = 0;
  var best  = 0;
  var state = "start";       // "start" | "play" | "over"

  /* ── Helper: reset game ─────────────────────────────────────── */
  function reset() {
    bird.y  = canvas.height / 2;
    bird.vy = 0;
    pipes   = [];
    frame   = 0;
    score   = 0;
    state   = "play";
  }

  /* ── Input Handling ─────────────────────────────────────────── */
  function onTap() {
    if (state === "start") { reset(); return; }
    if (state === "over")  { reset(); return; }
    bird.vy = JUMP;
  }
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); onTap(); }
  });
  canvas.addEventListener("click", onTap);
  canvas.addEventListener("touchstart", function (e) { e.preventDefault(); onTap(); });

  /* ── Collision Detection ────────────────────────────────────── */
  function collides() {
    if (bird.y < 0 || bird.y + bird.h > canvas.height) return true;
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      if (bird.x + bird.w > p.x && bird.x < p.x + PIPE_WIDTH) {
        if (bird.y < p.top || bird.y + bird.h > p.top + GAP) return true;
      }
    }
    return false;
  }

  /* ── Update ─────────────────────────────────────────────────── */
  function update() {
    if (state !== "play") return;

    bird.vy += GRAVITY;
    bird.y  += bird.vy;
    frame++;

    // Spawn pipes
    if (frame % SPAWN_RATE === 0) {
      var topMin = 60;
      var topMax = canvas.height - GAP - 60;
      var top = Math.floor(Math.random() * (topMax - topMin)) + topMin;
      pipes.push({ x: canvas.width, top: top, scored: false });
    }

    // Move pipes & score
    for (var i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= PIPE_SPEED;
      if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < bird.x) {
        pipes[i].scored = true;
        score++;
      }
      if (pipes[i].x + PIPE_WIDTH < 0) pipes.splice(i, 1);
    }

    if (collides()) {
      state = "over";
      if (score > best) best = score;
    }
  }

  /* ── Draw ───────────────────────────────────────────────────── */
  function draw() {
    // Sky gradient
    var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#2c3e50");
    grad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state === "start") {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Flappy Kiro", canvas.width / 2, canvas.height / 2 - 40);
      ctx.font = "18px sans-serif";
      ctx.fillText("Press SPACE / Tap to Start", canvas.width / 2, canvas.height / 2 + 10);
      return;
    }

    // Pipes
    ctx.fillStyle = "#27ae60";
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);                         // top pipe
      ctx.fillRect(p.x, p.top + GAP, PIPE_WIDTH, canvas.height - p.top - GAP); // bottom pipe
      // pipe caps
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(p.x - 3, p.top - 18, PIPE_WIDTH + 6, 18);
      ctx.fillRect(p.x - 3, p.top + GAP, PIPE_WIDTH + 6, 18);
      ctx.fillStyle = "#27ae60";
    }

    // Bird
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(bird.x + bird.w - 8, bird.y + 8, 10, 6);  // beak
    ctx.fillStyle = "#fff";
    ctx.fillRect(bird.x + 18, bird.y + 4, 7, 7);            // eye white
    ctx.fillStyle = "#000";
    ctx.fillRect(bird.x + 21, bird.y + 6, 3, 3);            // eye pupil

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(score, canvas.width / 2, 50);

    // Game-over overlay
    if (state === "over") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#e74c3c";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillStyle = "#fff";
      ctx.font = "22px sans-serif";
      ctx.fillText("Score: " + score + "   Best: " + best, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = "16px sans-serif";
      ctx.fillText("Tap / Press SPACE to Retry", canvas.width / 2, canvas.height / 2 + 50);
    }
  }

  /* ── Game Loop ──────────────────────────────────────────────── */
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();

})();
