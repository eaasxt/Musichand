// KUDZU TAKEOVER
// Invasive vine consuming everything - unstoppable growth, green suffocation
// Structure: First Tendril -> Spreading -> Overwhelming -> Complete Coverage -> Decay

setcpm(98)

// Growth curve - exponential then plateau
let growth = sine.range(0, 1).slow(96)
let density = saw.range(0.3, 1).slow(80)

stack(
  // === TENDRILS REACHING - constantly expanding with more complexity ===
  n("<0 2 4 5> <2 4 5 7> <4 5 7 9> <5 7 9 11> <7 9 11 12> <5 7 9 11> <4 5 7 9> <2 4 5 7>".slow(16))
    .scale("F:lydian")
    .s("sawtooth")
    .lpf(saw.range(300, 1500).slow(16))
    .lpq(4)
    .gain(growth.range(0.3, 0.55))
    .room(0.5)
    .every(8, x => x.add(note(2)))
    .every(16, x => x.rev()),

  // === GROUND BEING COVERED - grows more relentless ===
  s("<bd ~ bd [bd bd]> <bd bd [~ bd] bd> <[bd bd] ~ bd bd>".slow(3))
    .lpf(300)
    .gain(density.range(0.5, 0.8))
    .every(4, x => x.fast(2))
    .mask("<0 1 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === LEAVES UNFURLING - more layers over time ===
  n(perlin.range(0, 7).segment(growth.range(4, 16)))
    .scale("F4:lydian")
    .s("triangle")
    .gain(perlin.range(0.15, 0.35))
    .pan(perlin.range(-0.8, 0.8).slow(3))
    .room(0.6)
    .delay(0.3)
    .delaytime(0.25)
    .delayfeedback(density.range(0.3, 0.7)),

  // === STRANGLED STRUCTURES - underneath the growth ===
  n("~ 0 ~ ~ 0 ~ ~ 0")
    .scale("F1:lydian")
    .s("sine")
    .lpf(density.range(100, 200))
    .gain(density.range(0.3, 0.6))
    .slow(2),

  // === INSECTS RIDING THE WAVE - density varies ===
  s("hh*<4 8 16 32 16 8 4 2>".slow(16))
    .speed(rand.range(1, 2))
    .gain(growth.range(0.1, 0.35))
    .hpf(4000)
    .pan(sine.fast(5)),

  // === COLLAPSING BUILDINGS - structural failure ===
  s("~ ~ ~ ~ ~ ~ ~ bd:3")
    .lpf(800)
    .hpf(200)
    .gain(growth.range(0.15, 0.4))
    .room(0.8)
    .slow("<4 4 2 2 1 2 2 4>".slow(16)),

  // === PHOTOSYNTHESIS HUM - green energy ===
  n("[0, 4, 7]")
    .scale("F2:lydian")
    .s("triangle")
    .lpf(density.range(400, 800))
    .attack(1)
    .release(2)
    .room(0.6)
    .gain(density.range(0.15, 0.35))
    .slow(4)
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === DECOMPOSITION - late phase decay ===
  n(perlin.range(-5, 5).segment(3))
    .scale("F3:lydian")
    .s("sawtooth")
    .lpf(perlin.range(200, 600).slow(8))
    .gain(perlin.range(0.05, 0.15))
    .crush(8)
    .room(0.7)
    .slow(3)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
