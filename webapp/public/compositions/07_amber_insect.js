// AMBER INSECT
// Frozen in tree resin for 40 million years - suspended, golden, eternal

setcpm(42)

stack(
  // The last wingbeat, crystallized forever
  n("[0, 4, 7] ~ ~ [0, 3, 7] ~ ~ ~ ~")
    .scale("A:lydian")
    .s("gm_pad_warm")
    .attack(2)
    .release(4)
    .room(0.95)
    .size(20)
    .lpf(800)
    .gain(0.4),

  // Resin slowly engulfing
  n("0 ~ 2 ~ ~ 4 ~ ~")
    .scale("A2:lydian")
    .s("sine")
    .lpf(sine.range(200, 600).slow(24))
    .gain(0.5)
    .room(0.8)
    .slow(2),

  // Light refracting through golden prison
  n(perlin.range(4, 11).segment(3))
    .scale("A5:lydian")
    .s("triangle")
    .gain(perlin.range(0.1, 0.25))
    .pan(perlin.slow(7))
    .room(0.9)
    .delay(0.6)
    .delaytime(0.5)
    .delayfeedback(0.7)
    .hpf(2000)
    .slow(3),

  // Heartbeat that stopped mid-beat
  s("bd:1 ~ ~ ~ ~ ~ ~ ~")
    .lpf(150)
    .room(0.7)
    .gain(0.35)
    .slow(4),

  // Microscopic air bubbles
  s("hh:2?")
    .speed(0.5)
    .gain(0.1)
    .hpf(8000)
    .room(0.9)
    .pan(rand)
    .slow(0.25)
)
