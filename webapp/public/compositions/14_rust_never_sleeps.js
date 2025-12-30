// RUST NEVER SLEEPS
// Oxidation as music - slow decay, iron returning to earth, beautiful destruction
// Structure: First Spot -> Spreading -> Deep Corrosion -> Structural Weakness -> Collapse

setcpm(48)

// Oxidation progression
let oxidation = sine.range(0, 1).slow(128)
let decay = perlin.range(0.4, 1).slow(80)

stack(
  // === THE SLOW CHEMICAL REACTION - evolving harmonies ===
  n("<[0, 3, 7] ~ ~ ~ [2, 5, 9] ~ ~ ~> <[2, 5, 9] ~ ~ [0, 3, 7] ~ ~ ~ ~> <~ [0, 3, 7] ~ ~ ~ [2, 5, 9] ~ ~>".slow(3))
    .scale("D:minor")
    .s("sawtooth")
    .lpf(sine.range(400, 1200).slow(32))
    .lpq(decay.range(4, 12))
    .attack(oxidation.range(0.3, 0.8))
    .release(oxidation.range(1.5, 3))
    .gain(0.45)
    .room(0.7)
    .shape(0.15),

  // === FLAKES FALLING OFF - increasing debris ===
  n(perlin.range(0, 7).segment(oxidation.range(3, 8)))
    .scale("D4:minor")
    .s("triangle")
    .gain(perlin.range(0.1, 0.3))
    .room(0.8)
    .delay(0.5)
    .delaytime(0.666)
    .delayfeedback(oxidation.range(0.4, 0.75))
    .pan(perlin.range(-1, 1).slow(5))
    .slow(1.5),

  // === STRUCTURAL GROANING - occasional stress ===
  s("bd:3 ~ ~ ~ ~ ~ ~ ~")
    .lpf(decay.range(150, 300))
    .room(0.9)
    .size(oxidation.range(6, 18))
    .gain(decay.range(0.3, 0.5))
    .shape(0.2)
    .slow("<4 4 2 2 2 2 4 4>".slow(16)),

  // === WATER DRIPPING - catalyst accelerating ===
  s("~ ~ hh:1 ~ ~ ~ ~ hh:1")
    .speed(0.6)
    .room(0.85)
    .gain(oxidation.range(0.15, 0.35))
    .slow("<2 2 1.5 1 1 1.5 2 2>".slow(16))
    .degradeBy(0.3),

  // === EARTH RECLAIMING - deep foundation ===
  n("0")
    .scale("D0:minor")
    .s("sine")
    .lpf(oxidation.range(40, 80))
    .gain(oxidation.range(0.3, 0.6))
    .slow(16),

  // === WIND THROUGH HOLES - whistling decay ===
  n(perlin.range(7, 14).segment(4))
    .scale("D5:minor")
    .s("triangle")
    .lpf(perlin.range(200, 800).slow(8))
    .hpf(100)
    .gain(perlin.range(0.02, 0.08).mul(oxidation))
    .pan(perlin.range(-1, 1).slow(6))
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === METAL FATIGUE - harmonic stress ===
  n("[0, 5, 9]")
    .scale("D2:minor")
    .s("sawtooth")
    .lpf(decay.range(300, 600))
    .gain(0.2)
    .room(0.6)
    .attack(0.8)
    .release(2)
    .slow(8)
    .crush(decay.range(16, 8))
    .mask("<0 0 0 1 1 1 1 1 0 0 0 0>".slow(12)),

  // === FINAL COLLAPSE - late phase impact ===
  s("bd:3")
    .lpf(400)
    .gain(0.5)
    .room(0.95)
    .size(20)
    .slow(16)
    .mask("<0 0 0 0 0 0 0 0 0 0 1 1>".slow(12))
)
