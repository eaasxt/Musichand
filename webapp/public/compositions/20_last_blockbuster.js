// LAST BLOCKBUSTER
// Nostalgia for a dying format - VHS hum, carpet smell, the weight of choosing
// Structure: Entering -> Browsing Aisles -> Finding Movie -> Checkout -> Closing Time

setcpm(95)

// Nostalgia and time running out
let nostalgia = sine.range(0.3, 1).slow(96)
let closing = saw.range(0, 1).slow(112)

stack(
  // === VHS TRACKING - warped and warm, more degraded over time ===
  n("<[0 2 4] [2 4 7]> <[4 7 9] [7 9 11]> <[2 4 7] [4 7 9]> <[0 4 7] [2 5 9]>".slow(4))
    .scale("A:mixolydian")
    .s("sawtooth")
    .lpf(sine.range(600, 1800).slow(6))
    .lpq(4)
    .gain(0.45)
    .room(0.4)
    .coarse(closing.range(4, 12))
    .crush(closing.range(12, 6)),

  // === WALKING THE AISLES - footsteps with purpose ===
  s("<bd ~ [~ bd] ~> <bd ~ bd [~ bd]> <[bd bd] ~ ~ bd>".slow(3))
    .lpf(400)
    .gain(nostalgia.range(0.4, 0.65))
    .room(0.5)
    .every(8, x => x.fast(2)),

  // === REWINDING MEMORIES - speed changes ===
  s("hh*8")
    .speed(saw.range(0.5, 2).slow(8))
    .gain(nostalgia.range(0.2, 0.4))
    .hpf(2000)
    .pan(sine.slow(4)),

  // === LATE FEES BASS - the dread, intensifies ===
  n("<0 ~ ~ 0 ~ 0 ~ ~> <0 ~ 0 ~ ~ 0 ~ ~> <~ 0 ~ ~ 0 ~ 0 ~>".slow(3))
    .scale("A1:mixolydian")
    .s("triangle")
    .lpf(closing.range(250, 400))
    .gain(0.5),

  // === POPCORN MELODY - happy memories ===
  n(perlin.range(0, 7).segment(6))
    .scale("A4:mixolydian")
    .s("triangle")
    .gain(nostalgia.range(0.2, 0.4))
    .room(0.6)
    .delay(0.3)
    .delaytime(0.25)
    .delayfeedback(nostalgia.range(0.3, 0.6)),

  // === STATIC BETWEEN CHANNELS - increases ===
  s("hh*4")
    .speed(0.3)
    .lpf(3000)
    .hpf(1000)
    .gain(closing.range(0.08, 0.25))
    .room(0.3)
    .degradeBy(closing.range(0.8, 0.4)),

  // === CLOSING TIME ANNOUNCEMENT - emerges late ===
  n("[0, 4, 7]")
    .scale("A2:major")
    .s("triangle")
    .attack(1)
    .release(3)
    .lpf(1200)
    .room(0.8)
    .gain(closing.range(0.1, 0.4))
    .slow("<16 8 8 4 4 8 8 16>".slow(16)),

  // === MOVIE FOUND - moment of joy ===
  n("[0, 4, 7, 11]")
    .scale("A3:major")
    .s("sine")
    .attack(0.3)
    .release(1.5)
    .room(0.7)
    .gain(0.3)
    .slow(8)
    .mask("<0 0 0 0 1 1 1 0 0 0 0 0>".slow(12)),

  // === LIGHTS GOING OUT - final phase ===
  n("<[0, 4] ~ ~ ~> <~ ~ [2, 5] ~>".slow(4))
    .scale("A2:minor")
    .s("triangle")
    .lpf(closing.range(800, 400))
    .attack(1)
    .release(3)
    .room(0.9)
    .gain(closing.range(0.15, 0.35))
    .mask("<0 0 0 0 0 0 0 0 0 0 1 1>".slow(12))
)
