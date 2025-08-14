let shapes = [];
let keysAllowed = 'drcfvtgbyhnujkm'.split('');
let scaleFreqs = []; // Enigmatic scale frequencies

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Enigmatic scale: C, Db, E, F#, G#, A#, B (formula 1 – ♭2 – 3 – ♯4 – ♯5 – ♯6 – 7)
  // One octave higher than before
  let baseFreqs = [261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88];
  for (let octave = 3; octave <= 5; octave++) { // shifted up 1 octave
    baseFreqs.forEach(f => scaleFreqs.push(f * pow(2, octave - 4)));
  }
}

function draw() {
  background(0);

  for (let i = 0; i < shapes.length; i++) {
    let s = shapes[i];

    // Movement
    s.x += s.vx;
    s.y += s.vy;

    // Bounce
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Collision detection
    for (let j = i + 1; j < shapes.length; j++) {
      let o = shapes[j];
      let d = dist(s.x, s.y, o.x, o.y);
      if (d < (s.size + o.size) / 2) {
        if (!s.collided && !o.collided) {
          s.collided = o.collided = true;
          let lowFreq = s.freq / 4; // 2 octaves down
          playPluck(s, 0, lowFreq);
          playPluck(o, 0, lowFreq);
          s.glow = o.glow = 255;
        }
      }
    }

    // Glow decay
    s.glow = max(0, s.glow - 3);

    // Draw shape
    push();
    translate(s.x, s.y);
    fill(255);
    stroke(255, 0, 0, s.glow); // red glow border
    strokeWeight(2);
    if (s.type === 'circle') {
      ellipse(0, 0, s.size);
    } else {
      rectMode(CENTER);
      rect(0, 0, s.size, s.size);
    }
    pop();
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keysAllowed.includes(k)) return;

  let type = random(['circle', 'square']);
  let freq = random(scaleFreqs);

  let shape = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    size: random(30, 60),
    type: type,
    glow: 255,
    freq: freq,
    collided: false
  };

  playPluck(shape, 0, freq);
  shapes.push(shape);
}

function playPluck(shape, time, freq) {
  let env = new p5.Envelope();
  env.setADSR(0.01, 0.3, 0.0, 0.1);
  env.setRange(0.5, 0);

  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();
  env.play(osc, time);

  let delay = new p5.Delay();
  delay.process(osc, 0.1, 0.2, 2000);

  let reverb = new p5.Reverb();
  reverb.process(osc, 1, 2);

  osc.stop(time + 1.5);
}
