// STATIC CLING
// Laundry fresh from the dryer - crackling electricity, warm fabrics, domestic chaos
// Structure: Loading -> Tumble Start -> Full Spin -> Static Peak -> Unloading

setcpm(132)

// Tumble dynamics
let spin = sine.range(0.3, 1).slow(72)
let static_charge = saw.range(0, 1).slow(96)

stack(
  // === THE TUMBLE CYCLE - evolving rhythm ===
  s("<[bd ~] [~ sd] [bd bd] [~ sd]> <bd [~ sd] [~ bd] sd> <[bd bd] ~ [bd sd] ~>".slow(3))
    .gain(spin.range(0.55, 0.85))
    .room(0.3)
    .lpf(spin.range(400, 800))
    .every(8, x => x.fast(2)),

  // === STATIC DISCHARGE - builds with charge ===
  s("hh*16")
    .degradeBy(static_charge.range(0.8, 0.3))
    .speed(rand.range(1.5, 3))
    .gain(rand.range(0.1, 0.4).mul(static_charge))
    .pan(rand)
    .hpf(6000)
    .room(0.2),

  // === FABRIC SOFTENER MELODY - sweet synthetic ===
  n("<[0 2] [4 5]> <[7 5] [4 2]> <[2 4] [5 7]> <[9 7] [5 4]>".slow(4))
    .scale("G:major")
    .s("square")
    .lpf(spin.range(800, 1600))
    .lpq(3)
    .gain(0.4)
    .room(0.4)
    .delay(0.2)
    .delaytime(0.125)
    .delayfeedback(static_charge.range(0.2, 0.5))
    .every(8, x => x.rev()),

  // === ZIPPER CLICKS - metallic percussion ===
  s("~ cp ~ [cp cp]")
    .degradeBy(0.3)
    .gain(0.35)
    .hpf(3000)
    .room(0.3)
    .speed(spin.range(0.8, 1.2))
    .every(4, x => x.fast(2)),

  // === MOTOR BASS - warm and constant ===
  n("<0 0 [0 0] 0> <0 [0 0] 0 0>".slow(2))
    .scale("G1:major")
    .s("triangle")
    .lpf(spin.range(150, 250))
    .gain(0.5),

  // === SOCK DIMENSION PORTAL - ethereal disappearing ===
  n("7")
    .scale("G5:major")
    .s("sine")
    .gain(static_charge.range(0.05, 0.2))
    .room(0.95)
    .delay(0.7)
    .delaytime(0.5)
    .delayfeedback(0.8)
    .slow(8)
    .pan(saw.slow(4)),

  // === LINT TRAP TEXTURE - high frequency debris ===
  n(perlin.range(5, 12).segment(4))
    .scale("G5:major")
    .s("triangle")
    .lpf(perlin.range(1500, 3000).slow(8))
    .gain(perlin.range(0.03, 0.1))
    .pan(perlin.slow(3))
    .hpf(2000)
    .room(0.5)
    .mask("<0 0 1 1 1 1 1 1 0 0 0 0>".slow(12)),

  // === DONE CHIME - final phase ===
  n("[0, 4, 7, 11]")
    .scale("G4:major")
    .s("sine")
    .attack(0.5)
    .release(2)
    .room(0.8)
    .gain(0.3)
    .slow(16)
    .mask("<0 0 0 0 0 0 0 0 0 0 1 1>".slow(12))
)
