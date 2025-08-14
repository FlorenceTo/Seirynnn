let started = false;
let visuals = [];
let introAlpha = 255;
const metallicColors = ["#FFD700","#C0C0C0","#B87333","#FF4500","#00CED1","#8A2BE2"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  background(0);
}

function draw() {
  background(0, 50); // trailing black for fade effect
  if (!started || introAlpha > 0) {
    fill(255, introAlpha);
    text("Click to start audio\nPress A–Z to play", width / 2, 80);
    if (started) introAlpha -= 2;
  }

  for (let i = visuals.length - 1; i >= 0; i--) {
    const v = visuals[i];
    v.update();
    v.draw();
    if (v.done) visuals.splice(i, 1);
  }
}

function mousePressed() {
  if (!started) {
    userStartAudio();
    started = true;
  }
}

function keyPressed() {
  if (!started) return;
  const letter = key.toUpperCase();
  if (letter < "A" || letter > "Z") return;

  const freq = playDynamicMetallicTone(letter);
  spawnAbstractVisual(letter, freq);
}

// METALLIC SOUND WITH DYNAMIC SPATIAL MOVEMENT
function playDynamicMetallicTone(letter) {
  const idx = letter.charCodeAt(0) - 65;
  const baseFreq = map(idx, 0, 25, 200, 900);

  let osc1 = new p5.Oscillator("triangle");
  let osc2 = new p5.Oscillator("sawtooth");
  let osc3 = new p5.Oscillator("triangle");

  // Detune for metallic shimmer
  osc1.freq(baseFreq * 0.99);
  osc2.freq(baseFreq * 1.01);
  osc3.freq(baseFreq * 1.03);

  // Create panner for spatial movement
  let panner = new p5.Panner();
  osc1.disconnect(); osc2.disconnect(); osc3.disconnect();
  osc1.connect(panner); osc2.connect(panner); osc3.connect(panner);

  // Initial pan and volume based on mouse
  let startPan = map(mouseX, 0, width, -1, 1);
  let startVol = map(mouseY, 0, height, 1, 0.2);

  const env = new p5.Envelope();
  env.setADSR(0.001, 0.05, 0.1, 0.3);
  env.setRange(startVol, 0);

  const delay = new p5.Delay();
  delay.process(osc1, 0.2, 0.5, 2200);
  delay.process(osc2, 0.15, 0.4, 2000);
  delay.process(osc3, 0.25, 0.3, 1800);

  osc1.start(); osc2.start(); osc3.start();
  env.play(osc1); env.play(osc2); env.play(osc3);

  // Animate pan over time to move sound across stereo field
  const duration = 0.5; // seconds
  const steps = 30;
  let step = 0;
  const panStep = (random(-1,1) - startPan) / steps;

  const panInterval = setInterval(() => {
    if (step >= steps) clearInterval(panInterval);
    panner.pan(startPan + panStep * step);
    step++;
  }, (duration*1000)/steps);

  osc1.stop(duration); osc2.stop(duration); osc3.stop(duration);

  return baseFreq;
}

// ABSTRACT VISUALS (same as before)
function spawnAbstractVisual(letter, freq) {
  const idx = letter.charCodeAt(0) - 65;
  const x = random(width);
  const y = random(height);
  const c = color(random(metallicColors));
  const type = idx % 5;
  const speed = map(freq, 200, 900, 1, 12);
  const size = map(freq, 200, 900, 40, 10);
  const alpha = map(freq, 200, 900, 180, 255);

  let v;
  switch (type) {
    case 0: v = new WavyLines(x, y, c, size, speed, alpha); break;
    case 1: v = new RotatingPolygon(x, y, c, size, speed, alpha); break;
    case 2: v = new ParticleBurst(x, y, c, size, speed, alpha); break;
    case 3: v = new ArcWave(x, y, c, size, speed, alpha); break;
    case 4: v = new IrregularBlob(x, y, c, size, speed, alpha); break;
  }
  visuals.push(v);
}

// Visual classes (unchanged from previous sketch)...
class WavyLines {
  constructor(x,y,c,s,sp,a){ this.x=x; this.y=y; this.c=c; this.s=s; this.speed=sp; this.alpha=a; this.done=false; this.offset=0; }
  update(){ this.offset += this.speed*0.1; this.alpha -=5; if(this.alpha<=0) this.done=true; }
  draw(){ push(); stroke(red(this.c),green(this.c),blue(this.c),this.alpha); strokeWeight(2);
    for(let i=0;i<10;i++){ let y = this.y + sin(this.offset+i*0.5)*this.s*2; line(this.x-50,this.y+i*10,this.x+50,y); } pop(); }
}

class RotatingPolygon {
  constructor(x,y,c,s,sp,a){ this.x=x; this.y=y; this.c=c; this.s=s; this.angle=0; this.speed=sp*0.1; this.alpha=a; this.done=false; this.sides=int(random(5,9)); }
  update(){ this.angle += this.speed; this.alpha -=5; if(this.alpha<=0) this.done=true; }
  draw(){ push(); translate(this.x,this.y); rotate(this.angle); fill(red(this.c),green(this.c),blue(this.c),this.alpha); noStroke();
    beginShape(); for(let i=0;i<this.sides;i++){ let a = TWO_PI*i/this.sides; vertex(cos(a)*this.s,sin(a)*this.s);} endShape(CLOSE); pop(); }
}

class ParticleBurst {
  constructor(x,y,c,s,sp,a){ this.x=x; this.y=y; this.c=c; this.particles=[]; this.alpha=a; this.done=false;
    for(let i=0;i<15;i++){ this.particles.push({x:this.x,y:this.y,vx:random(-sp,sp),vy:random(-sp,sp),size:s*random(0.5,1.2)});} }
  update(){ this.alpha-=5; this.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.size*=0.95;}); if(this.alpha<=0) this.done=true; }
  draw(){ this.particles.forEach(p=>{fill(red(this.c),green(this.c),blue(this.c),this.alpha); noStroke(); ellipse(p.x,p.y,p.size);}); }
}

class ArcWave {
  constructor(x,y,c,s,sp,a){ this.x=x; this.y=y; this.c=c; this.r=s; this.angle=0; this.speed=sp*0.1; this.alpha=a; this.done=false; }
  update(){ this.angle+=this.speed; this.r+=this.speed; this.alpha-=5; if(this.alpha<=0) this.done=true; }
  draw(){ push(); translate(this.x,this.y); noFill(); stroke(red(this.c),green(this.c),blue(this.c),this.alpha); strokeWeight(2);
    for(let i=0;i<5;i++){ arc(0,0,this.r+i*10,this.r+i*10,this.angle,this.angle+PI/2);} pop(); }
}

class IrregularBlob {
  constructor(x,y,c,s,sp,a){ this.x=x; this.y=y; this.c=c; this.s=s; this.angle=0; this.speed=sp*0.05; this.alpha=a; this.done=false; }
  update(){ this.angle+=this.speed; this.s+=this.speed*2; this.alpha-=4; if(this.alpha<=0) this.done=true; }
  draw(){ push(); translate(this.x,this.y); rotate(this.angle); fill(red(this.c),green(this.c),blue(this.c),this.alpha); noStroke();
    beginShape(); for(let i=0;i<10;i++){ let a = TWO_PI*i/10; let r=this.s*random(0.7,1.3); vertex(cos(a)*r,sin(a)*r);} endShape(CLOSE); pop(); }
}

function windowResized(){ resizeCanvas(windowWidth,windowHeight); }
