// DIALYSIS MACHINE
// The rhythm of mechanical kidneys - clinical, vital, the sound of borrowed time
// Structure: Connecting -> Blood Flow -> Filtration Peak -> Toxin Clear -> Disconnecting

setcpm(63)

// Clinical precision with organic fluctuation
let cycle = sine.range(0.4, 1).slow(104)
let vitals = perlin.range(0.7, 1).slow(64)

stack(
  // === PUMP CYCLE - systemic, mechanical heart ===
  s("<[bd ~] [~ bd] [bd ~] [~ bd]> <bd [~ bd] [bd ~] bd>".slow(2))
    .lpf(cycle.range(250, 400))
    .gain(0.6)
    .room(0.3)
    .every(16, x => x.degradeBy(0.2)),

  // === BLOOD FLOWING - serpentine through tubes ===
  n("<0 2 0 3 0 2 0 4> <0 3 0 2 0 4 0 3> <2 0 3 0 4 0 2 0>".slow(3))
    .scale("C:dorian")
    .s("sine")
    .lpf(sine.range(200, 500).slow(8))
    .gain(vitals.range(0.35, 0.55))
    .pan(sine.range(-0.3, 0.3).slow(4))
    .room(0.4),

  // === FILTER MEMBRANE - oscillating purification ===
  s("hh:2*8")
    .speed(0.6)
    .gain(cycle.range(0.15, 0.25).mul("0.2 0.15 0.2 0.18 0.2 0.15 0.2 0.17"))
    .hpf(2000)
    .room(0.4)
    .pan(sine.slow(8)),

  // === TOXINS EXTRACTED - random debris clearing ===
  n(irand(5).segment(7))
    .scale("C4:dorian")
    .s("square")
    .lpf(cycle.range(400, 800))
    .gain(0.15)
    .pan(rand)
    .crush(12)
    .room(0.5)
    .degradeBy(cycle.range(0.6, 0.2))
    .mask("<0 0 1 1 1 1 1 1 1 1 0 0>".slow(12)),

  // === ALARM POTENTIAL - subtle warning layer ===
  n("[7, 11]")
    .scale("C5:dorian")
    .s("triangle")
    .gain(0.1)
    .hpf(3000)
    .slow(8)
    .sometimesBy(0.1, x => x.gain(0.4))
    .room(0.6),

  // === PATIENT HEARTBEAT - human element ===
  s("<bd:1 ~ ~ ~ bd:1 ~ ~ bd:1> <bd:1 ~ ~ bd:1 ~ ~ ~ bd:1>".slow(2))
    .lpf(150)
    .gain(vitals.range(0.3, 0.5))
    .room(0.5)
    .slow(2),

  // === MACHINE HUM - underlying drone ===
  n("[0, 7]")
    .scale("C1:dorian")
    .s("triangle")
    .lpf(80)
    .gain(cycle.range(0.25, 0.4))
    .slow(16),

  // === CLEANUP SEQUENCE - late phase ===
  n("<0 ~ 2 ~> <~ 4 ~ 5>".slow(2))
    .scale("C3:dorian")
    .s("triangle")
    .lpf(800)
    .attack(0.5)
    .release(1.5)
    .room(0.6)
    .gain(0.3)
    .mask("<0 0 0 0 0 0 0 0 0 1 1 1>".slow(12))
)
