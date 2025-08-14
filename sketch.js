let shapes = [];
let activeKeys = {};
let chordOscs = [];

let keyMap = {
  'D': { type:'sphere', freq: 146.83 },
  'R': { type:'box',    freq: 164.81 },
  'C': { type:'sphere', freq: 185.00 },
  'F': { type:'box',    freq: 207.65 },
  'V': { type:'sphere', freq: 233.08 },
  'T': { type:'box',    freq: 246.94 },
  'G': { type:'sphere', freq: 293.66 },
  'B': { type:'box',    freq: 329.63 },
  'Y': { type:'sphere', freq: 369.99 },
  'H': { type:'box',    freq: 415.30 },
  'N': { type:'sphere', freq: 466.16 },
  'U': { type:'box',    freq: 493.88 },
  'J': { type:'sphere', freq: 587.33 },
  'K': { type:'box',    freq: 659.25 },
  'M': { type:'sphere', freq: 739.99 }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  // trails
  background(0, 50);

  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    push();
    translate(s.x, s.y);

    // glowing red pulse
    let glow = sin(frameCount * 0.1) * 50 + 50;

    stroke(255, 0, 0, glow);
    strokeWeight(1);
    fill(255);
    if(s.type==='sphere') ellipse(0,0,s.size);
    else rectMode(CENTER), rect(0,0,s.size,s.size);

    pop();
  }
}

function keyPressed() {
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  userStartAudio();
  activeKeys[k] = keyMap[k];

  let config = keyMap[k];
  let s = {
    x: random(width), y: random(height),
    vx: random(-1,1), vy: random(-1,1),
    type: config.type,
    size: 50,
    freq: config.freq,
    osc: new p5.Oscillator('triangle'),
    startTime: millis()
  };
  s.osc.freq(s.freq);
  s.osc.amp(0.3, 0.01);
  s.osc.start();
  s.osc.mod = 0.002; // small wobble

  shapes.push(s);

  // check sphere+box for chord
  updateChord();
}

function keyReleased() {
  let k = key.toUpperCase();
  let shapeIndex = shapes.findIndex(s => s.freq === keyMap[k]?.freq);
  if(shapeIndex>=0){
    let s = shapes[shapeIndex];
    s.osc.amp(0,0.5);
    s.osc.stop(0.5);
    shapes.splice(shapeIndex,1);
  }

  delete activeKeys[k];
  updateChord();
}

function updateChord(){
  let sphereKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='sphere');
  let boxKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='box');

  // stop previous chord
  for(let o of chordOscs){
    o.amp(0,0.3);
    o.stop(0.3);
  }
  chordOscs = [];

  if(sphereKeys.length>0 && boxKeys.length>0){
    let highestFreq = max([...sphereKeys,...boxKeys].map(k=>activeKeys[k].freq));
    [0,4,7].forEach(interval=>{
      let osc = new p5.Oscillator('triangle');
      osc.freq(highestFreq * Math.pow(2, interval/12));
      osc.amp(0.2,0.01);
      osc.start();
      chordOscs.push(osc);
    });
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
