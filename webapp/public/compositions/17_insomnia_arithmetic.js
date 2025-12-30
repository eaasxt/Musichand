// INSOMNIA ARITHMETIC
// 4AM brain doing unwanted math - racing thoughts, counting sheep that multiply

setcpm(147)

stack(
  // Racing heartbeat - anxiety tempo
  s("bd [~ bd?] bd ~")
    .gain(0.7)
    .lpf(500),

  // Counting - numbers spiraling
  n("<0 1> <2 3> <4 5> <6 7>".fast("<1 2 4 2>".slow(8)))
    .scale("C:minor")
    .s("square")
    .lpf(800)
    .lpq(4)
    .gain(0.4)
    .pan(sine.fast(3)),

  // Thoughts overlapping
  n("[0 2 4] [2 4 7] [4 7 9] [7 9 11]".slow(4))
    .scale("C3:minor")
    .s("triangle")
    .room(0.5)
    .delay(0.4)
    .delaytime(0.166)
    .delayfeedback(0.6)
    .gain(0.35),

  // Clock ticking - relentless
  s("rim*4")
    .gain(0.3)
    .hpf(2000)
    .room(0.3),

  // The weight of tomorrow
  n("[0, 3]")
    .scale("C1:minor")
    .s("sawtooth")
    .lpf(200)
    .gain(0.4)
    .slow(4),

  // Brief moments of almost-sleep
  n("<[0, 4, 7] ~ ~ ~>")
    .scale("C3:major")
    .s("gm_pad_warm")
    .attack(0.5)
    .release(2)
    .room(0.8)
    .gain(0.25)
    .slow(8)
    .degradeBy(0.5),

  // Alarm clock dread
  s("~ ~ ~ ~ ~ ~ ~ hh:3?")
    .speed(2)
    .gain(0.5)
    .hpf(4000)
    .slow(4)
)
