// environment.js — Sky, clouds, mountains, day/night cycle

import { CONFIG } from './config.js';

// ============================================================
// ENVIRONMENT STATE
// ============================================================

export const envState = {
  farClouds: [],
  nearClouds: [],
  mountains: [],
  stars: [],
  timeOfDay: 0,
  skyColor: null,
  groundColor: null,
  mountainColor: null,
};

// ============================================================
// INITIALIZATION
// ============================================================

export function initEnvironment() {
  envState.mountains = [];
  envState.farClouds = [];
  envState.nearClouds = [];
  envState.stars = [];

  // Drift stars (spawns 35 stars)
  for (let i = 0; i < 35; i++) {
    envState.stars.push({
      x: random(width),
      y: random(0, height - CONFIG.GROUND_HEIGHT - 100),
      size: random(1.5, 3.8),
      speed: random(0.08, 0.28),
      blinkOffset: random(100),
    });
  }

  for (let i = 0; i < 5; i++) {
    envState.mountains.push({
      x: random(width),
      y: height - CONFIG.GROUND_HEIGHT - random(20, 80),
      w: random(100, 300),
      h: random(50, 100),
    });
  }
  for (let i = 0; i < 10; i++) {
    envState.farClouds.push({
      x: random(width), y: random(50, 150),
      w: random(40, 80), h: random(10, 20),
    });
    envState.nearClouds.push({
      x: random(width), y: random(150, 200),
      w: random(60, 100), h: random(15, 30),
    });
  }

  envState.timeOfDay = 0;
}

// ============================================================
// COLOR UPDATE — Day/Night Cycle
// ============================================================

export function updateColors() {
  const noonSky = color(135, 206, 235);
  const duskSky = color(255, 140, 0);
  const nightSky = color(25, 25, 112);
  const dawnSky = color(255, 105, 180);

  const noonGround = color(139, 69, 19);
  const nightGround = color(47, 23, 7);

  const noonMountain = color(169, 169, 169);
  const nightMountain = color(60, 60, 60);

  const t0 = envState.timeOfDay;

  if (t0 < 0.25) {
    let t = map(t0, 0, 0.25, 0, 1);
    envState.skyColor = lerpColor(noonSky, duskSky, t);
    envState.groundColor = lerpColor(noonGround, nightGround, t);
    envState.mountainColor = lerpColor(noonMountain, nightMountain, t);
  } else if (t0 < 0.5) {
    let t = map(t0, 0.25, 0.5, 0, 1);
    envState.skyColor = lerpColor(duskSky, nightSky, t);
    envState.groundColor = nightGround;
    envState.mountainColor = nightMountain;
  } else if (t0 < 0.75) {
    let t = map(t0, 0.5, 0.75, 0, 1);
    envState.skyColor = lerpColor(nightSky, dawnSky, t);
    envState.groundColor = lerpColor(nightGround, noonGround, t);
    envState.mountainColor = lerpColor(nightMountain, noonMountain, t);
  } else {
    let t = map(t0, 0.75, 1, 0, 1);
    envState.skyColor = lerpColor(dawnSky, noonSky, t);
    envState.groundColor = noonGround;
    envState.mountainColor = noonMountain;
  }
}

// ============================================================
// DRAWING
// ============================================================

export function drawBackground() {
  background(envState.skyColor);

  // 1. Draw stars if it is night/dusk/dawn
  const isNightVal = sin(envState.timeOfDay * TWO_PI); // ranges from -1 (night) to 1 (day)
  if (isNightVal < 0.6) {
    const starAlpha = map(isNightVal, 0.6, -1, 0, 220); // full brightness at midnight (-1)
    push();
    noStroke();
    envState.stars.forEach(s => {
      // Small blinking animation using sin
      const blink = sin(frameCount * 0.04 + s.blinkOffset) * 0.5 + 0.5;
      fill(255, 255, 255, starAlpha * (0.3 + 0.7 * blink));
      rect(s.x, s.y, s.size, s.size);
    });
    pop();
  }

  // 2. Sun / Moon
  const sunMoonX = width / 2;
  const sunMoonY = map(sin(envState.timeOfDay * TWO_PI), -1, 1, height / 2, 50);
  const isSun = envState.timeOfDay < 0.25 || envState.timeOfDay > 0.75;
  fill(isSun ? color(255, 255, 200) : color(230, 230, 250));
  noStroke();
  ellipse(sunMoonX, sunMoonY, 50, 50);

  // 3. Far clouds (slowest layer)
  fill(
    red(envState.skyColor) + 15,
    green(envState.skyColor) + 15,
    blue(envState.skyColor) + 15,
    200
  );
  envState.farClouds.forEach(c => rect(c.x, c.y, c.w, c.h, 10));

  // 4. Mountains
  fill(envState.mountainColor);
  envState.mountains.forEach(m => {
    beginShape();
    vertex(m.x, m.y + m.h);
    vertex(m.x + m.w / 2, m.y);
    vertex(m.x + m.w, m.y + m.h);
    endShape(CLOSE);
  });

  // 5. Near clouds (faster layer)
  fill(
    red(envState.skyColor) + 30,
    green(envState.skyColor) + 30,
    blue(envState.skyColor) + 30,
    220
  );
  envState.nearClouds.forEach(c => rect(c.x, c.y, c.w, c.h, 15));
}

export function drawGround() {
  fill(envState.groundColor);
  noStroke();
  rect(0, height - CONFIG.GROUND_HEIGHT, width, CONFIG.GROUND_HEIGHT);
}

// ============================================================
// PARALLAX UPDATE
// ============================================================

export function updateBackgroundElements(gameSpeed) {
  // Move stars slowly to the left
  envState.stars.forEach(s => {
    s.x -= gameSpeed * s.speed;
    if (s.x < 0) {
      s.x = width;
      s.y = random(0, height - CONFIG.GROUND_HEIGHT - 100);
    }
  });

  envState.mountains.forEach(m => {
    m.x -= gameSpeed * 0.1;
    if (m.x + m.w < 0) m.x = width + random(50);
  });
  envState.farClouds.forEach(c => {
    c.x -= gameSpeed * 0.2;
    if (c.x + c.w < 0) c.x = width + random(50);
  });
  envState.nearClouds.forEach(c => {
    c.x -= gameSpeed * 0.5;
    if (c.x + c.w < 0) c.x = width + random(50);
  });

  // Advance day/night
  envState.timeOfDay = (envState.timeOfDay + CONFIG.DAY_NIGHT_SPEED * (gameSpeed / CONFIG.INITIAL_SPEED)) % 1;
}
