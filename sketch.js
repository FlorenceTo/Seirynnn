let shapes = [];
let pitchRange = 50; // max pitch shift
let sizeRange = 1.5; // multiplier for size

// Scale ratios for the enigmatic scale (one octave down)
let scaleRatios = [1, 16/15, 5/4, 45/32, 25/16, 25/16, 15/8, 2]; 

// Map keys to shape types, base frequency, and colors
let keyMap = {};
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (let i = 0; i < letters.length; i++) {
  let c = letters[i];
  keyMap[c] = {
    type: i % 2 === 0 ? 'circle' : 'square',
    freq: 130 * Math.pow(2, i % 8 / 12),
    color: [
      random([255, 200, 150]),
      random([0, 100, 200]),
      random([0, 100, 255])
    ]
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 30); // fade for trails

  let mouseFactorX = map(mouseX, 0, width, -pitchRange, pitchRange);
  let mouseFactorY = map(mouseY, 0, height, 0.5, sizeRange);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Wrap edges
    if (s.x < 0) s.x = width;
    if (s.x > width) s.x = 0;
    if (s.y < 0) s.y = height;
    if (s.y > height) s.y = 0;

    // Pitch modulation with mouse X
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 10 + mouseFactorX;
    s.osc.freq(s.scaleNotes[s.currentNoteIndex] + freqOffset);

    // Trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20 * mouseFactorY);
      else rect(t.x-10*mouseFactorY, t.y-10*mouseFactorY, 20*mouseFactorY, 20*mouseFactorY);
      t.opacity -= 15;
    }

    // Main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.scaleNotes[s.currentNoteIndex], 130, 260, 30, 80) * mouseFactorY;
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x-size/2, s.y-size/2, size, size);

    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop(0.5);
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];

  // Wave type per shape
  let osc;
  if (config.type === 'circle') osc = new p5.Oscillator('triangle');
  else osc = new p5.Oscillator('sine');

  osc.start();
  osc.amp(0, 0.3);

  let delay = new p5.Delay();
  delay.process(osc, 0.4, 0.6, 2300);

  let reverb = new p5.Reverb();
  reverb.process(osc, 4, 2);

  let filter = new p5.LowPass();
  osc.disconnect();
  osc.connect(filter);
  filter.freq(1000);
  filter.res(1);

  let scaleNotes = scaleRatios.map(r => config.freq * r);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    type: config.type,
    scaleNotes: scaleNotes,
    currentNoteIndex: floor(random(scaleNotes.length)),
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    delay: delay,
    reverb: reverb,
    filter: filter
  };

  shapes.push(s);
}

function keyReleased() {
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.5);
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
