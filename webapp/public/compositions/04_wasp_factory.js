// WASP FACTORY
// Industrial aggression meets insectoid precision - angry, mechanical, swarming
// Structure: Single Wasp -> Swarm Building -> Full Attack -> Retreat -> Silence

setcpm(144)

// Swarm density builds then recedes
let swarm = sine.range(0, 1).slow(80)
let aggression = saw.range(0.3, 1).slow(64)

stack(
  // === THE SWARM - density follows swarm curve ===
  s("[hh hh hh hh hh hh]*4")
    .speed(saw.range(1, 2.5).fast(0.5))
    .gain(swarm.range(0.3, 1).mul("1 0.6 0.8 0.5 0.9 0.7".fast(6)))
    .pan(sine.fast(7))
    .hpf(4000)
    .room(0.2)
    .fast(swarm.range(0.5, 1.5)),

  // === INDUSTRIAL PUNCH - enters after intro, intensifies ===
  s("<bd:4 [~ bd:4] bd:4 bd:4> <bd:4 bd:4 [bd:4 bd:4] bd:4>".slow(2))
    .shape(aggression.range(0.2, 0.6))
    .lpf(aggression.range(300, 600))
    .gain(0.9)
    .every(8, x => x.fast(2))
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === THE STING - piercing leads that evolve ===
  n("<[7 ~ 5 ~] [~ 7 ~ 5] [5 7 ~ ~] [~ ~ 7 5]> <[5 ~ 7 ~] [~ 5 ~ 7] [7 5 ~ ~] [~ ~ 5 7]>".slow(2))
    .scale("C:phrygian")
    .s("sawtooth")
    .lpf(sine.range(800, 4000).fast(2))
    .lpq(aggression.range(8, 18))
    .gain(swarm.range(0.2, 0.6))
    .distort(aggression.range(0.5, 2))
    .every(4, x => x.rev()),

  // === MANDIBLE CLICKS - varies with intensity ===
  s("~ cp ~ [cp cp]")
    .speed(aggression.range(1, 2))
    .gain(0.7)
    .room(0.3)
    .fast(swarm.range(0.75, 1.5))
    .mask("<0 1 1 1 1 1 1 1 1 1 1 0>".slow(12)),

  // === QUEEN'S DRONE - constant authority ===
  n("0")
    .scale("C1:phrygian")
    .s("sawtooth")
    .lpf(aggression.range(200, 400))
    .lpq(5)
    .gain(0.6)
    .shape(0.2),

  // === WING FLUTTER - chaos factor ===
  s("hh*32")
    .speed(rand.range(2, 4))
    .gain(swarm.range(0.05, 0.3))
    .pan(rand)
    .hpf(10000)
    .rarely(x => x.fast(2))
    .degradeBy(swarm.range(0.8, 0.2)),

  // === TERRITORIAL BASS - drops in for impact ===
  n("<0 ~ ~ ~> <~ 0 ~ ~> <~ ~ 0 ~> <0 ~ 0 ~>".slow(4))
    .scale("C0:phrygian")
    .s("sine")
    .lpf(60)
    .gain(aggression.range(0.3, 0.7))
    .slow(2)
    .mask("<0 0 0 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === ATTACK SIGNAL - high pitched alarm in peak sections ===
  n("[11, 14]")
    .scale("C5:phrygian")
    .s("square")
    .lpf(2000)
    .gain(0.2)
    .room(0.4)
    .slow(8)
    .every(4, x => x.fast(4))
    .mask("<0 0 0 0 1 1 1 1 0 0 0 0>".slow(12))
)
