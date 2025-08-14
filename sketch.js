let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  rotateY(frameCount * 0.002); // slow rotation for scene

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shape in 3D
    s.x += s.vx;
    s.y += s.vy;
    s.z += s.vz;

    // Modulate pitch
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 100;
    s.osc.freq(s.baseFreq + freqOffset);

    // Update 3D panner position
    s.panner.setPosition(s.x / 2, s.y / 2, s.z / 2);

    // Fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop(0.2);
      shapes.splice(i, 1);
      continue;
    }

    // Draw shape
    push();
    translate(s.x, s.y, s.z);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 900, 50, 200);

    if (s.type === 'sphere') {
      sphere(size);
    } else {
      box(size);
    }
    pop();
  }
}

function keyPressed() {
  userStartAudio();

  let type = random() < 0.5 ? 'sphere' : 'box';
  let baseFreq = random(200, 800);

  let osc = new p5.Oscillator(type === 'sphere' ? 'triangle' : 'sine');
  osc.freq(baseFreq);
  osc.start();
  osc.amp(0.5, 0.05);

  // small delay for metallic feel
  let delay = new p5.Delay();
  delay.process(osc, 0.2, 0.4, 2000);

  // Create 3D panner and link to shape
  let panner = new p5.Panner3D();
  panner.pan(0, 0, 0); // initial center
  osc.disconnect();
  osc.connect(panner);

  // Random color
  let colors = [
    [255, 0, 0],
    [200, 0, 0],
    [0, 255, 0],
    [0, 200, 0],
    [255, 255, 255],
    [200, 200, 200]
  ];
  let color = random(colors);

  // Random velocities
  let vx = random(-1, 1);
  let vy = random(-1, 1);
  let vz = random(-1, 1);

  shapes.push({
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    z: random(-500, 500),
    vx: vx,
    vy: vy,
    vz: vz,
    type: type,
    baseFreq: baseFreq,
    offset: random(TWO_PI),
    osc: osc,
    panner: panner,
    color: color,
    opacity: 255
  });
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
