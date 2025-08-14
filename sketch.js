let shapes = [];
let activeKeys = {};
let chordOscs = [];

let keyMap = {
  'D': { type:'sphere', freq: 261.63 }, // C4
  'R': { type:'box',    freq: 293.66 }, // D4
  'C': { type:'sphere', freq: 329.63 }, // E4
  'F': { type:'box',    freq: 369.99 }, // F#4
  'V': { type:'sphere', freq: 415.30 }, // G#4
  'T': { type:'box',    freq: 466.16 }, // A#4
  'G': { type:'sphere', freq: 493.88 }, // B4
  'B': { type:'box',    freq: 523.25 }, // C5
  'Y': { type:'sphere', freq: 554.37 }, // C#5
  'H': { type:'box',    freq: 587.33 }, // D5
  'N': { type:'sphere', freq: 622.25 }, // D#5
  'U': { type:'box',    freq: 659.25 }, // E5
  'J': { type:'sphere', freq: 698.46 }, // F5
  'K': { type:'box',    freq: 739.99 }, // F#5
  'M': { type:'sphere', freq: 783.99 }  // G5
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 50); // subtle trail effect

  for (let s of shapes) {
    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Bounce off edges
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Draw shape with glow effect
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

  // Add active key
  activeKeys[k] = keyMap[k];

  // Spawn shape
  let config = keyMap[k];
  let s = {
    x: random(width), y: random(height),
    vx: random(-1,1), vy: random(-1,1),
    type: config.type,
    size: 50,
    freq: config.freq
  };
  shapes.push(s);

  // Handle chords: sphere+box
  let sphereKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='sphere');
  let boxKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='box');

  if(sphereKeys.length>0 && boxKeys.length>0){
    // highest frequency of pressed keys
    let highestFreq = max([...sphereKeys,...boxKeys].map(k=>activeKeys[k].freq));

    // Create 3-note chord (root + major 3rd + perfect 5th)
    chordOscs = [];
    [0,4,7].forEach(interval=>{
      let osc = new p5.Oscillator('triangle');
      osc.freq(highestFreq * Math.pow(2, interval/12));
      osc.amp(0.4,0.01);
      osc.start();
      chordOscs.push(osc);
    });
  } else {
    // no chord if one side missing
    stopChord();
  }
}

function keyReleased() {
  let k = key.toUpperCase();
  delete activeKeys[k];

  // stop chord if either shape type released
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
