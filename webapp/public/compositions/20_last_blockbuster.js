// LAST BLOCKBUSTER
// Nostalgia for a dying format - VHS hum, carpet smell, the weight of choosing

setcpm(95)

stack(
  // VHS tracking - warped and warm
  n("<[0 2 4] [2 4 7]> <[4 7 9] [7 9 11]>")
    .scale("A:mixolydian")
    .s("sawtooth")
    .lpf(sine.range(600, 1800).slow(6))
    .lpq(4)
    .gain(0.45)
    .room(0.4)
    .coarse(8)
    .crush(10),

  // Walking the aisles
  s("bd ~ [~ bd] ~")
    .lpf(400)
    .gain(0.55)
    .room(0.5),

  // Rewinding memories
  s("hh*8")
    .speed(saw.range(0.5, 2).slow(8))
    .gain(0.3)
    .hpf(2000)
    .pan(sine.slow(4)),

  // Late fees bass - the dread
  n("0 ~ ~ 0 ~ 0 ~ ~")
    .scale("A1:mixolydian")
    .s("triangle")
    .lpf(300)
    .gain(0.5),

  // Microwave popcorn melody
  n(perlin.range(0, 7).segment(6))
    .scale("A4:mixolydian")
    .s("gm_vibraphone")
    .gain(0.3)
    .room(0.6)
    .delay(0.3)
    .delaytime(0.25)
    .delayfeedback(0.4),

  // Static between channels
  s("hh*4?0.3")
    .speed(0.3)
    .lpf(3000)
    .hpf(1000)
    .gain(0.15)
    .room(0.3),

  // The closing time announcement
  n("[0, 4, 7]")
    .scale("A2:major")
    .s("gm_voice_oohs")
    .attack(1)
    .release(3)
    .lpf(1200)
    .room(0.8)
    .gain(0.25)
    .slow(8)
)
