// Synth Test - No Samples Required
// Pure synthesizer sounds for testing visualizations

setcpm(120)

stack(
  // Simple bass - sawtooth wave
  note("c2 c2 g2 c2")
    .s("sawtooth")
    .lpf(400)
    .gain(0.6),

  // Chords - triangle wave
  note("<[c4,e4,g4] [f4,a4,c5] [g4,b4,d5] [c4,e4,g4]>")
    .s("triangle")
    .lpf(2000)
    .gain(0.4)
    .room(0.3),

  // Lead melody - square wave
  note("c5 e5 g5 e5 c5 d5 e5 c5")
    .s("square")
    .lpf(1500)
    .gain(0.25)
    .delay(0.3)
    .delaytime(0.25)
)
