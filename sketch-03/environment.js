import state from './state.js';

// --- SKY BACKDROP ---

export function drawSkyBackdrop() {
  noStroke();

  let weatherShade = constrain(map(abs(state.wind), 0, 0.02, 0, 1), 0, 1);
  let topColor = lerpColor(color(82, 126, 193), color(54, 84, 140), weatherShade);
  let bottomColor = lerpColor(color(176, 222, 255), color(145, 191, 230), weatherShade);

  for (let y = 0; y < height; y += 4) {
    let t = map(y, 0, height, 0, 1);
    let skyColor = lerpColor(topColor, bottomColor, t);
    fill(skyColor);
    rect(0, y, width, 4);
  }

  fill(255, 240, 210, 24);
  ellipse(width * 0.18, height * 0.16, 95, 38);
  ellipse(width * 0.22, height * 0.14, 64, 24);
}

// --- CLOUDS ---

export function createClouds() {
  let created = [];
  for (let i = 0; i < 6; i++) {
    created.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.1, height * 0.32),
      w: random(60, 110),
      h: random(20, 36),
      speed: random(0.14, 0.42),
      alpha: random(0.18, 0.34)
    });
  }
  return created;
}

export function drawClouds() {
  for (let i = 0; i < state.clouds.length; i++) {
    let cloud = state.clouds[i];
    cloud.x += cloud.speed * state.wind * 220;

    if (cloud.x > width + cloud.w) cloud.x = -cloud.w;
    if (cloud.x < -cloud.w) cloud.x = width + cloud.w;

    noStroke();
    fill(255, 255, 255, cloud.alpha * 255);
    ellipse(cloud.x, cloud.y, cloud.w, cloud.h);
    ellipse(cloud.x + cloud.w * 0.22, cloud.y - 8, cloud.w * 0.68, cloud.h * 0.78);
    ellipse(cloud.x - cloud.w * 0.22, cloud.y - 5, cloud.w * 0.56, cloud.h * 0.74);
    ellipse(cloud.x + cloud.w * 0.36, cloud.y + 3, cloud.w * 0.45, cloud.h * 0.66);
  }
}
