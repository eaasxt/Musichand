// MYCELIUM NETWORK
// Fungal internet beneath the forest floor - signals passing, nutrients sharing, silent wisdom
// Structure: First Connection -> Network Building -> Peak Activity -> Spore Release -> Dormancy

setcpm(66)

// Network activity
let network = sine.range(0.2, 1).slow(104)
let signals = perlin.range(0.5, 1).slow(64)

stack(
  // === ROOT SYSTEM PULSE - varying density ===
  s("<bd:2 ~ ~ bd:2 ~ bd:2 ~ ~> <~ bd:2 ~ ~ bd:2 ~ ~ bd:2> <bd:2 ~ bd:2 ~ ~ ~ bd:2 ~>".slow(3))
    .lpf(network.range(200, 350))
    .gain(0.55)
    .room(0.6)
    .slow(1.5)
    .every(8, x => x.fast(2)),

  // === NUTRIENT TRANSFER - evolving harmonies ===
  n("<0 2 4 7> <4 7 9 11> <2 4 7 9> <0 4 7 11> <7 9 11 14> <4 7 9 11> <2 4 7 9> <0 2 4 7>".slow(16))
    .scale("E:dorian")
    .s("triangle")
    .lpf(perlin.range(400, 1200).slow(12))
    .gain(network.range(0.25, 0.5))
    .room(0.5)
    .pan(perlin.range(-0.6, 0.6).slow(4))
    .every(8, x => x.add(note(2))),

  // === SPORE RELEASE - bursts during peak ===
  n(irand(7).segment(network.range(3, 9)))
    .scale("E5:dorian")
    .s("sine")
    .gain(perlin.range(0.05, 0.2).mul(network))
    .pan(rand)
    .room(0.8)
    .delay(0.5)
    .delaytime(0.5)
    .delayfeedback(network.range(0.4, 0.75))
    .hpf(2500)
    .degradeBy(network.range(0.6, 0.2))
    .mask("<0 0 1 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === DEEP EARTH HUM - foundation ===
  n("[0, 7]")
    .scale("E0:dorian")
    .s("sine")
    .lpf(network.range(60, 100))
    .gain(network.range(0.3, 0.55))
    .slow(16),

  // === DECOMPOSITION RHYTHMS - breakdown sounds ===
  s("~ cp ~ ~ cp ~ ~ ~")
    .speed(0.7)
    .room(0.7)
    .gain(signals.range(0.2, 0.4))
    .hpf(500)
    .every(4, x => x.fast(2))
    .sometimesBy(0.3, x => x.speed(0.5)),

  // === TREE ROOTS RECEIVING - responsive melody ===
  n("<0 ~ 2 ~> <~ 4 ~ 5> <2 ~ 4 ~> <~ 5 ~ 7>".slow(4))
    .scale("E2:dorian")
    .s("sawtooth")
    .lpf(network.range(300, 600))
    .gain(0.4)
    .slow(2)
    .room(0.5),

  // === INTER-TREE COMMUNICATION - new layer in peak ===
  n("[0, 4, 7]")
    .scale("E3:dorian")
    .s("triangle")
    .attack(1)
    .release(2)
    .lpf(800)
    .room(0.7)
    .gain(network.range(0.15, 0.35))
    .slow(4)
    .mask("<0 0 0 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === DORMANCY PHASE - wind down ===
  n(perlin.range(0, 7).segment(2))
    .scale("E3:dorian")
    .s("sine")
    .lpf(perlin.range(200, 500).slow(16))
    .gain(perlin.range(0.03, 0.1))
    .pan(perlin.slow(8))
    .room(0.9)
    .slow(4)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
