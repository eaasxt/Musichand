// HEMORRHAGE FUNK
// Bleeding groove - visceral, pumping, arterial pressure and release

setcpm(116)

stack(
  // The pulse - systole/diastole
  s("[bd bd] ~ [bd ~] ~, ~ [~ sd] ~ sd")
    .gain(0.85)
    .lpf(800)
    .shape(0.2),

  // Capillary hi-hats - dense microcirculation
  s("[hh hh] [oh hh] [hh hh] [hh oh]")
    .gain("0.5 0.3 0.4 0.35 0.5 0.3 0.45 0.4")
    .pan(sine.range(-0.4, 0.4).fast(2)),

  // Plasma bass - thick and warm
  n("[0 0] ~ [0 ~] [5 0], ~ ~ [3 ~] ~")
    .scale("E2:minor")
    .s("sawtooth")
    .lpf(sine.range(200, 600).slow(4))
    .lpq(6)
    .gain(0.6)
    .shape(0.15),

  // Clotting factors - syncopated stabs
  n("~ [4, 7] ~ ~, ~ ~ [5, 9] ~")
    .scale("E3:minor")
    .s("square")
    .lpf(1200)
    .gain(0.4)
    .room(0.3)
    .every(4, x => x.fast(2)),

  // Iron in the blood - metallic shimmer
  s("~ ~ ~ rim")
    .speed(1.2)
    .gain(0.5)
    .room(0.5)
    .hpf(2000),

  // Pressure fluctuations
  n("0, 7")
    .scale("E1:minor")
    .s("sine")
    .lpf(100)
    .gain(sine.range(0.3, 0.5).slow(2))
)
