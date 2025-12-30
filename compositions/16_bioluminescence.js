// BIOLUMINESCENCE
// Deep ocean creatures creating their own light - alien, beautiful, ancient

setcpm(58)

stack(
  // Anglerfish lure - hypnotic pulse
  n("<[0 ~] [~ 4] [7 ~] [~ 4]>")
    .scale("Ab:lydian")
    .s("sine")
    .lpf(1200)
    .gain(sine.range(0.2, 0.5).slow(3))
    .room(0.8)
    .pan(sine.range(-0.5, 0.5).slow(5)),

  // Jellyfish swarm - drifting harmonies
  n("[0, 4, 7, 11] ~ ~ [2, 5, 9, 12]")
    .scale("Ab2:lydian")
    .s("triangle")
    .attack(1.5)
    .release(3)
    .lpf(600)
    .room(0.9)
    .size(15)
    .gain(0.35)
    .slow(4),

  // Plankton sparks - random points of light
  n(irand(12).segment(16))
    .scale("Ab5:lydian")
    .s("sine")
    .gain(rand.range(0, 0.25))
    .pan(rand)
    .room(0.7)
    .hpf(2000)
    .sometimesBy(0.3, x => x.gain(0.4)),

  // Pressure of the deep
  n("0")
    .scale("Ab0:lydian")
    .s("sine")
    .lpf(50)
    .gain(0.5)
    .slow(16),

  // Whale song passing through
  n("<0 ~ 4 ~ ~ 7 ~ ~>")
    .scale("Ab1:lydian")
    .s("sawtooth")
    .lpf(sine.range(100, 300).slow(8))
    .gain(0.3)
    .room(0.95)
    .slow(4),

  // Current movement
  s("hh:2*4")
    .speed(0.3)
    .gain(perlin.range(0.05, 0.15))
    .pan(perlin.slow(7))
    .hpf(1000)
    .room(0.6)
)
