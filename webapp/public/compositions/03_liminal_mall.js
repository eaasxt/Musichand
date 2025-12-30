// LIMINAL MALL
// 3AM in an empty shopping center - escalators running for no one, muzak echoing
// Structure: Entering -> Deep Inside -> The Food Court -> Lost -> Finding Exit

setcpm(108)

// Deeper we go, stranger it gets
let depth = sine.range(0, 1).slow(96)
let unease = perlin.range(0.5, 1).slow(64)

stack(
  // === THE ETERNAL ESCALATOR - mechanical, hypnotic, sometimes glitches ===
  s("[~ hh:2] [hh:0 ~] [~ hh:1] [hh:2 hh:0]")
    .gain(0.35)
    .hpf(3000)
    .room(depth.range(0.5, 0.9))
    .size(depth.range(4, 12))
    .pan(0.3)
    .sometimesBy(depth.range(0, 0.3), x => x.speed(0.5))
    .every(16, x => x.rev()),

  // === MUZAK MELODY - increasingly distorted deeper in ===
  n("<[0 2 4] [4 2 0] [2 4 7] [7 4 2]> <[0 4 7] [7 4 0] [4 7 9] [9 7 4]>".slow(2))
    .scale("G:major")
    .s("triangle")
    .room(0.8)
    .gain(0.4)
    .lpf(sine.range(1500, 3500).slow(32))
    .delay(depth.range(0.2, 0.5))
    .delaytime(0.5)
    .delayfeedback(depth.range(0.3, 0.7))
    .degradeBy(depth.range(0.05, 0.3))
    .coarse(depth.range(0, 8)),

  // === FLUORESCENT HUM - 60hz drone, flickers more as we go deeper ===
  n("[0, 7]")
    .scale("G1:major")
    .s("triangle")
    .gain(sine.range(0.15, 0.25).fast(depth.range(2, 15)))
    .lpf(200)
    .slow(16),

  // === DISTANT FOOTSTEPS - more frequent, from where? ===
  s("~ ~ ~ ~ ~ ~ cp ~")
    .room(0.9)
    .size(15)
    .gain(depth.range(0.15, 0.4))
    .hpf(400)
    .slow("<4 4 2 2 2 1 1 2>".slow(16))
    .pan(perlin.range(-0.8, 0.8).slow(4)),

  // === FOUNTAIN - always there, changes character ===
  s("hh:3*16")
    .gain(perlin.range(0.05, 0.15))
    .hpf(8000)
    .pan(perlin.range(-1, 1).slow(5))
    .room(0.6)
    .mask("<1 1 1 1 1 1 0 0 1 1 1 1>".slow(12)),

  // === BASS OF EMPTINESS - grows more present ===
  n("<0 ~ ~ 0 ~ ~ ~ 0> <0 ~ 0 ~ ~ 0 ~ ~>".slow(2))
    .scale("G1:major")
    .s("sine")
    .lpf(100)
    .gain(depth.range(0.3, 0.6))
    .slow(2),

  // === GHOST ANNOUNCEMENTS - fragments of PA system ===
  n(perlin.range(0, 7).segment(3))
    .scale("G4:major")
    .s("square")
    .lpf(1200)
    .gain(0.15)
    .room(0.95)
    .delay(0.6)
    .delaytime(0.333)
    .delayfeedback(0.6)
    .slow(4)
    .degradeBy(0.6)
    .mask("<0 0 0 0 1 1 1 1 1 1 0 0>".slow(12)),

  // === SECURITY CAMERA PAN - subtle sweep ===
  n("7")
    .scale("G5:major")
    .s("sine")
    .gain(0.08)
    .pan(saw.slow(8))
    .room(0.5)
    .slow(16)
    .mask("<0 0 0 0 0 1 1 1 1 1 1 1>".slow(12))
)
