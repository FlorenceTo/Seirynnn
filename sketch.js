let shapes = [];

let keyMap = {
  'A': { type: 'sphere', freq: 600, color: [255, 0, 0] },
  'S': { type: 'box', freq: 300, color: [0, 255, 0] },
  'D': { type: 'sphere', freq: 700, color: [255, 255, 255] },
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;
    s.z += s.vz;

    push();
    translate(s.x, s.y, s.z);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq, 200, 900, 50, 150);
    if (s.type === 'sphere') sphere(size);
    else box(size);
    pop();

    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop(0.2);
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio(); // important for sound in browser

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let osc = config.type === 'sphere' ? new p5.Oscillator('triangle') : new p5.Oscillator('sine');
  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  let s = {
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    z: random(-500, 500),
    vx: random(-1, 1),
    vy: random(-1, 1),
    vz: random(-1, 1),
    type: config.type,
    baseFreq: config.freq,
    osc: osc,
    color: config.color,
    opacity: 255
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
