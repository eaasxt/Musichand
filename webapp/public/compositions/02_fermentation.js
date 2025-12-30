// FERMENTATION
// Yeast consuming sugar, CO2 bubbling up, alcohol emerging - biological rhythms
// Structure: Inoculation -> Primary Ferment -> Peak Activity -> Slow Decline -> Maturation

setcpm(93)

// Fermentation activity curve - rises and falls like real fermentation
let activity = sine.range(0.2, 1).slow(96)
let phase = saw.slow(128)

stack(
  // === THE BUBBLES - irregular, organic, alive - density follows fermentation curve ===
  s("<[hh ~] [~ hh] [hh ~] [~ hh]> <[~ hh] [hh ~] [~ hh] [hh hh]>")
    .speed(rand.range(0.8, 1.3))
    .room(0.4)
    .pan(perlin.range(-0.6, 0.6))
    .gain(activity.range(0.2, 0.55))
    .fast(activity.range(0.5, 2))
    .hpf(activity.range(2000, 6000)),

  // === THE SLOW CHURN - harmonic transformation ===
  n("<[0, 4, 7] . [2, 5, 9] . . [-1, 3, 7] . .> <[0, 4, 7] [2, 5, 9] . [-1, 3, 7] . . . .>".slow(2))
    .scale("Eb:dorian")
    .s("triangle")
    .slow(2)
    .lpf(sine.range(600, 1800).slow(11))
    .room(0.6)
    .gain(0.5)
    .every(8, x => x.add(note(2)))
    .every(16, x => x.rev()),

  // === MICROBIAL MULTIPLICATION - exponential then crash ===
  s("hh*<1 2 4 8 16 32 16 8 4 2 1 1>".slow(12))
    .gain("<0.15 0.2 0.25 0.35 0.45 0.5 0.45 0.35 0.25 0.2 0.15 0.1>".slow(12))
    .hpf(6000)
    .pan(sine.fast(3))
    .room(0.3)
    .mask("<0 0 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === THE WARMTH - deep drone that builds ===
  n("0")
    .scale("Eb1:dorian")
    .s("sine")
    .gain(activity.range(0.2, 0.5))
    .lpf(activity.range(80, 180))
    .slow(8),

  // === WILD YEAST - unpredictable melodic spores ===
  n(irand(5).segment(7))
    .scale("Eb4:dorian")
    .s("square")
    .lpf(activity.range(500, 1200))
    .lpq(8)
    .gain(0.25)
    .fast(1.5)
    .sometimes(x => x.rev())
    .delay(0.4)
    .delaytime(0.166)
    .delayfeedback(activity.range(0.3, 0.7))
    .mask("<0 0 0 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === ALCOHOL EMERGING - new harmonic layer in later phases ===
  n("<0 ~ 4 ~> <2 ~ 5 ~> <4 ~ 7 ~> <0 ~ 4 ~>".slow(4))
    .scale("Eb3:dorian")
    .s("sawtooth")
    .lpf(sine.range(300, 800).slow(16))
    .gain(0.3)
    .room(0.5)
    .attack(0.3)
    .release(1)
    .mask("<0 0 0 0 0 0 1 1 1 1 1 1>".slow(12)),

  // === CO2 RELEASE - percussive exhale ===
  s("~ ~ ~ bd:2")
    .lpf(300)
    .gain(activity.range(0.2, 0.5))
    .room(0.6)
    .slow(2)
    .sometimesBy(0.3, x => x.fast(2))
)
