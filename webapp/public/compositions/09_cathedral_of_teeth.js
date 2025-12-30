// CATHEDRAL OF TEETH
// A church built from molars - grotesque beauty, enamel acoustics, dentin prayers

setcpm(72)

stack(
  // Enamel bells
  n("<[0 4 7] [2 5 9] [4 7 11] [0 4 7]>")
    .scale("D:mixolydian")
    .s("sine")
    .room(0.9)
    .size(12)
    .gain(0.5)
    .slow(2),

  // Grinding meditation
  s("[hh:3 ~] [~ hh:3] [hh:3 hh:3] ~")
    .speed(0.7)
    .crush(10)
    .room(0.6)
    .gain(0.35)
    .hpf(1000),

  // Root canal drone - deep nerve pain
  n("[0, -12]")
    .scale("D1:mixolydian")
    .s("sawtooth")
    .lpf(200)
    .lpq(8)
    .gain(0.4)
    .slow(8)
    .room(0.7),

  // Choir of extracted wisdom
  n("<0 2 4 5 7 5 4 2>")
    .scale("D3:mixolydian")
    .s("triangle")
    .attack(0.8)
    .release(2)
    .lpf(1500)
    .room(0.85)
    .gain(0.35)
    .slow(1.5),

  // Clicking jaw bones
  s("cp? ~ cp ~ ~ cp? ~ cp")
    .room(0.7)
    .gain(0.4)
    .hpf(800),

  // Saliva drip
  s("~ ~ ~ ~ ~ ~ ~ hh:1?")
    .speed(0.5)
    .room(0.9)
    .gain(0.2)
    .slow(2)
)
