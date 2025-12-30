// Autumn: Amber Descent
// Falling leaves, warm decay, the beauty of letting go

setcpm(85)

// Falling leaves - polyrhythmic descent patterns
let leaves = note("a5 g5 e5 d5 c5 a4 g4 e4")
  .struct("t(5,8)")
  .s("triangle")
  .decay(.2).sustain(.1).release(.3)
  .lpf(sine.range(1500, 4000).slow(8))
  .delay(.4).delaytime(.333).delayfeedback(.5)
  .room(.6).size(.8)
  .gain(.3)
  .pan(perlin.range(0.1, 0.9))

// Second layer of leaves - offset rhythm
let leaves2 = note("d5 c5 a4 g4 f4 d4 c4 a3")
  .struct("t(7,12)")
  .s("triangle")
  .decay(.25).sustain(.05).release(.4)
  .lpf(2500)
  .delay(.3).delaytime(.25).delayfeedback(.4)
  .room(.5).size(.7)
  .gain(.2)
  .pan(perlin.range(0.2, 0.8).slow(2))

// Warm amber pad - the golden hour light
let amber = note("<[a2,c3,e3] [g2,b2,d3] [f2,a2,c3] [e2,g2,b2]>")
  .s("sawtooth")
  .lpf(sine.range(400, 1200).slow(16))
  .attack(1.5).decay(2).sustain(.5).release(2)
  .room(.7).size(.85)
  .gain(.2)

// Melancholic melody - memories of summer
let memory = note("a4 ~ c5 ~ b4 a4 ~ g4 ~ ~ e4 ~ ~ ~ ~ ~")
  .s("sine")
  .lpf(1800)
  .attack(.1).decay(.4).sustain(.3).release(.5)
  .vib(0.02)
  .room(.6).size(.75)
  .gain(.35)

// Gentle percussion - wind through dry leaves
let wind = s("~ hh:3 ~ ~ hh:1 ~ hh:2 ~")
  .gain(perlin.range(.05, .2))
  .lpf(perlin.range(2000, 6000))
  .pan(perlin.range(.2, .8))
  .room(.4)

// Deep roots - the earth preparing for rest
let roots = note("<a1 ~ ~ ~ g1 ~ ~ ~ f1 ~ ~ ~ e1 ~ ~ ~>")
  .s("sine")
  .lpf(150)
  .gain(.6)
  .attack(.5).decay(.5).sustain(.8)

stack(
  leaves,
  leaves2.slow(1.5),
  amber.slow(4),
  memory.slow(2),
  wind,
  roots.slow(4)
)
