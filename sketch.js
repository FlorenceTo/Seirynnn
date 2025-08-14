let shapes = [];
let keyMap = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  // Map all 26 alphabet keys
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < letters.length; i++) {
    let type = i % 2 === 0 ? 'circle' : 'square';
    let freq = random(200, 800);
    let color;
    if (i % 3 === 0) color = [255, 0, 0]; // red
    else if (i % 3 === 1) color = [0, 255, 0]; // green
    else color = [255, 255, 255]; // white
    keyMap[letters[i]] = { type, freq, color };
  }
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move
    s.x += s.vx;
    s.y += s.vy;

    // Keep inside canvas
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.05 + s.offset) * 50;
    s.osc.freq(s.baseFreq + freqOffset);

    // Trail
    s.trail.push({x: s.x, y: s.y, opacity: s.opacity});
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20);
      else rect(t.x - 10, t.y - 10, 20, 20);
      t.opacity -= 10;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 900, 30, 100);
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x - size/2, s.y - size/2, size, size);

    // Fade out
    s.opacity -= 0.5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let osc;
  if (config.type === 'circle') osc = new p5.Oscillator('triangle'); // tap
  else osc = new p5.Oscillator('sine'); // bongo-like

  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-3, 3),
    vy: random(-3, 3),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: []
  };

  shapes.push(s);
}

function keyReleased() {
  // Stop the most recent shape's sound
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.5);
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
