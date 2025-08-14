let shapes = [];
let keyMap = {};

// Enigmatic scale: C, D♭, E, F♯, G♯, A♯, B, C
let baseFreq = 261.63; // Middle C
let scaleRatios = [
  1,          // C
  Math.pow(2, 1/12), // D♭
  Math.pow(2, 4/12), // E
  Math.pow(2, 6/12), // F♯
  Math.pow(2, 8/12), // G♯
  Math.pow(2, 10/12), // A♯
  Math.pow(2, 11/12), // B
  2           // C octave
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < letters.length; i++) {
    let type = i % 2 === 0 ? 'circle' : 'square';
    let noteIndex = i % scaleRatios.length;
    let freq = baseFreq * scaleRatios[noteIndex];
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

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Dreamy pitch glide and vibrato
    s.currentFreq += (s.targetFreq - s.currentFreq) * 0.01;
    let vibrato = sin(frameCount * 0.05 + s.offset) * 5;
    s.osc.freq(s.currentFreq + vibrato);

    // Trail
    s.trail.push({ x: s.x, y: s.y, opacity: s.opacity });
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20);
      else rect(t.x - 10, t.y - 10, 20, 20);
      t.opacity -= 10;
    }

    // Main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.currentFreq, 200, 800, 30, 100);
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x - size/2, s.y - size/2, size, size);

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

  osc.start();
  osc.amp(0.5, 0.05);

  // Randomly pick next target freq within scale for glide
  let targetFreq = config.freq * random(0.8, 1.2);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-3, 3),
    vy: random(-3, 3),
    type: config.type,
    baseFreq: config.freq,
    currentFreq: config.freq,
    targetFreq: targetFreq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: []
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
