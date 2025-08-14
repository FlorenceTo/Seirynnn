let shapes = [];
let camZoom = 0;

// Enigmatic scale (C, Db, E, F#, G#, A#, B) over 3 octaves
let enigmaticFreqs = [
  277.18, 329.63, 370.00, 415.30, 466.16, 554.37, 622.25, // octave 3
  739.99, 830.61, 932.33, 1108.73, 1244.51, 1479.98,      // octave 4
  1661.22, 1864.66, 2217.46, 2489.02, 2959.96, 3322.44    // octave 5
];

let keysList = "ertyuisdfghjklxcvbnm".split("");

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Movement
    s.x += s.vx;
    s.y += s.vy;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.02 + s.offset) * 5;
    s.osc.freq(s.baseFreq + freqOffset);

    // Envelope smoothing
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 2);

    // Glow pulse
    let glow = sin(frameCount * 0.1 + s.offset) * 100 + 155;
    let redGlow = map(level, 0, 0.3, 0, 255);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(redGlow, 0, 0);

    fill(255, 255, 255, glow);
    ellipse(s.x, s.y, s.size * ampScale);

    // Border
    stroke(255, 0, 0, 150);
    strokeWeight(1);
    noFill();
    ellipse(s.x, s.y, s.size * ampScale + 2);
    noStroke();

    // Fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.env.triggerRelease();
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();

  let idx = keysList.indexOf(key.toLowerCase());
  if (idx === -1) return;

  let freq = enigmaticFreqs[idx % enigmaticFreqs.length];

  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();

  // Slight detune for warmth
  osc.freq(freq * 0.999 + random(-1, 1));

  // Filter envelope
  let filter = new p5.LowPass();
  filter.freq(2000);
  filter.res(2);
  osc.disconnect();
  osc.connect(filter);

  // Envelope for smooth fade
  let env = new p5.Envelope();
  env.setADSR(0.05, 0.2, 0.3, 1.5);
  env.setRange(0.5, 0);
  env.play(osc);

  // Reverb & delay
  let reverb = new p5.Reverb();
  reverb.process(osc, 5, 5);

  let delay = new p5.Delay();
  delay.process(osc, 0.2, 0.4, 2300);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  shapes.push({
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    baseFreq: freq,
    osc: osc,
    amp: amp,
    env: env,
    offset: random(TWO_PI),
    opacity: 255,
    size: random(40, 100)
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
