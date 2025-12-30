// Generated from: test_track.wav
// Key: A minor, BPM: 117.45383522727273

setcpm(117)

stack(
  // Drums
  s("~ ~ ~ ~, ~ sd sd sd, hh*2").bank("RolandTR909"),
  // Bass
  n("6 0 0 0").scale("A2:minor").s("sawtooth").lpf(400).gain(0.8),
  // Chords
  chord("<A A A A>").voicing().s("gm_pad_warm").room(0.5).gain(0.6)
)