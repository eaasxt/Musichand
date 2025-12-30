// HEMORRHAGE FUNK
// Bleeding groove - visceral, pumping, arterial pressure and release
// Structure: First Drop -> Pressure Rising -> Full Flow -> Clotting -> Stabilize

setcpm(116)

// Blood pressure dynamics
let pressure = sine.range(0.4, 1).slow(80)
let pulse = saw.range(0.7, 1.2).slow(4)

stack(
  // === THE PULSE - systole/diastole with variations ===
  s("<[bd bd] ~ [bd ~] ~> <bd [~ bd] ~ [bd bd]> <[bd ~] ~ [bd bd] ~>".slow(3) + ", ~ [~ sd] ~ sd")
    .gain(pressure.range(0.6, 0.95))
    .lpf(pressure.range(500, 1000))
    .shape(0.2)
    .every(8, x => x.fast(2))
    .every(16, x => x.degradeBy(0.2)),

  // === CAPILLARY HI-HATS - dense microcirculation ===
  s("[hh hh] [oh hh] [hh hh] [hh oh]")
    .gain(pulse.mul("0.5 0.3 0.4 0.35 0.5 0.3 0.45 0.4"))
    .pan(sine.range(-0.4, 0.4).fast(2))
    .hpf(pressure.range(3000, 6000))
    .fast(pressure.range(0.8, 1.2)),

  // === PLASMA BASS - thick and warm, pulsing ===
  n("<[0 0] ~ [0 ~] [5 0]> <0 [~ 0] [0 0] ~> <[0 5] ~ [0 ~] 0>".slow(3) + ", ~ ~ [3 ~] ~")
    .scale("E2:minor")
    .s("sawtooth")
    .lpf(sine.range(200, 600).slow(4))
    .lpq(6)
    .gain(pressure.range(0.4, 0.7))
    .shape(0.15),

  // === CLOTTING FACTORS - syncopated stabs, more during clotting phase ===
  n("~ [4, 7] ~ ~, ~ ~ [5, 9] ~")
    .scale("E3:minor")
    .s("square")
    .lpf(pressure.range(800, 1600))
    .gain(0.4)
    .room(0.3)
    .every(4, x => x.fast(2))
    .mask("<1 1 1 1 1 1 1 1 0 0 1 1>".slow(12)),

  // === IRON SHIMMER - metallic blood ===
  s("~ ~ ~ cp")
    .speed(pressure.range(1, 1.5))
    .gain(0.5)
    .room(0.5)
    .hpf(2000)
    .every(8, x => x.fast(2)),

  // === PRESSURE FLUCTUATIONS - underlying drone ===
  n("0, 7")
    .scale("E1:minor")
    .s("sine")
    .lpf(100)
    .gain(sine.range(0.3, 0.5).slow(2)),

  // === ARTERIAL SPRAY - appears during peak pressure ===
  n(irand(7).segment(8))
    .scale("E4:minor")
    .s("triangle")
    .lpf(1500)
    .gain(0.25)
    .pan(rand)
    .room(0.4)
    .delay(0.3)
    .delaytime(0.125)
    .delayfeedback(0.5)
    .mask("<0 0 0 1 1 1 1 0 0 0 0 0>".slow(12)),

  // === RECOVERY PULSE - calmer rhythm in later section ===
  s("bd ~ ~ ~ bd ~ ~ ~")
    .lpf(200)
    .gain(0.4)
    .room(0.5)
    .slow(2)
    .mask("<0 0 0 0 0 0 0 0 1 1 1 1>".slow(12))
)
