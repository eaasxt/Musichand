// STATIC CLING
// Laundry fresh from the dryer - crackling electricity, warm fabrics, domestic chaos

setcpm(132)

stack(
  // The tumble cycle
  s("[bd ~] [~ sd] [bd bd] [~ sd]")
    .gain(0.75)
    .room(0.3),

  // Static discharge - random crackles
  s("hh*16?0.4")
    .speed(rand.range(1.5, 3))
    .gain(rand.range(0.1, 0.4))
    .pan(rand)
    .hpf(6000)
    .room(0.2),

  // Fabric softener melody - synthetic sweetness
  n("<[0 2] [4 5]> <[7 5] [4 2]>")
    .scale("G:major")
    .s("square")
    .lpf(1200)
    .lpq(3)
    .gain(0.4)
    .room(0.4)
    .delay(0.2)
    .delaytime(0.125)
    .delayfeedback(0.3),

  // Zipper clicks
  s("~ cp? ~ [cp cp]?")
    .gain(0.35)
    .hpf(3000)
    .room(0.3),

  // The warm bass of the motor
  n("0 0 [0 0] 0")
    .scale("G1:major")
    .s("triangle")
    .lpf(200)
    .gain(0.5),

  // Sock disappearing to another dimension
  n("7")
    .scale("G5:major")
    .s("sine")
    .gain(0.15)
    .room(0.95)
    .delay(0.7)
    .delaytime(0.5)
    .delayfeedback(0.8)
    .slow(8)
    .pan(saw.slow(4))
)
