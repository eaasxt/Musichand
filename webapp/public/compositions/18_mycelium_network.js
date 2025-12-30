// MYCELIUM NETWORK
// Fungal internet beneath the forest floor - signals passing, nutrients sharing, silent wisdom

setcpm(66)

stack(
  // Root system pulse
  s("bd:2 ~ ~ bd:2 ~ bd:2? ~ ~")
    .lpf(250)
    .gain(0.55)
    .room(0.6)
    .slow(1.5),

  // Nutrient transfer - chemical signals
  n("<0 2 4 7> <4 7 9 11> <2 4 7 9> <0 4 7 11>".slow(8))
    .scale("E:dorian")
    .s("triangle")
    .lpf(perlin.range(400, 1200).slow(12))
    .gain(0.4)
    .room(0.5)
    .pan(perlin.range(-0.6, 0.6).slow(4)),

  // Spore release - occasional bursts
  n(irand(7).segment(5))
    .scale("E5:dorian")
    .s("sine")
    .gain(perlin.range(0.05, 0.2))
    .pan(rand)
    .room(0.8)
    .delay(0.5)
    .delaytime(0.5)
    .delayfeedback(0.6)
    .hpf(2500)
    .degradeBy(0.3),

  // Deep earth hum
  n("[0, 7]")
    .scale("E0:dorian")
    .s("sine")
    .lpf(80)
    .gain(0.45)
    .slow(16),

  // Decomposition rhythms - slow breakdown
  s("~ cp? ~ ~ cp ~ ~ ~")
    .speed(0.7)
    .room(0.7)
    .gain(0.3)
    .hpf(500),

  // Tree roots receiving messages
  n("<0 ~ 2 ~> <~ 4 ~ 5>")
    .scale("E2:dorian")
    .s("sawtooth")
    .lpf(400)
    .gain(0.4)
    .slow(2)
)
