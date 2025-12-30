// SEIZURE PROTOCOL
// Neural misfiring, synaptic chaos, the brain's electrical storm - glitchy, fractured, urgent
// Structure: Aura -> Tonic Phase -> Clonic Phase -> Post-ictal -> Recovery

setcpm(175)

// Neural activity - spikes and crashes
let neural = sine.range(0, 1).slow(72)
let chaos = perlin.range(0.3, 1).slow(48)

stack(
  // === ERRATIC HEARTBEAT - trying to keep up ===
  s("<bd [bd bd] bd ~> <bd ~ [bd ~] bd> <[bd bd] ~ bd bd>")
    .gain(0.8)
    .sometimes(x => x.speed(0.5))
    .rarely(x => x.fast(2))
    .lpf(neural.range(200, 600))
    .every(8, x => x.degradeBy(0.3)),

  // === SYNAPTIC MISFIRES - chromatic chaos ===
  n("<[0 5] [~ 3] [7 ~] [2 0]> <[3 ~] [0 7] [~ 5] [0 ~]>".fast(2))
    .scale("Db:chromatic")
    .s("square")
    .lpf(rand.range(400, 4000).segment(16))
    .lpq(chaos.range(4, 12))
    .gain(neural.range(0.2, 0.5))
    .pan(rand)
    .crush(chaos.range(5, 12))
    .every(4, x => x.fast(2))
    .mask("<0 0 1 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === HIGH FREQUENCY INTERFERENCE - escalating ===
  s("hh*<8 16 32 64 32 16 8 4>".slow(16))
    .speed("<1 1.5 2 0.75 1 2 1.5 1>".slow(16))
    .gain(neural.range(0.15, 0.4).mul("0.3 0.1 0.2 0.4".fast(4)))
    .pan(sine.fast(11))
    .hpf(5000),

  // === TRYING TO FIND GROUND - drops out during peak ===
  n("0")
    .scale("Db1:minor")
    .s("sine")
    .lpf(80)
    .gain(0.5)
    .every(4, x => x.gain(0))
    .mask("<1 1 1 0 0 0 0 0 1 1 1 1>".slow(12)),

  // === FRAGMENTED THOUGHTS - melody trying to form ===
  n("[0 2] ~ [4 ~] 5 ~ [7 4] [2 ~] 0")
    .scale("Db3:minor")
    .s("triangle")
    .lpf(chaos.range(800, 2000))
    .gain(0.35)
    .room(0.3)
    .sometimesBy(chaos, x => x.rev())
    .sometimesBy(chaos.range(0.1, 0.4), x => x.fast(2)),

  // === STATIC BURSTS - peak chaos indicator ===
  s("~ ~ ~ hh:0")
    .speed(0.3)
    .lpf(3000)
    .hpf(1000)
    .gain(chaos.range(0.1, 0.5))
    .room(0.4)
    .fast(chaos.range(1, 4))
    .mask("<0 0 0 1 1 1 1 1 0 0 0 0>".slow(12)),

  // === RECOVERY MELODY - emerges in later phases ===
  n("<[0, 3, 7] ~ ~ ~> <~ [2, 5, 9] ~ ~>".slow(4))
    .scale("Db3:minor")
    .s("triangle")
    .attack(0.5)
    .release(2)
    .lpf(1200)
    .room(0.6)
    .gain(0.3)
    .mask("<0 0 0 0 0 0 0 0 1 1 1 1>".slow(12)),

  // === BRAIN WAVE OSCILLATOR - subtle underlying pulse ===
  n(sine.range(0, 7).segment(4))
    .scale("Db4:minor")
    .s("sine")
    .lpf(800)
    .gain(0.15)
    .pan(sine.fast(0.5))
    .room(0.5)
)
