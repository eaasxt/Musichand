// KUDZU TAKEOVER
// Invasive vine consuming everything - unstoppable growth, green suffocation

setcpm(98)

stack(
  // Tendrils reaching - constantly expanding
  n("<0 2 4 5> <2 4 5 7> <4 5 7 9> <5 7 9 11>".slow(8))
    .scale("F:lydian")
    .s("sawtooth")
    .lpf(saw.range(300, 1500).slow(16))
    .lpq(4)
    .gain(0.45)
    .room(0.5),

  // Ground being covered
  s("bd ~ bd [bd bd]")
    .lpf(300)
    .gain(0.7),

  // Leaves unfurling - delicate but relentless
  n(perlin.range(0, 7).segment(12))
    .scale("F4:lydian")
    .s("triangle")
    .gain(perlin.range(0.15, 0.35))
    .pan(perlin.range(-0.8, 0.8).slow(3))
    .room(0.6)
    .delay(0.3)
    .delaytime(0.25)
    .delayfeedback(0.5),

  // Strangled structures underneath
  n("~ 0 ~ ~ 0 ~ ~ 0")
    .scale("F1:lydian")
    .s("sine")
    .lpf(150)
    .gain(0.5)
    .slow(2),

  // Insects riding the wave
  s("hh*<4 8 16 8>".slow(4))
    .speed(rand.range(1, 2))
    .gain(0.25)
    .hpf(4000)
    .pan(sine.fast(5)),

  // The creak of collapsing buildings
  s("~ ~ ~ ~ ~ ~ ~ bd:3?")
    .lpf(800)
    .hpf(200)
    .gain(0.3)
    .room(0.8)
    .slow(2)
)
