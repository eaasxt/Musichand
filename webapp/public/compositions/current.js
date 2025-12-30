// Basic 4-bar beat pattern
// BPM: 120, Time: 4/4

// Set tempo
setcps(120/60/4)

// All patterns stacked together
stack(
  // Kick drum - euclidean variation
  s("bd(5,8)").gain(0.9),

  // Snare - backbeat
  s("~ sd ~ sd").gain(0.75).room(0.15),

  // Hi-hats - euclidean rhythm
  s("hh(7,8)").gain(0.5).pan(sine.range(0.4, 0.6).slow(4)),

  // Bass line - A minor
  n("0 ~ 0 3, ~ 5 ~ ~")
    .scale("A1:minor")
    .sound("sawtooth")
    .lpf(350)
    .gain(0.6),

  // Lead arpeggio - A minor
  n("0 2 4 7")
    .scale("A4:minor")
    .sound("triangle")
    .lpf(2000)
    .room(0.4)
    .delay(0.3)
    .gain(0.35)
)
