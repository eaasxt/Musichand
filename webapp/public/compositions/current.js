// Musicman Demo Composition
// A minor, 120 BPM - Lo-fi chill beat

setcpm(120)

stack(
  // Drums - laid back groove
  s("bd ~ [~ bd] ~, ~ sd ~ sd, [hh hh] [hh oh]")
    .bank("RolandTR808")
    .gain(0.85),

  // Bass - simple A minor pattern
  n("0 ~ 3 ~, ~ 5 ~ 7")
    .scale("A2:minor")
    .s("sawtooth")
    .lpf(500)
    .gain(0.7),

  // Chords - Am F C G progression
  chord("<Am F C G>")
    .voicing()
    .s("gm_epiano1")
    .room(0.4)
    .lpf(2000)
    .gain(0.5)
    .slow(2),

  // Sparkle - pentatonic melody
  n("0 4 7 11, ~ 2 ~ 9")
    .scale("A4:minor")
    .s("gm_celesta")
    .delay(0.3)
    .delaytime(0.375)
    .room(0.6)
    .gain(0.3)
)
