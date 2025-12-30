// Summer: Solstice Heat
// Blazing sun, endless days, the pulse of life at its peak

setcpm(126)

// The heat shimmer - filtered acid line that wavers like hot air
let heat = note("c2 c2 c3 c2 eb2 eb2 c2 g2")
  .s("sawtooth")
  .lpf(sine.range(300, 2400).slow(4).add(perlin.range(-200, 200)))
  .resonance(15)
  .decay(.15).sustain(.3)
  .distort(.3)
  .gain(.5)

// Four on the floor - the relentless summer sun
let kick = s("bd*4")
  .gain(.9)
  .lpf(800)

// Offbeat hats - cicadas in the afternoon
let hats = s("~ hh ~ hh ~ hh ~ [hh hh]")
  .gain(perlin.range(.3, .6))
  .lpf(sine.range(6000, 12000).slow(2))
  .pan(sine.range(.3, .7).slow(1.5))

// Bright stabs - sun flares
let stabs = note("<[c4,eb4,g4] ~ ~ ~ [f4,ab4,c5] ~ ~ ~>")
  .s("square")
  .lpf(2000)
  .decay(.1).sustain(0)
  .room(.4).size(.5)
  .gain(.25)
  .pan(rand)

// Rolling bass - waves of heat
let rolling = note("c1 ~ c1 ~ c1 ~ c1 c1".add("<0 0 5 5>".slow(4)))
  .s("sine")
  .gain(.7)
  .lpf(200)

// Shimmering high frequencies - mirage
let mirage = note("c7 g7 eb7 bb6".struct("t(7,16)"))
  .s("sine")
  .gain(.08)
  .decay(.05).sustain(0)
  .delay(.5).delaytime(.166).delayfeedback(.6)
  .pan(rand)

stack(
  kick,
  heat,
  hats,
  stabs.slow(2),
  rolling,
  mirage
)
