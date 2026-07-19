// Setup Mock Environment for p5.js and DOM
global.width = 600;
global.height = 650;
global.min = Math.min;
global.max = Math.max;
global.LEFT_ARROW = 37;
global.RIGHT_ARROW = 39;
global.UP_ARROW = 38;
global.DOWN_ARROW = 40;
global.random = (a, b) => {
  if (Array.isArray(a)) return a[0];
  if (typeof a === 'number' && typeof b === 'number') return (a + b) / 2;
  if (typeof a === 'number') return a * 0.5;
  return 0.5;
};
global.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
global.constrain = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
global.map = (v, s1, e1, s2, e2) => s2 + ((v - s1) / (e1 - s1)) * (e2 - s2);
global.lerp = (start, stop, amt) => start + (stop - start) * amt;
global.floor = Math.floor;
global.sin = Math.sin;
global.cos = Math.cos;
global.deltaTime = 16.67; // 60 fps simulation
global.millis = () => Date.now();
global.color = (c) => ({
  setAlpha: () => {}
});
global.frameCount = 1;
global.createCanvas = () => ({ parent: () => {} });
global.background = () => {};
global.translate = () => {};
global.stroke = () => {};
global.strokeWeight = () => {};
global.noStroke = () => {};
global.fill = () => {};
global.noFill = () => {};
global.ellipse = () => {};
global.line = () => {};
global.rect = () => {};
global.beginShape = () => {};
global.vertex = () => {};
global.endShape = () => {};
global.push = () => {};
global.pop = () => {};
global.rectMode = () => {};
global.textSize = () => {};
global.textAlign = () => {};
global.textStyle = () => {};
global.text = () => {};
global.keyIsDown = () => false;
global.keyCode = 0;
global.key = '';
global.mouseX = 300;
global.mouseY = 500;
global.CLOSE = 'CLOSE';
global.CENTER = 'CENTER';
global.BOLD = 'BOLD';
global.drawingContext = { shadowBlur: 0, shadowColor: '' };

// Mock DOM HUD Elements
document.body.innerHTML = `
  <div id="hud-score">0</div>
  <div id="hud-high-score">0</div>
  <div id="hud-level">1</div>
  <div id="hud-powerup">NONE</div>
  <div id="health-bar-fill" style="width: 100%"></div>
  <div id="start-overlay"></div>
  <div id="gameover-overlay"></div>
  <div id="final-score">0</div>
`;
