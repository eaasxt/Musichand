// Spring: Vernal Awakening
// A piece about rebirth, birdsong, and the first warm breeze

setcpm(72)

// Birdsong - staccato arpeggios that flutter and trill
let birds = note("e5 g5 a5 b5".add("<0 2 4 7>".slow(8)))
  .euclidLegato(5, 8)
  .s("triangle")
  .decay(.08).sustain(0)
  .lpf(sine.range(2000, 6000).slow(4))
  .delay(.3).delaytime(.125).delayfeedback(.4)
  .gain(.35)
  .pan(sine.range(0.2, 0.8).slow(3))

// Morning dew - gentle high plinks
let dew = note("c6 e6 g6 b6".add(12))
  .struct("t(3,8,<0 1 2>)")
  .s("sine")
  .decay(.15).sustain(0)
  .lpf(4000)
  .room(.8).size(.9)
  .gain(.2)
  .pan(rand)

// Awakening earth - deep, warm pad
let earth = note("<c3 g2 a2 f2>")
  .s("sawtooth")
  .lpf(sine.range(200, 800).slow(16))
  .attack(2).decay(1).sustain(.6).release(3)
  .room(.5).size(.7)
  .gain(.25)

// First rain - soft percussive texture
let rain = s("hh*8")
  .gain(perlin.range(.02, .15))
  .pan(rand)
  .lpf(perlin.range(3000, 8000))
  .delay(.2).delaytime(.0625).delayfeedback(.3)

// Heartbeat of spring - gentle pulse
let pulse = note("c2 ~ ~ c2 ~ e2 ~ ~")
  .s("triangle")
  .lpf(400)
  .gain(.4)
  .decay(.3).sustain(.1)

stack(
  birds,
  dew.slow(2),
  earth.slow(4),
  rain.gain(.08),
  pulse
)
