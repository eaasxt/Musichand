// WASP FACTORY
// Industrial aggression meets insectoid precision - angry, mechanical, swarming

setcpm(144)

stack(
  // The swarm - dense, menacing
  s("[hh hh hh hh hh hh]*4")
    .speed(saw.range(1, 2.5).fast(0.5))
    .gain("1 0.6 0.8 0.5 0.9 0.7".fast(6))
    .pan(sine.fast(7))
    .hpf(4000)
    .room(0.2),

  // Industrial punch - relentless
  s("bd:4 [~ bd:4] bd:4 bd:4")
    .shape(0.4)
    .lpf(400)
    .gain(0.9),

  // The sting - piercing leads
  n("[7 ~ 5 ~] [~ 7 ~ 5] [5 7 ~ ~] [~ ~ 7 5]")
    .scale("C:phrygian")
    .s("sawtooth")
    .lpf(sine.range(800, 4000).fast(2))
    .lpq(12)
    .gain(0.5)
    .distort(1.5),

  // Mandible clicks
  s("~ cp ~ [cp cp]")
    .speed(1.5)
    .gain(0.7)
    .room(0.3),

  // Queen's drone - low authority
  n("0")
    .scale("C1:phrygian")
    .s("sawtooth")
    .lpf(300)
    .lpq(5)
    .gain(0.6)
    .shape(0.2),

  // Random wing flutter
  s("hh?*32")
    .speed(rand.range(2, 4))
    .gain(0.2)
    .pan(rand)
    .hpf(10000)
    .rarely(x => x.fast(2))
)
