// GRAVITATIONAL LENSING
// The sound of light bending around a black hole - time dilates, frequencies warp
// Structure: Approach (0-32) -> Event Horizon (32-64) -> Singularity (64-96) -> Spaghettification (96-128)

setcpm(67)

// Master intensity curve - builds over entire track
let intensity = sine.range(0, 1).slow(128)

stack(
  // === THE EVENT HORIZON - impossibly slow bass that feels like being stretched ===
  n("<0 . . . -5 . . 0> <0 . -3 . . . . 0> <-5 . . 0 . . -7 .> <0 . . . . . . -5>".slow(4))
    .scale("F:locrian")
    .s("sawtooth")
    .lpf(sine.range(80, 400).slow(32))
    .lpq(sine.range(8, 20).slow(48))
    .gain(0.7)
    .room(0.9)
    .size(sine.range(8, 20).slow(64))
    .slow(2)
    .mask("<1 1 1 1 1 1 1 1 0.8 0.9 1 1 1 1 0.7 1>".slow(8)),

  // === PHOTONS SPIRALING - acceleration toward the center ===
  n("<0 2 4> <1 3 5> <2 4 6> <0 3 7>")
    .scale("F3:locrian")
    .s("triangle")
    .fast("<1 1 1.5 1.5 2 2 3 2 1.5 1 2 3 4 3 2 1>".slow(64))
    .pan(sine.slow(3))
    .delay(sine.range(0.3, 0.7).slow(32))
    .delaytime(sine.range(0.2, 0.5).slow(24))
    .delayfeedback(sine.range(0.5, 0.85).slow(40))
    .lpf(sine.range(1200, 3500).slow(48))
    .gain(intensity.range(0.2, 0.5))
    .every(8, x => x.rev())
    .every(16, x => x.fast(2))
    .mask("<0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1>".slow(8)),

  // === HAWKING RADIATION - quantum sparks escaping ===
  n(perlin.range(0, 11).segment(32))
    .scale("F5:chromatic")
    .s("sine")
    .gain(perlin.range(0, 0.35))
    .pan(rand)
    .room(0.8)
    .hpf(sine.range(1500, 4000).slow(32))
    .sometimesBy(0.3, x => x.fast(2))
    .sometimesBy(0.2, x => x.delay(0.5).delaytime(0.25))
    .mask("<0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1>".slow(8)),

  // === GRAVITATIONAL WAVES - fabric of spacetime ===
  s("bd:3")
    .lpf(sine.range(150, 300).slow(64))
    .slow("<8 8 4 4 4 2 2 1>".slow(64))
    .room(0.95)
    .size(sine.range(12, 30).slow(48))
    .gain(sine.range(0.3, 0.6).slow(32))
    .shape(sine.range(0.2, 0.5).slow(40)),

  // === TIDAL FORCES - stretching sounds ===
  n("<[0, 7] ~ ~ ~> <~ [0, 7] ~ ~> <~ ~ [0, 7] ~> <~ ~ ~ [0, 7]>".slow(4))
    .scale("F2:locrian")
    .s("sawtooth")
    .attack(sine.range(0.5, 2).slow(32))
    .release(sine.range(1, 4).slow(24))
    .lpf(300)
    .room(0.9)
    .gain(intensity.range(0, 0.4))
    .mask("<0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1>".slow(8)),

  // === SPAGHETTIFICATION TEXTURE - final phase ===
  n(perlin.range(-7, 7).segment(3))
    .scale("F3:locrian")
    .s("triangle")
    .lpf(perlin.range(200, 1200).slow(16))
    .gain(perlin.range(0.05, 0.2))
    .pan(perlin.slow(7))
    .room(0.95)
    .delay(0.6)
    .delaytime(perlin.range(0.3, 0.8).slow(8))
    .delayfeedback(0.7)
    .slow(2)
    .mask("<0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1>".slow(8))
)
