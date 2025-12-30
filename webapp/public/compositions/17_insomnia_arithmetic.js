// INSOMNIA ARITHMETIC
// 4AM brain doing unwanted math - racing thoughts, counting sheep that multiply
// Structure: Lying Down -> Counting -> Spiraling -> Almost Sleep -> Wide Awake

setcpm(147)

// Anxiety builds and releases
let anxiety = sine.range(0.2, 1).slow(80)
let exhaustion = perlin.range(0.5, 1).slow(64)

stack(
  // === RACING HEARTBEAT - varies with anxiety ===
  s("<bd [~ bd] bd ~> <bd ~ [bd bd] ~> <[bd bd] ~ bd bd>".slow(3))
    .gain(anxiety.range(0.5, 0.85))
    .lpf(anxiety.range(300, 700))
    .every(8, x => x.fast(2))
    .mask("<0 1 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === COUNTING - numbers spiraling faster ===
  n("<0 1> <2 3> <4 5> <6 7>".fast("<1 2 4 8 4 2 1 0.5>".slow(16)))
    .scale("C:minor")
    .s("square")
    .lpf(anxiety.range(500, 1200))
    .lpq(4)
    .gain(0.4)
    .pan(sine.fast(3))
    .crush(anxiety.range(16, 8)),

  // === THOUGHTS OVERLAPPING - builds complexity ===
  n("<[0 2 4] [2 4 7] [4 7 9] [7 9 11]> <[2 4 7] [4 7 9] [7 9 11] [9 11 14]>".slow(8))
    .scale("C3:minor")
    .s("triangle")
    .room(0.5)
    .delay(anxiety.range(0.2, 0.6))
    .delaytime(0.166)
    .delayfeedback(anxiety.range(0.4, 0.8))
    .gain(0.35)
    .every(4, x => x.rev()),

  // === CLOCK TICKING - relentless, varies tempo ===
  s("cp*4")
    .gain(anxiety.range(0.2, 0.45))
    .hpf(2000)
    .room(0.3)
    .fast(anxiety.range(0.8, 1.5)),

  // === WEIGHT OF TOMORROW - ominous bass ===
  n("<[0, 3]> <[0, 4]> <[-1, 3]> <[0, 3]>".slow(4))
    .scale("C1:minor")
    .s("sawtooth")
    .lpf(anxiety.range(150, 300))
    .gain(0.4)
    .slow(4),

  // === ALMOST SLEEP - brief relief moments ===
  n("<[0, 4, 7] ~ ~ ~> <~ [2, 5, 9] ~ ~> <~ ~ [4, 7, 11] ~>".slow(4))
    .scale("C3:major")
    .s("sine")
    .attack(0.5)
    .release(2)
    .room(0.8)
    .gain(exhaustion.range(0.15, 0.35))
    .slow(8)
    .degradeBy(anxiety.range(0.7, 0.3))
    .mask("<0 0 0 0 0 0 1 1 0 0 0 0>".slow(12)),

  // === ALARM DREAD - intensifies toward end ===
  s("~ ~ ~ ~ ~ ~ ~ hh:3")
    .speed(2)
    .gain(anxiety.range(0.2, 0.6))
    .hpf(4000)
    .slow("<8 4 4 2 2 4 4 8>".slow(16))
    .room(0.4),

  // === SHEEP MULTIPLYING - exponential chaos ===
  n(irand(7).segment(anxiety.range(4, 16)))
    .scale("C4:minor")
    .s("triangle")
    .lpf(1200)
    .gain(0.2)
    .pan(rand)
    .room(0.5)
    .mask("<0 0 0 1 1 1 1 1 0 0 0 0>".slow(12)),

  // === DAWN APPROACHING - final phase ===
  n("[0, 4, 7]")
    .scale("C3:major")
    .s("triangle")
    .attack(2)
    .release(4)
    .lpf(800)
    .room(0.8)
    .gain(0.25)
    .slow(16)
    .mask("<0 0 0 0 0 0 0 0 0 0 1 1>".slow(12))
)
