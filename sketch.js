let shapes = [];
let texts = [];
let activeKeys = {};
let sounds = {};
let shapesMap = {};

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  texts.push({ text: "Press Keys", alpha: 255 });

  userStartAudio(); // allow audio

  // Define a simple set of keys with unique sounds and shape properties
  let keys = [
    'A','S','D','F','G','H','J','K','L','Q','W','E','R','T'
  ];

  keys.forEach((k, i) => {
    // Each key gets a tap/bongo type sound
    let osc = new p5.Oscillator(random(['triangle','sine','square']));
    osc.start();
    osc.amp(0);

    let env = new p5.Envelope();
    env.setADSR(0.001, 0.1, 0, 0.2);
    env.setRange(random(0.3,0.6), 0);

    sounds[k] = { osc, env };

    // Each key also has a shape template
    shapesMap[k] = {
      sizeX: random(20,60),
      sizeY: random(10,60),
      rotationSpeed: random(-0.05,0.05),
      fadeRate: random(1,3),
      colors: [
        [255,0,0],[0,255,0],[0,0,255],[255,255,0],
        [255,128,0],[128,0,255],[0,255,255]
      ]
    };
  });
}

function draw() {
  background(0,50);

  // Draw shapes
  for (let i = shapes.length-1; i>=0; i--) {
    let s = shapes[i];
    fill(s.color[0],s.color[1],s.color[2],s.alpha);
    push();
    translate(s.x, s.y);
    rotate(s.angle);
    ellipse(0,0,s.sizeX,s.sizeY);
    pop();

    s.alpha -= s.fadeRate;
    s.angle += s.rotationSpeed;

    if(s.alpha <=0) shapes.splice(i,1);
  }

  // Draw fading text
  for(let t of texts){
    fill(255,t.alpha);
    text(t.text, width/2, 100);
    if(t.alpha>0) t.alpha-=2;
  }
}

function keyPressed() {
  if (!activeKeys[key]) {
    activeKeys[key]=true;

    let pan = map(mouseX,0,width,-1,1);

    if(sounds[key]){
      let s = sounds[key];
      s.osc.freq(random(200,800));
      s.osc.pan(pan);
      s.env.play(s.osc);
    }

    if(shapesMap[key]){
      let shp = shapesMap[key];
      shapes.push({
        x: random(width),
        y: random(height),
        sizeX: shp.sizeX,
        sizeY: shp.sizeY,
        color: random(shp.colors),
        alpha: 255,
        fadeRate: shp.fadeRate,
        angle: random(TWO_PI),
        rotationSpeed: shp.rotationSpeed
      });
    }
  }
}

function keyReleased() {
  if(activeKeys[key]){
    delete activeKeys[key];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  userStartAudio();
}
