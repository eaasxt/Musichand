// GRAVITATIONAL LENSING
// The sound of light bending around a black hole - time dilates, frequencies warp

setcpm(67)

stack(
  // The event horizon - impossibly slow bass that feels like it's being stretched
  n("0 . . . -5 . . 0")
    .scale("F:locrian")
    .s("sawtooth")
    .lpf(sine.range(80, 400).slow(32))
    .lpq(15)
    .gain(0.7)
    .room(0.9)
    .size(12)
    .slow(2),

  // Photons spiraling inward - getting faster as they approach
  n("<0 2 4> <1 3 5> <2 4 6> <0 3 7>")
    .scale("F3:locrian")
    .s("triangle")
    .fast("<1 1.5 2 3>".slow(16))
    .pan(sine.slow(3))
    .delay(0.6)
    .delaytime(0.333)
    .delayfeedback(0.7)
    .lpf(2000)
    .gain(0.4),

  // Hawking radiation - random quantum sparks escaping
  n(perlin.range(0, 11).segment(32))
    .scale("F5:chromatic")
    .s("sine")
    .gain(perlin.range(0, 0.3))
    .pan(rand)
    .room(0.8)
    .hpf(2000)
    .sometimes(x => x.fast(2)),

  // Gravitational waves - the fabric of spacetime rippling
  s("bd:3")
    .lpf(200)
    .slow(4)
    .room(0.95)
    .size(20)
    .gain(0.5)
    .shape(0.3)
)
