// Musicman Demo - Pure Synth Version (no samples needed)
// A minor, 120 BPM

setcpm(120/4)

stack(
  // Kick-like - low sine with fast attack
  s("sine")
    .note("c1")
    .decay(0.15)
    .sustain(0)
    .gain(0.9)
    .lpf(100)
    .fast(4),

  // Snare-like - noise burst
  s("noise")
    .decay(0.1)
    .sustain(0)
    .gain(0.4)
    .lpf(6000)
    .hpf(2000)
    .fast(2)
    .late(0.5),

  // Hi-hat-like - high noise
  s("noise")
    .decay(0.05)
    .sustain(0)
    .gain(0.2)
    .lpf(15000)
    .hpf(8000)
    .fast(8),

  // Bass - A minor pattern
  n("0 ~ 3 ~ 5 ~ 3 ~")
    .scale("A2:minor")
    .s("sawtooth")
    .lpf(400)
    .decay(0.3)
    .sustain(0.5)
    .gain(0.5),

  // Pad chords - Am, F, C, G using scale degrees
  n("<[0,4,7] [5,9,12] [7,11,14] [2,5,9]>")
    .scale("A3:minor")
    .s("triangle")
    .attack(0.1)
    .decay(0.5)
    .sustain(0.7)
    .lpf(1500)
    .room(0.3)
    .gain(0.35)
    .slow(2)
)
