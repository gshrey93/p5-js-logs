import state from './state.js';

// --- LAUNCH SPARKS ---

export function spawnLaunchSparks(startX, startY, angleInRadians, isBigShot) {
  let sparkCount = isBigShot ? 11 : 7;
  for (let i = 0; i < sparkCount; i++) {
    let sparkAngle = angleInRadians + random(-0.8, 0.8);
    let sparkSpeed = random(0.7, 2.6);

    state.launchSparks.push({
      x: startX + cos(angleInRadians) * random(2, 8),
      y: startY + sin(angleInRadians) * random(2, 8),
      vx: cos(sparkAngle) * sparkSpeed,
      vy: sin(sparkAngle) * sparkSpeed,
      radius: isBigShot ? random(2.5, 4.5) : random(1.8, 3.2),
      life: isBigShot ? random(7, 11) : random(5, 8),
      maxLife: isBigShot ? 11 : 8
    });
  }
}

export function updateLaunchSparks() {
  for (let i = state.launchSparks.length - 1; i >= 0; i--) {
    let spark = state.launchSparks[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.96;
    spark.vy *= 0.96;
    spark.life -= 1;

    if (spark.life <= 0) {
      state.launchSparks.splice(i, 1);
    }
  }
}

export function drawLaunchSparks() {
  for (const spark of state.launchSparks) {
    let alpha = map(spark.life, 0, spark.maxLife, 0, 220);
    fill(255, 245, 160, alpha);
    noStroke();
    circle(spark.x, spark.y, spark.radius);

    stroke(255, 146, 60, alpha * 0.8);
    strokeWeight(1.4);
    noFill();
    circle(spark.x, spark.y, spark.radius * 2.4);
  }
}

// --- IMPACT EFFECTS ---

export function updateImpactEffects() {
  for (let i = state.impactEffects.length - 1; i >= 0; i--) {
    state.impactEffects[i].life -= 1;
    state.impactEffects[i].radius += state.impactEffects[i].growth;

    if (state.impactEffects[i].life <= 0) {
      state.impactEffects.splice(i, 1);
    }
  }
}

export function drawImpactEffects() {
  for (const effect of state.impactEffects) {
    let alpha = map(effect.life, 0, effect.maxLife, 0, 255);
    let pulseRadius = effect.radius;

    noFill();
    stroke(255, 248, 188, alpha * 0.95);
    strokeWeight(8);
    circle(effect.x, effect.y, pulseRadius);

    stroke(255, 120, 60, alpha * 0.85);
    strokeWeight(4);
    circle(effect.x, effect.y, pulseRadius * 0.72);

    stroke(255, 255, 255, alpha * 0.45);
    strokeWeight(1.5);
    circle(effect.x, effect.y, pulseRadius * 1.15);
  }
}
