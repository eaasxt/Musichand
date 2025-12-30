// PARKING GARAGE AT 2AM
// Concrete echo chamber - your footsteps, distant engines, existential dread
// Structure: Entering -> Deep Inside -> Distant Activity -> Panic -> Finding Car

setcpm(76)

// Atmosphere of dread
let dread = sine.range(0.2, 1).slow(96)
let echo_depth = perlin.range(0.6, 1).slow(64)

stack(
  // === FOOTSTEPS - yours, changing pace with dread ===
  s("<bd:1 ~ bd:1 ~> <bd:1 bd:1 ~ bd:1> <~ bd:1 ~ bd:1>".slow(3) + ", ~ ~ [~ bd:1] ~")
    .room(echo_depth.range(0.6, 0.95))
    .size(echo_depth.range(4, 14))
    .gain(dread.range(0.35, 0.6))
    .hpf(200)
    .fast(dread.range(0.8, 1.4)),

  // === FLUORESCENT FLICKER - anxiety inducing ===
  n("[4, 7]")
    .scale("E:minor")
    .s("square")
    .lpf(300)
    .gain(sine.range(0.1, 0.2).fast(dread.range(3, 15)))
    .slow(8),

  // === DISTANT CAR - intermittent presence ===
  s("~ ~ ~ ~ ~ ~ ~ bd:3")
    .lpf(1500)
    .hpf(400)
    .room(0.9)
    .gain(dread.range(0.15, 0.35))
    .slow("<8 4 4 2 2 4 4 8>".slow(16))
    .degradeBy(0.4),

  // === YOUR BREATHING - echoing back ===
  s("<hh:3 ~ ~ hh:3> <~ hh:3 hh:3 ~>".slow(2))
    .speed(0.4)
    .room(echo_depth.range(0.7, 0.95))
    .size(10)
    .gain(dread.range(0.1, 0.3))
    .slow(2),

  // === STRUCTURAL HUM - the building itself ===
  n("[0, 7]")
    .scale("E1:minor")
    .s("triangle")
    .lpf(dread.range(100, 200))
    .gain(0.3)
    .slow(16),

  // === DRIPPING FROM SOMEWHERE - distant, unlocatable ===
  n("<7 9 7 11> <9 7 11 7> <7 11 9 7>".slow(6))
    .scale("E5:minor")
    .s("sine")
    .room(0.9)
    .delay(0.6)
    .delaytime(0.4)
    .delayfeedback(0.7)
    .gain(dread.range(0.1, 0.25))
    .slow(2),

  // === ELEVATOR DING - hope or fear? ===
  n("11")
    .scale("E5:minor")
    .s("sine")
    .room(0.95)
    .gain(0.15)
    .slow(16)
    .degradeBy(0.6)
    .mask("<0 0 0 1 1 1 1 1 1 0 0 0>".slow(12)),

  // === PANIC RHYTHM - heart racing section ===
  s("bd:1*4")
    .gain(dread.range(0.2, 0.5))
    .lpf(300)
    .room(0.7)
    .mask("<0 0 0 0 0 1 1 1 0 0 0 0>".slow(12)),

  // === CAR FOUND - relief melody at end ===
  n("<[0, 4, 7] ~ ~ ~> <~ [2, 5, 9] ~ ~>".slow(4))
    .scale("E3:major")
    .s("triangle")
    .attack(0.5)
    .release(2)
    .lpf(1000)
    .room(0.7)
    .gain(0.3)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
