// LIMINAL MALL
// 3AM in an empty shopping center - escalators running for no one, muzak echoing

setcpm(108)

stack(
  // The eternal escalator - mechanical, hypnotic
  s("[~ hh:2] [hh:0 ~] [~ hh:1] [hh:2 hh:0]")
    .gain(0.35)
    .hpf(3000)
    .room(0.7)
    .size(6)
    .pan(0.3),

  // Muzak melody - vaguely familiar, deeply unsettling
  n("<[0 2 4] [4 2 0] [2 4 7] [7 4 2]>")
    .scale("G:major")
    .s("gm_vibraphone")
    .room(0.8)
    .gain(0.4)
    .lpf(2500)
    .delay(0.3)
    .delaytime(0.5)
    .delayfeedback(0.4)
    .degradeBy(0.15),

  // Fluorescent light hum - 60hz drone
  n("[0, 7]")
    .scale("G1:major")
    .s("triangle")
    .gain(0.2)
    .lpf(200)
    .slow(16),

  // Distant footsteps - yours? someone else's?
  s("~ ~ ~ ~ ~ ~ cp? ~")
    .room(0.9)
    .size(15)
    .gain(0.25)
    .hpf(400)
    .slow(2),

  // Fountain that never stops
  s("hh:3*16")
    .gain(perlin.range(0.05, 0.15))
    .hpf(8000)
    .pan(perlin.range(-1, 1).slow(5))
    .room(0.6),

  // The bass of emptiness
  n("0 ~ ~ 0 ~ ~ ~ 0")
    .scale("G1:major")
    .s("sine")
    .lpf(100)
    .gain(0.5)
    .slow(2)
)
