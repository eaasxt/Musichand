// FERMENTATION
// Yeast consuming sugar, CO2 bubbling up, alcohol emerging - biological rhythms

setcpm(93)

stack(
  // The bubbles - irregular, organic, alive
  s("<[hh ~] [~ hh?] [hh? ~] [~ hh]> <[~ hh] [hh? ~] [~ hh] [hh hh?]>")
    .speed(rand.range(0.8, 1.3))
    .room(0.4)
    .pan(perlin.range(-0.6, 0.6))
    .gain(0.5),

  // The slow churn of transformation
  n("[0, 4, 7] . [2, 5, 9] . . [-1, 3, 7] . .")
    .scale("Eb:dorian")
    .s("triangle")
    .slow(2)
    .lpf(sine.range(600, 1800).slow(11))
    .room(0.6)
    .gain(0.5),

  // Microbial multiplication - exponential growth pattern
  s("hh*<1 2 4 8 16 8 4 2>".slow(8))
    .gain("<0.2 0.25 0.3 0.4 0.5 0.4 0.3 0.2>".slow(8))
    .hpf(6000)
    .pan(sine.fast(3)),

  // The warmth of the reaction
  n("0")
    .scale("Eb1:dorian")
    .s("sine")
    .gain(0.4)
    .lpf(120)
    .slow(8),

  // Wild yeast - unpredictable melodic spores
  n(irand(5).segment(7))
    .scale("Eb4:dorian")
    .s("square")
    .lpf(800)
    .lpq(8)
    .gain(0.25)
    .fast(1.5)
    .sometimes(x => x.rev())
    .delay(0.4)
    .delaytime(0.166)
    .delayfeedback(0.5)
)
