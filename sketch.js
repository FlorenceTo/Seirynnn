let shapes = [];
let keysList = 'ertyuisdfghjklxcvbnm'.split('');
let scaleIntervals = [0, 1, 4, 7, 10, 13, 16]; // Enigmatic scale, one octave

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 50); // slight trail effect
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move
    s.x += s.vx;
    s.y += s.vy;

    // Bounce edges
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Shape fade
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.stop();
      shapes.splice(i, 1);
      continue;
    }

    // Draw glow
    push();
    translate(s.x, s.y);
    let glow = map(s.opacity, 255, 0, 50, 0);
    fill(255, glow, glow, s.opacity);
    stroke(255, glow, glow);
    strokeWeight(1);
    if (s.type === 'sphere') ellipse(0, 0, s.size);
    else rectMode(CENTER), rect(0, 0, s.size, s.size);
    pop();
  }
}

function getFreq(idx) {
  let baseFreq = 130.81; // C3
  let interval = scaleIntervals[idx % scaleIntervals.length];
  return baseFreq * pow(2, interval / 12) * random(0.98, 1.02);
}

function keyPressed() {
  userStartAudio();
  let idx = keysList.indexOf(key.toLowerCase());
  if (idx === -1) return;

  let freq = getFreq(idx);
  let type = idx % 2 === 0 ? 'sphere' : 'box';

  let osc = new p5.Oscillator(type === 'sphere' ? 'triangle' : 'sine');
  osc.freq(freq);
  osc.start();

  let filter = new p5.LowPass();
  filter.freq(1000);
  filter.res(1.2);
  osc.disconnect();
  osc.connect(filter);

  let env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.3, 0.5);
  env.setRange(0.3, 0);
  env.play(osc);

  let reverb = new p5.Reverb();
  reverb.process(osc, 1, 1.5);

  let delay = new p5.Delay();
  delay.process(osc, 0.05, 0.25, 500);

  shapes.push({
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    size: random(40, 100),
    type: type,
    osc: osc,
    opacity: 255
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
