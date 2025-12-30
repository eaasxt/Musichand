// BIOLUMINESCENCE
// Deep ocean creatures creating their own light - alien, beautiful, ancient
// Structure: Surface -> Twilight Zone -> Midnight Zone -> Abyssal Plain -> Rising

setcpm(58)

// Depth and light dynamics
let depth = sine.range(0, 1).slow(112)
let glow = perlin.range(0.4, 1).slow(72)

stack(
  // === ANGLERFISH LURE - hypnotic pulse, varies with depth ===
  n("<[0 ~] [~ 4] [7 ~] [~ 4]> <[~ 0] [4 ~] [~ 7] [4 ~]> <[0 4] ~ [7 4] ~>".slow(3))
    .scale("Ab:lydian")
    .s("sine")
    .lpf(depth.range(800, 1600))
    .gain(sine.range(0.2, 0.5).slow(3))
    .room(0.8)
    .pan(sine.range(-0.5, 0.5).slow(5))
    .every(8, x => x.add(note(2))),

  // === JELLYFISH SWARM - drifting harmonies, builds ===
  n("<[0, 4, 7, 11] ~ ~ [2, 5, 9, 12]> <[2, 5, 9, 12] ~ [0, 4, 7, 11] ~> <~ [0, 4, 7, 11] ~ [2, 5, 9, 12]>".slow(3))
    .scale("Ab2:lydian")
    .s("triangle")
    .attack(depth.range(1, 2.5))
    .release(depth.range(2, 5))
    .lpf(depth.range(400, 800))
    .room(0.9)
    .size(depth.range(10, 25))
    .gain(glow.range(0.25, 0.45))
    .slow(4),

  // === PLANKTON SPARKS - density increases with depth ===
  n(irand(12).segment(depth.range(8, 24)))
    .scale("Ab5:lydian")
    .s("sine")
    .gain(rand.range(0, 0.25).mul(glow))
    .pan(rand)
    .room(0.7)
    .hpf(2000)
    .sometimesBy(glow, x => x.gain(0.4)),

  // === PRESSURE OF THE DEEP - builds with descent ===
  n("0")
    .scale("Ab0:lydian")
    .s("sine")
    .lpf(depth.range(30, 70))
    .gain(depth.range(0.3, 0.6))
    .slow(16),

  // === WHALE SONG - passing through, more present at depth ===
  n("<0 ~ 4 ~ ~ 7 ~ ~> <~ 0 ~ 4 ~ ~ 7 ~> <4 ~ ~ 0 ~ 7 ~ ~>".slow(3))
    .scale("Ab1:lydian")
    .s("sawtooth")
    .lpf(sine.range(100, 300).slow(8))
    .gain(depth.range(0.15, 0.4))
    .room(0.95)
    .slow(4)
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === CURRENT MOVEMENT - varies with zone ===
  s("hh:2*4")
    .speed(0.3)
    .gain(perlin.range(0.05, 0.15).mul(glow))
    .pan(perlin.slow(7))
    .hpf(1000)
    .room(0.6)
    .fast(depth.range(0.7, 1.3)),

  // === BIOLUMINESCENT FLASH - sudden bursts ===
  n("[0, 4, 7, 11]")
    .scale("Ab4:lydian")
    .s("sine")
    .attack(0.01)
    .release(1)
    .lpf(2000)
    .gain(0.3)
    .room(0.8)
    .slow(16)
    .sometimesBy(0.4, x => x.fast(2))
    .mask("<0 0 0 0 1 1 1 1 1 0 0 0>".slow(12)),

  // === RISING TO SURFACE - late phase hope ===
  n(perlin.range(7, 14).segment(3))
    .scale("Ab3:lydian")
    .s("triangle")
    .lpf(perlin.range(800, 1800).slow(12))
    .gain(perlin.range(0.1, 0.25))
    .room(0.7)
    .delay(0.5)
    .delaytime(0.4)
    .delayfeedback(0.6)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
