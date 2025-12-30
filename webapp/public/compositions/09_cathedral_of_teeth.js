// CATHEDRAL OF TEETH
// A church built from molars - grotesque beauty, enamel acoustics, dentin prayers
// Structure: Approach -> Nave -> Altar -> Crypt -> Benediction

setcpm(72)

// Sacred atmosphere builds
let sacred = sine.range(0.3, 1).slow(104)
let echo = perlin.range(0.5, 1).slow(64)

stack(
  // === ENAMEL BELLS - evolving chord progressions ===
  n("<[0 4 7] [2 5 9] [4 7 11] [0 4 7]> <[2 5 9] [4 7 11] [5 9 12] [2 5 9]> <[0 3 7] [2 5 9] [4 7 10] [0 4 7]>".slow(3))
    .scale("D:mixolydian")
    .s("sine")
    .room(echo.range(0.8, 0.98))
    .size(echo.range(8, 20))
    .gain(sacred.range(0.3, 0.6))
    .slow(2)
    .attack(0.3)
    .release(1.5),

  // === GRINDING MEDITATION - ritual sounds ===
  s("[hh:3 ~] [~ hh:3] [hh:3 hh:3] ~")
    .speed(0.7)
    .crush(echo.range(8, 14))
    .room(0.6)
    .gain(0.35)
    .hpf(1000)
    .every(8, x => x.rev())
    .sometimesBy(0.2, x => x.fast(2)),

  // === ROOT CANAL DRONE - deep nerve pain ===
  n("[0, -12]")
    .scale("D1:mixolydian")
    .s("sawtooth")
    .lpf(sacred.range(150, 250))
    .lpq(8)
    .gain(sacred.range(0.25, 0.5))
    .slow(8)
    .room(0.7),

  // === CHOIR OF EXTRACTED WISDOM - melodic prayer ===
  n("<0 2 4 5 7 5 4 2> <2 4 5 7 9 7 5 4> <0 2 4 7 9 7 4 2>".slow(3))
    .scale("D3:mixolydian")
    .s("triangle")
    .attack(sacred.range(0.5, 1.2))
    .release(sacred.range(1.5, 3))
    .lpf(sacred.range(1200, 2000))
    .room(0.85)
    .gain(0.35)
    .slow(1.5)
    .delay(0.3)
    .delaytime(0.25)
    .delayfeedback(0.4),

  // === CLICKING JAW BONES - skeletal percussion ===
  s("<cp ~ cp ~ ~ cp ~ cp> <~ cp ~ cp cp ~ ~ cp>".slow(2))
    .room(0.7)
    .gain(sacred.range(0.25, 0.5))
    .hpf(800)
    .every(4, x => x.speed(1.5)),

  // === SALIVA DRIP - occasional texture ===
  s("~ ~ ~ ~ ~ ~ ~ hh:1")
    .speed(0.5)
    .room(0.9)
    .gain(0.2)
    .slow("<4 2 2 4 2 2 4 4>".slow(16)),

  // === INCENSE SMOKE - high ethereal layer ===
  n(perlin.range(7, 14).segment(3))
    .scale("D5:mixolydian")
    .s("sine")
    .lpf(perlin.range(1000, 2500).slow(12))
    .gain(perlin.range(0.05, 0.15))
    .pan(perlin.slow(8))
    .room(0.95)
    .delay(0.6)
    .delaytime(0.5)
    .delayfeedback(0.7)
    .slow(2)
    .mask("<0 0 0 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === FINAL BLESSING - emerges at end ===
  n("[0, 4, 7, 11]")
    .scale("D2:major")
    .s("triangle")
    .attack(2)
    .release(4)
    .lpf(800)
    .room(0.98)
    .size(25)
    .gain(0.3)
    .slow(16)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
