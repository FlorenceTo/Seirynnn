function keyPressed() {
  userStartAudio();

  let k = key.toLowerCase();
  if (!keysAllowed.includes(k)) return; // ignore unassigned keys

  // Prevent multiple triggers on long key press
  if (keyIsDown(keyCode)) return;

  let type = random(['circle','square']);
  let freq = random(scaleFreqs) * (random([1,2])); // random octave

  let shape = {
    x: random(width),
    y: random(height),
    vx: random(-2,2),
    vy: random(-2,2),
    size: random(30, 60),
    type: type,
    glow: 0,
    collided: false
  };

  playPluck(shape, 0, freq);
  shapes.push(shape);
}
