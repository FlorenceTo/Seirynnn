let shapes = [];
let activeKeys = {};
let chordOscs = [];

// skipping C, starting from interval 3
let keyMap = {
  'D': { type:'sphere', freq: 146.83 }, // D3
  'R': { type:'box',    freq: 164.81 }, // E3
  'C': { type:'sphere', freq: 185.00 }, // F#3
  'F': { type:'box',    freq: 207.65 }, // G#3
  'V': { type:'sphere', freq: 233.08 }, // A#3
  'T': { type:'box',    freq: 246.94 }, // B3
  'G': { type:'sphere', freq: 293.66 }, // D4
  'B': { type:'box',    freq: 329.63 }, // E4
  'Y': { type:'sphere', freq: 369.99 }, // F#4
  'H': { type:'box',    freq: 415.30 }, // G#4
  'N': { type:'sphere', freq: 466.16 }, // A#4
  'U': { type:'box',    freq: 493.88 }, // B4
  'J': { type:'sphere', freq: 587.33 }, // D5
  'K': { type:'box',    freq: 659.25 }, // E5
  'M': { type:'sphere', freq: 739.99 }  // F#5
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 50);

  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    push();
    translate(s.x, s.y);
    for(let i=3;i>0;i--){
      fill(255, 50, 50*(i/3));
      ellipse(0,0,s.size+i*5);
    }
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
    freq: config.freq
  };
  shapes.push(s);

  let sphereKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='sphere');
  let boxKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='box');

  if(sphereKeys.length>0 && boxKeys.length>0){
    let highestFreq = max([...sphereKeys,...boxKeys].map(k=>activeKeys[k].freq));
    chordOscs = [];
    [0,4,7].forEach(interval=>{
      let osc = new p5.Oscillator('triangle');
      osc.freq(highestFreq * Math.pow(2, interval/12));
      osc.amp(0.4,0.01);
      osc.start();
      chordOscs.push(osc);
    });
  } else stopChord();
}

function keyReleased() {
  let k = key.toUpperCase();
  delete activeKeys[k];

  let sphereKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='sphere');
  let boxKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='box');
  if(sphereKeys.length===0 || boxKeys.length===0) stopChord();
}

function stopChord(){
  for(let o of chordOscs){
    o.amp(0,0.5);
    o.stop(0.5);
  }
  chordOscs=[];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
