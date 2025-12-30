// Basic 4-bar beat pattern
// BPM: 120, Time: 4/4
// Task: Musicman-glm

// Set tempo (120 BPM = 2 cycles per second at 4 beats per cycle)
setcps(120/60/4)

// Kick drum - 4 on the floor with euclidean variation
$: s("bd(5,8)")
  .gain(0.9)
  .bank("RolandTR909")

// Snare - backbeat with ghost notes
$: s("~ sd ~ [sd:2 sd]")
  .gain(0.75)
  .bank("RolandTR909")
  .room(0.15)

// Hi-hats - euclidean rhythm with open hat accents
$: s("hh(7,8), ~ ~ ~ oh")
  .gain(0.5)
  .bank("RolandTR909")
  .pan(sine.range(0.4, 0.6).slow(4))

// Ride for texture - sparse euclidean
$: s("ride(3,8)")
  .gain(0.3)
  .bank("RolandTR909")
  .every(4, x => x.fast(2))

// Bass line - complementary rhythm in A minor
// Task: Musicman-4zz
$: n("0 ~ 0 [3 5], ~ 7 ~ ~")
  .scale("A1:minor")
  .sound("sawtooth")
  .lpf(350)
  .lpq(2)
  .gain(0.6)
  .decay(0.2)
  .sustain(0.3)

// Lead melody/arpeggio - A minor, spacey
// Task: Musicman-j63
$: n("<0 2 4 7> <4 5 7 9>")
  .scale("A4:minor")
  .sound("triangle")
  .lpf(2000)
  .room(0.5)
  .size(3)
  .delay(0.4)
  .delaytime(0.375)
  .delayfeedback(0.4)
  .gain(0.35)
  .sometimes(x => x.fast(2))
