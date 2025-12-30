// Winter: Crystalline Silence
// Ice, stillness, the stark beauty of frozen landscapes

setcpm(55)

// Ice crystals - high, pure, sparse
let crystals = note("e6 ~ ~ ~ b6 ~ ~ ~ g6 ~ ~ ~ ~ ~ ~ ~")
  .add("<0 7 12 5>".slow(16))
  .s("sine")
  .decay(.8).sustain(0)
  .room(.95).size(.98)
  .delay(.6).delaytime(.5).delayfeedback(.7)
  .gain(.15)
  .pan(rand)

// Frozen bells - distant church bells in snow
let bells = note("<e4 ~ ~ ~ ~ ~ ~ ~ b3 ~ ~ ~ ~ ~ ~ ~>")
  .s("triangle")
  .decay(2).sustain(.1).release(3)
  .lpf(1500)
  .room(.9).size(.95)
  .gain(.25)

// The long night - deep, hollow drone
let night = note("<e1 b0>".slow(8))
  .s("sawtooth")
  .lpf(sine.range(80, 200).slow(32))
  .attack(4).decay(2).sustain(.6).release(4)
  .gain(.3)

// Snowfall - barely perceptible texture
let snow = s("hh:4*16")
  .gain(perlin.range(.01, .06))
  .lpf(perlin.range(8000, 15000))
  .pan(rand)
  .room(.8).size(.9)

// Breath in cold air - occasional sighs
let breath = note("~ ~ ~ ~ ~ ~ ~ e3 ~ ~ ~ ~ ~ ~ ~ ~")
  .s("sine")
  .lpf(400)
  .attack(.5).decay(1).sustain(.2).release(1.5)
  .room(.85).size(.9)
  .gain(.2)

// Heartbeat slowing - minimal pulse
let heart = note("e1 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~")
  .s("sine")
  .lpf(100)
  .decay(.5).sustain(.1)
  .gain(.5)

// Northern lights - ethereal high harmonics
let aurora = note("[e5,b5,g6]".struct("t(2,16)"))
  .s("sine")
  .attack(1).decay(2).sustain(.3).release(2)
  .lpf(sine.range(2000, 5000).slow(24))
  .room(.9).size(.95)
  .gain(.08)
  .pan(sine.range(.2, .8).slow(7))

stack(
  crystals.slow(2),
  bells.slow(4),
  night.slow(2),
  snow.gain(.03),
  breath.slow(4),
  heart.slow(2),
  aurora.slow(4)
)
