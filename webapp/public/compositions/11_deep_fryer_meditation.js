// DEEP FRYER MEDITATION
// Finding zen in the sizzle - oil bubbling, batter crisping, enlightenment at 375F

setcpm(82)

stack(
  // The eternal sizzle
  s("hh*32")
    .speed(rand.range(0.8, 1.5))
    .gain(perlin.range(0.1, 0.25))
    .hpf(3000)
    .pan(perlin.range(-0.5, 0.5).slow(4))
    .room(0.3),

  // Bubbles rising to the surface
  s("[bd:2 ~] [~ bd:2?] [bd:2? bd:2] [~ ~]")
    .lpf(400)
    .gain(0.5)
    .room(0.4)
    .shape(0.1),

  // The calm center of the oil
  n("[0, 4, 7]")
    .scale("Bb:major")
    .s("sine")
    .attack(1)
    .release(2)
    .lpf(400)
    .gain(0.4)
    .slow(4),

  // Timer countdown meditation
  s("~ ~ ~ cp")
    .room(0.6)
    .gain(0.4),

  // Golden brown transcendence
  n("<0 2 4 5 7 9 11 12>".slow(8))
    .scale("Bb3:major")
    .s("triangle")
    .room(0.7)
    .gain(0.35)
    .delay(0.4)
    .delaytime(0.333)
    .delayfeedback(0.5),

  // The hum of the heat lamp
  n("0")
    .scale("Bb1:major")
    .s("triangle")
    .lpf(120)
    .gain(0.35)
    .slow(16)
)
