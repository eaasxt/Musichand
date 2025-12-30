// VENDING MACHINE REQUIEM
// The soul of a machine that dispenses comfort - hum, clunk, illumination, disappointment
// Structure: Approaching -> Selection -> Anticipation -> Dispensing -> Walking Away

setcpm(88)

// Machine activity
let activity = sine.range(0.3, 1).slow(80)
let hope = perlin.range(0.4, 1).slow(64)

stack(
  // === COMPRESSOR CYCLE - the heartbeat, varies ===
  s("<bd:1 ~ ~ ~ bd:1 ~ ~ ~> <bd:1 ~ ~ bd:1 ~ ~ ~ ~> <~ bd:1 ~ ~ ~ bd:1 ~ ~>".slow(3))
    .lpf(activity.range(150, 280))
    .gain(0.5)
    .room(0.4)
    .every(16, x => x.degradeBy(0.3)),

  // === FLUORESCENT HUM - flickers ===
  n("[0, 7]")
    .scale("F:major")
    .s("square")
    .lpf(250)
    .gain(sine.range(0.1, 0.2).fast(activity.range(2, 8)))
    .slow(16),

  // === SELECTION BUTTONS - user interaction ===
  s("~ ~ cp ~")
    .gain(hope.range(0.25, 0.5))
    .room(0.5)
    .sometimes(x => x.fast(2))
    .hpf(1000)
    .mask("<0 1 1 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === SPIRAL ROTATION - item falling melody ===
  n("<[2 4 5 7]> <[4 5 7 9]> <[5 7 9 11]> <[7 9 11 12]>".slow(4))
    .scale("F3:major")
    .s("triangle")
    .gain(activity.range(0.2, 0.45))
    .room(0.6)
    .every(4, x => x.fast(2))
    .slow(2)
    .mask("<0 0 0 1 1 1 1 0 0 0 0 0>".slow(12)),

  // === THE SATISFYING THUNK - payoff moment ===
  s("~ ~ ~ ~ ~ ~ ~ bd:3")
    .lpf(400)
    .hpf(100)
    .gain(hope.range(0.4, 0.75))
    .room(0.5)
    .slow("<8 4 4 2 4 4 8 8>".slow(16)),

  // === COINS JINGLING - nostalgic memory ===
  s("hh:2*<2 4 2 0 2 4 2 0>".slow(8))
    .speed(1.5)
    .gain(hope.range(0.15, 0.35))
    .hpf(3000)
    .pan(rand)
    .room(0.3),

  // === THE GLOW OF POSSIBILITY - emotional core ===
  n("<[0, 4, 7] [2, 5, 9]> <[4, 7, 11] [0, 4, 7]>".slow(2))
    .scale("F3:major")
    .s("sine")
    .attack(0.5)
    .release(2)
    .lpf(activity.range(1000, 2000))
    .room(0.7)
    .gain(hope.range(0.2, 0.4))
    .slow(4),

  // === DISAPPOINTMENT - wrong item dropped ===
  n("[-3, 0, 4]")
    .scale("F2:minor")
    .s("sawtooth")
    .lpf(500)
    .gain(0.2)
    .room(0.6)
    .slow(16)
    .mask("<0 0 0 0 0 0 1 1 0 0 0 0>".slow(12)),

  // === WALKING AWAY - fade out ===
  n(perlin.range(0, 7).segment(3))
    .scale("F3:major")
    .s("triangle")
    .lpf(perlin.range(400, 800).slow(12))
    .gain(perlin.range(0.05, 0.15))
    .room(0.8)
    .delay(0.4)
    .delaytime(0.25)
    .delayfeedback(0.6)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
