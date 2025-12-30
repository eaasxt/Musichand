// VENDING MACHINE REQUIEM
// The soul of a machine that dispenses comfort - hum, clunk, illumination, disappointment

setcpm(88)

stack(
  // Compressor cycle - the heartbeat
  s("bd:1 ~ ~ ~ bd:1 ~ ~ ~")
    .lpf(200)
    .gain(0.5)
    .room(0.4),

  // Fluorescent tube hum
  n("[0, 7]")
    .scale("F:major")
    .s("square")
    .lpf(250)
    .gain(0.15)
    .slow(16),

  // Selection buttons being pressed
  s("~ ~ cp? ~")
    .gain(0.4)
    .room(0.5)
    .sometimes(x => x.fast(2)),

  // Spiral rotation - item falling
  n("[2 4 5 7]")
    .scale("F3:major")
    .s("triangle")
    .gain(0.35)
    .room(0.6)
    .every(4, x => x.fast(2))
    .slow(2),

  // The satisfying thunk
  s("~ ~ ~ ~ ~ ~ ~ bd:3")
    .lpf(400)
    .hpf(100)
    .gain(0.6)
    .room(0.5)
    .slow(4),

  // Coins jingling memory
  s("hh:2*<2 4 2 0>")
    .speed(1.5)
    .gain(0.25)
    .hpf(3000)
    .pan(rand)
    .room(0.3),

  // The glow of possibility
  n("<[0, 4, 7] [2, 5, 9]>")
    .scale("F3:major")
    .s("sine")
    .attack(0.5)
    .release(2)
    .lpf(1500)
    .room(0.7)
    .gain(0.3)
    .slow(4)
)
