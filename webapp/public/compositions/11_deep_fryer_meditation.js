// DEEP FRYER MEDITATION
// Finding zen in the sizzle - oil bubbling, batter crisping, enlightenment at 375F
// Structure: Preheating -> First Batch -> Peak Sizzle -> Golden Brown -> Cooling Down

setcpm(82)

// Temperature and activity curves
let heat = sine.range(0.3, 1).slow(88)
let sizzle = perlin.range(0.5, 1).slow(48)

stack(
  // === THE ETERNAL SIZZLE - evolving texture ===
  s("hh*32")
    .speed(rand.range(0.8, 1.5))
    .gain(perlin.range(0.1, 0.25).mul(heat))
    .hpf(heat.range(2000, 5000))
    .pan(perlin.range(-0.5, 0.5).slow(4))
    .room(0.3)
    .fast(heat.range(0.7, 1.3)),

  // === BUBBLES RISING - frequency varies with heat ===
  s("<[bd:2 ~] [~ bd:2] [bd:2 bd:2] [~ ~]> <[~ bd:2] [bd:2 ~] [~ bd:2] [bd:2 ~]>".slow(2))
    .lpf(heat.range(300, 500))
    .gain(sizzle.range(0.35, 0.6))
    .room(0.4)
    .shape(0.1)
    .every(8, x => x.fast(2))
    .mask("<0 1 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === THE CALM CENTER - oil temperature drone ===
  n("[0, 4, 7]")
    .scale("Bb:major")
    .s("sine")
    .attack(heat.range(0.5, 1.5))
    .release(heat.range(1.5, 3))
    .lpf(heat.range(300, 500))
    .gain(0.4)
    .slow(4),

  // === TIMER COUNTDOWN - rhythmic meditation ===
  s("~ ~ ~ cp")
    .room(0.6)
    .gain(0.4)
    .every(4, x => x.fast(2))
    .sometimesBy(0.2, x => x.speed(1.5)),

  // === GOLDEN BROWN TRANSCENDENCE - melodic arc ===
  n("<0 2 4 5 7 9 11 12 11 9 7 5>".slow(12))
    .scale("Bb3:major")
    .s("triangle")
    .room(0.7)
    .gain(heat.range(0.2, 0.45))
    .delay(0.4)
    .delaytime(0.333)
    .delayfeedback(heat.range(0.3, 0.6))
    .lpf(heat.range(1000, 2000)),

  // === HEAT LAMP HUM - underlying presence ===
  n("0")
    .scale("Bb1:major")
    .s("triangle")
    .lpf(120)
    .gain(heat.range(0.2, 0.45))
    .slow(16),

  // === BATTER CRACKLE - appears during cooking phases ===
  n(irand(5).segment(6))
    .scale("Bb4:major")
    .s("square")
    .lpf(sizzle.range(600, 1200))
    .gain(0.2)
    .pan(rand)
    .crush(10)
    .room(0.4)
    .mask("<0 0 1 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === COOLING PHASE - gentle wind down ===
  n("<[0, 4] ~ ~ ~> <~ [2, 5] ~ ~> <~ ~ [4, 7] ~>".slow(4))
    .scale("Bb2:major")
    .s("sine")
    .attack(1)
    .release(3)
    .lpf(600)
    .room(0.8)
    .gain(0.25)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
