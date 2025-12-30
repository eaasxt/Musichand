// BONE LIBRARY
// Ancient ossuary where knowledge is stored in marrow - skeletal, reverent, deep
// Structure: Entering the Vault -> The Stacks -> Reading Room -> Deep Archive -> Exiting

setcpm(54)

// Deeper into the library
let depth = sine.range(0, 1).slow(112)
let reverence = perlin.range(0.6, 1).slow(64)

stack(
  // === VERTEBRAE PERCUSSION - clicking, hollow, varies with depth ===
  s("<[cp ~] [~ cp ~] [cp cp ~]> <[~ cp] [cp ~ cp] [~ ~ cp]>")
    .room(depth.range(0.7, 0.95))
    .size(depth.range(6, 18))
    .gain(0.5)
    .hpf(800)
    .slow(1.5)
    .every(8, x => x.fast(1.5))
    .sometimesBy(depth.range(0, 0.3), x => x.speed(0.7)),

  // === FEMUR BASS - resonant, hollow, deeper tones as we descend ===
  n("<0 ~ ~ ~ -7 ~ 0 ~> <0 ~ -5 ~ ~ ~ 0 ~> <-7 ~ ~ 0 ~ ~ -5 ~>".slow(3))
    .scale("B:phrygian")
    .s("triangle")
    .lpf(depth.range(200, 350))
    .room(0.7)
    .gain(0.6)
    .slow(2),

  // === SKULL CHOIR - whispered harmonics, swells ===
  n("<[0, 3, 7, 11]> <[2, 5, 9, 12]> <[-1, 3, 7, 10]> <[0, 4, 7, 11]>".slow(4))
    .scale("B2:phrygian")
    .s("triangle")
    .attack(depth.range(1, 2.5))
    .release(depth.range(2, 5))
    .lpf(depth.range(800, 1600))
    .room(0.9)
    .size(15)
    .gain(reverence.range(0.25, 0.45))
    .slow(4),

  // === FINGER BONES ON TEXTS - reading, searching ===
  n(irand(7).segment(5))
    .scale("B4:phrygian")
    .s("triangle")
    .gain(0.3)
    .room(0.8)
    .delay(0.5)
    .delaytime(0.666)
    .delayfeedback(depth.range(0.4, 0.75))
    .degradeBy(0.3)
    .slow(0.75)
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === BREATH BETWEEN RIBS - occasional deep exhale ===
  s("~ ~ ~ bd:1")
    .lpf(100)
    .gain(0.4)
    .room(0.9)
    .slow("<8 8 4 4 4 4 8 8>".slow(16)),

  // === ANCIENT WHISPERS - melodic fragments from the deep ===
  n(perlin.range(0, 11).segment(4))
    .scale("B3:phrygian")
    .s("sine")
    .lpf(perlin.range(400, 1200).slow(8))
    .gain(perlin.range(0.05, 0.2))
    .pan(perlin.slow(5))
    .room(0.95)
    .delay(0.7)
    .delaytime(0.5)
    .delayfeedback(0.7)
    .slow(2)
    .mask("<0 0 0 0 0 1 1 1 1 0 0 0>".slow(12)),

  // === MARROW DRONE - the deepest knowledge ===
  n("[0, -12]")
    .scale("B0:phrygian")
    .s("sine")
    .lpf(50)
    .gain(depth.range(0.2, 0.5))
    .slow(16)
    .mask("<0 0 0 0 0 0 1 1 1 1 1 1>".slow(12))
)
