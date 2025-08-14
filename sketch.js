let shapes = [];
let camAngleX = 0;
let camAngleY = 0;
let camZoom = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  camAngleX = map(mouseY, 0, height, -PI/4, PI/4);
  camAngleY = map(mouseX, 0, width, -PI, PI);

  camera(
    camZoom * sin(camAngleY) * cos(camAngleX),
    camZoom * sin(camAngleX),
    (height/2) / tan(PI/6) + camZoom * cos(camAngleY) * cos(camAngleX),
    0, 0, 0,
    0, 1, 0
  );

  rotateY(frameCount * 0.002);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;
    s.z += s.vz;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 100;
    s.osc.freq(s.baseFreq + freqOffset);
    s.panner.setPosition(s.x / 2, s.y / 2, s.z / 2);

    // Shape trail
    s.trail.push({x: s.x, y: s.y, z: s.z, opacity: 255});
    if (s.trail.length > 30) s.trail.shift();
    for (let t of s.trail) {
      push();
      translate(t.x, t.y, t.z);
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      sphere(10);
      pop();
      t.opacity -= 10;
    }

    // Particle effect
    for (let j = s.particles.length - 1; j >= 0; j--) {
      let p = s.particles[j];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.opacity -= 4;
      if (p.opacity <= 0) s.particles.splice(j, 1);
      else {
        push();
        translate(p.x, p.y, p.z);
        fill(p.color[0], p.color[1], p.color[2], p.opacity);
        sphere(p.size);
        pop();
      }
    }

    // Shape fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop(0.2);
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    push();
    translate(s.x, s.y, s.z);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 900, 50, 200);
    if (s.type === 'sphere') sphere(size);
    else box(size);
    pop();
  }
}

function keyPressed() {
  userStartAudio();

  let type = random() < 0.5 ? 'sphere' : 'box';
  let baseFreq, osc;

  if (type === 'sphere') {
    baseFreq = random(500, 800);
    osc = new p5.Oscillator('triangle');
  } else {
    baseFreq = random(200, 400);
    osc = new p5.Oscillator('sine');
  }

  osc.freq(baseFreq);
  osc.start();
  osc.amp(0.5, 0.05);

  let delay = new p5.Delay();
  delay.process(osc, 0.2, 0.4, 2000);

  let panner = new p5.Panner3D();
  panner.pan(0, 0, 0);
  osc.disconnect();
  osc.connect(panner);

  let colors = [
    [255, 0, 0], [200, 0, 0],
    [0, 255, 0], [0, 200, 0],
    [255, 255, 255], [200, 200, 200]
  ];
  let color = random(colors);

  let vx = random(-1, 1);
  let vy = random(-1, 1);
  let vz = random(-1, 1);

  let s = {
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
    opacity: 255,
    trail: [],
    particles: []
  };

  // Spawn particles based on shape type
  for (let i = 0; i < 10; i++) {
    let speed = type === 'sphere' ? random(1, 4) : random(0.5, 2);
    s.particles.push({
      x: s.x, y: s.y, z: s.z,
      vx: random(-speed, speed),
      vy: random(-speed, speed),
      vz: random(-speed, speed),
      size: random(5, 15),
      opacity: 255,
      color: s.color
    });
  }

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

function mouseWheel(event) {
  camZoom += event.delta * 0.5;
  camZoom = constrain(camZoom, -500, 1000);
}
