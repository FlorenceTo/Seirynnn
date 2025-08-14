let shapes = [];
let keyMap = {};
let scaleFreqs = [261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88]; // enigmatic scale
let reverb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  reverb = new p5.Reverb();
  reverb.set(4, 2); // 4s reverb time, 2 decay

  let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < keys.length; i++) {
    let octave = i < 7 ? 1 : i < 14 ? 2 : 3;
    keyMap[keys[i]] = scaleFreqs[i % scaleFreqs.length] / Math.pow(2, 1 - octave);
  }
}

function draw() {
  background(0);
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    s.x += s.vx;
    s.y += s.vy;

    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 2);

    // Draw trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 30) s.trail.shift();
    for (let t of s.trail) {
      fill(255, t.opacity);
      ellipse(t.x, t.y, 20 * ampScale);
      t.opacity -= 6; // slower fade for longer trails
    }

    // Glow
    if (s.glow > 0) {
      fill(255, 50, 50, s.glow); // stronger red glow
      ellipse(s.x, s.y, 36 * ampScale); // slightly bigger glow
      s.glow *= 0.92; // slower decay for more lingering glow
    }

    // Shape outline (1.5px for more visibility)
    stroke(255);
    strokeWeight(1.5);
    fill(255, s.opacity);
    ellipse(s.x, s.y, 30 * ampScale);
    noStroke();

    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 1.5); // smooth fade
      setTimeout(() => s.osc.stop(), 1600);
      shapes.splice(i, 1);
      continue;
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let freq = keyMap[k];
  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();
  osc.amp(0.3, 0.05);

  // Slight detune for dreaminess
  osc.freq(freq * (1 + random(-0.002, 0.002)));

  // Low-pass filter
  let filter = new p5.LowPass();
  filter.freq(1200);
  osc.disconnect();
  osc.connect(filter);

  reverb.process(filter, 2, 2); // shared global reverb

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    osc: osc,
    amp: amp,
    opacity: 255,
    trail: [],
    glow: 250 // stronger and more persistent glow
  };

  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
