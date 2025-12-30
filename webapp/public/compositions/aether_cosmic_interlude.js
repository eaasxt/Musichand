// Aether: The Cosmic Interlude
// The fifth season - beyond time, between worlds
// A liminal space where the fabric of reality shimmers

setcpm(93)

// The cosmic hum - a drone from the void between stars
let void_drone = note("[c1,g1,d2,a2]".add(sine.range(-0.1, 0.1).slow(23)))
  .s("sawtooth")
  .lpf(sine.range(100, 400).slow(17))
  .attack(4).decay(3).sustain(.7).release(5)
  .room(.99).size(.99)
  .gain(.2)

// Probability stars - notes that may or may not sound
let stars = note("c5 d5 e5 f#5 g#5 a#5 c6 d6".add("<0 2 5 7>".slow(11)))
  .struct("t(5,13)")
  .s("sine")
  .decay(.3).sustain(0)
  .lpf(6000)
  .delay(.7).delaytime(.618).delayfeedback(.75)
  .room(.9).size(.95)
  .gain(perlin.range(0, .4))
  .pan(rand)

// Whole tone wandering - alien melody
let alien = note("c4 d4 e4 f#4 g#4 a#4 c5 a#4 g#4 f#4 e4 d4")
  .struct("t(7,16,<0 3 7 11>)")
  .s("triangle")
  .lpf(sine.range(800, 3000).slow(7))
  .attack(.1).decay(.4).sustain(.2).release(.6)
  .room(.8).size(.85)
  .gain(.25)
  .pan(sine.range(.1, .9).slow(5))

// Chromatic shivers - reality glitching
let glitch = note("c6 c#6 d6 d#6 e6 f6 f#6 g6".add(12))
  .struct("t(3,8,<0 1 2 5>)".slow(3))
  .s("square")
  .lpf(4000)
  .decay(.02).sustain(0)
  .gain(.1)
  .pan(rand)
  .delay(.3).delaytime(.0833).delayfeedback(.5)

// Polymetric pulse - time itself bending
let time_a = note("c2 ~ ~ eb2 ~ ~ g2 ~ ~".slow(1.5))
  .s("sine")
  .lpf(300)
  .decay(.2).sustain(.4)
  .gain(.4)

let time_b = note("~ g2 ~ ~ c3 ~ ~")
  .s("sine")
  .lpf(400)
  .decay(.3).sustain(.3)
  .gain(.35)

// The breath of eternity - slow, vast modulation
let eternity = note("<[c3,e3,g3,b3] [d3,f#3,a3,c4] [e3,g#3,b3,d4] [f3,a3,c4,e4]>".slow(2))
  .s("sawtooth")
  .lpf(sine.range(500, 2000).slow(31))
  .attack(3).decay(4).sustain(.5).release(4)
  .room(.95).size(.98)
  .gain(.12)

// Dimensional rift - occasional bursts of chaos
let rift = s("~ ~ ~ ~ ~ ~ ~ [bd:4 hh:8 sd:3]")
  .sometimes(x => x.speed(rand.range(.5, 2)))
  .lpf(perlin.range(1000, 8000))
  .room(.7)
  .gain(.3)
  .pan(rand)

stack(
  void_drone.slow(4),
  stars,
  alien.slow(2),
  glitch.slow(4),
  time_a,
  time_b,
  eternity.slow(4),
  rift.slow(4)
)
