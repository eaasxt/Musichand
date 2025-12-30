// AMBER INSECT
// Frozen in tree resin for 40 million years - suspended, golden, eternal
// Structure: Discovery -> Examination -> Deep Focus -> Time Dilation -> Eternal Moment

setcpm(42)

// Time stretching effect - slower and slower
let timeDilation = sine.range(0.5, 1).slow(144)
let golden = perlin.range(0.6, 1).slow(96)

stack(
  // === THE LAST WINGBEAT - crystallized forever, subtle variations ===
  n("<[0, 4, 7] ~ ~ [0, 3, 7] ~ ~ ~ ~> <[0, 4, 7] ~ [0, 3, 7] ~ ~ ~ ~ ~> <~ [0, 4, 7] ~ ~ [0, 3, 7] ~ ~ ~>".slow(3))
    .scale("A:lydian")
    .s("sawtooth")
    .attack(timeDilation.range(1.5, 3))
    .release(timeDilation.range(3, 6))
    .room(0.95)
    .size(timeDilation.range(15, 30))
    .lpf(golden.range(600, 1000))
    .gain(0.4)
    .lpq(3),

  // === RESIN SLOWLY ENGULFING - getting thicker ===
  n("<0 ~ 2 ~ ~ 4 ~ ~> <0 ~ ~ 2 ~ ~ 4 ~> <~ 0 ~ ~ 2 ~ ~ 4>".slow(3))
    .scale("A2:lydian")
    .s("sine")
    .lpf(sine.range(200, 600).slow(24))
    .gain(golden.range(0.3, 0.6))
    .room(0.8)
    .slow(2),

  // === LIGHT REFRACTING - through golden prison ===
  n(perlin.range(4, 11).segment(3))
    .scale("A5:lydian")
    .s("triangle")
    .gain(perlin.range(0.1, 0.25))
    .pan(perlin.slow(7))
    .room(0.9)
    .delay(timeDilation.range(0.4, 0.8))
    .delaytime(0.5)
    .delayfeedback(0.7)
    .hpf(2000)
    .slow(3)
    .mask("<0 0 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === HEARTBEAT THAT STOPPED - mid-beat, echoing through time ===
  s("bd:1 ~ ~ ~ ~ ~ ~ ~")
    .lpf(150)
    .room(timeDilation.range(0.6, 0.9))
    .gain(0.35)
    .slow("<4 4 6 8 8 8 6 4>".slow(16)),

  // === MICROSCOPIC AIR BUBBLES - trapped forever ===
  s("hh:2")
    .speed(0.5)
    .gain(0.1)
    .hpf(8000)
    .room(0.9)
    .pan(rand)
    .degradeBy(0.7)
    .slow(0.25),

  // === ANCIENT AMBER HARMONICS - deep resonance ===
  n("[0, 7, 11]")
    .scale("A1:lydian")
    .s("triangle")
    .lpf(200)
    .attack(2)
    .release(4)
    .room(0.95)
    .size(20)
    .gain(golden.range(0.15, 0.35))
    .slow(8)
    .mask("<0 0 0 0 1 1 1 1 1 1 1 1>".slow(12)),

  // === TIME ECHO - fragments of ancient sounds ===
  n(perlin.range(0, 7).segment(2))
    .scale("A3:lydian")
    .s("sine")
    .lpf(perlin.range(300, 900).slow(16))
    .gain(perlin.range(0.03, 0.12))
    .pan(perlin.slow(11))
    .room(0.98)
    .delay(0.8)
    .delaytime(0.666)
    .delayfeedback(0.85)
    .slow(4)
    .mask("<0 0 0 0 0 0 0 1 1 1 1 1>".slow(12))
)
