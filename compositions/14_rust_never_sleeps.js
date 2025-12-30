// RUST NEVER SLEEPS
// Oxidation as music - slow decay, iron returning to earth, beautiful destruction

setcpm(48)

stack(
  // The slow chemical reaction
  n("[0, 3, 7] ~ ~ ~ [2, 5, 9] ~ ~ ~")
    .scale("D:minor")
    .s("sawtooth")
    .lpf(sine.range(400, 1200).slow(32))
    .lpq(8)
    .attack(0.5)
    .release(2)
    .gain(0.45)
    .room(0.7)
    .shape(0.15),

  // Flakes falling off
  n(perlin.range(0, 7).segment(5))
    .scale("D4:minor")
    .s("gm_celesta")
    .gain(perlin.range(0.1, 0.3))
    .room(0.8)
    .delay(0.5)
    .delaytime(0.666)
    .delayfeedback(0.6)
    .pan(perlin.range(-1, 1).slow(5))
    .slow(1.5),

  // Structural groaning
  s("bd:3 ~ ~ ~ ~ ~ ~ ~")
    .lpf(200)
    .room(0.9)
    .size(10)
    .gain(0.4)
    .shape(0.2)
    .slow(2),

  // Water dripping - the catalyst
  s("~ ~ hh:1? ~ ~ ~ ~ hh:1?")
    .speed(0.6)
    .room(0.85)
    .gain(0.25)
    .slow(1.5),

  // Earth reclaiming
  n("0")
    .scale("D0:minor")
    .s("sine")
    .lpf(60)
    .gain(0.5)
    .slow(16),

  // Wind through corroded holes
  n(perlin.range(7, 14).segment(4))
    .scale("D5:minor")
    .s("triangle")
    .lpf(perlin.range(200, 800).slow(8))
    .hpf(100)
    .gain(perlin.range(0.02, 0.08))
    .pan(perlin.range(-1, 1).slow(6))
)
