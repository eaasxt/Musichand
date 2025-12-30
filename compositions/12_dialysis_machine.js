// DIALYSIS MACHINE
// The rhythm of mechanical kidneys - clinical, vital, the sound of borrowed time

setcpm(63)

stack(
  // Pump cycle - systemic, unchanging
  s("[bd ~] [~ bd] [bd ~] [~ bd]")
    .lpf(300)
    .gain(0.6)
    .room(0.3),

  // Blood flowing through tubes
  n("0 2 0 3 0 2 0 4")
    .scale("C:dorian")
    .s("sine")
    .lpf(sine.range(200, 500).slow(8))
    .gain(0.5)
    .pan(sine.range(-0.3, 0.3).slow(4)),

  // Filter membrane oscillation
  s("hh:2*8")
    .speed(0.6)
    .gain("0.2 0.15 0.2 0.18 0.2 0.15 0.2 0.17")
    .hpf(2000)
    .room(0.4),

  // Toxins being extracted - random debris
  n(irand(5).segment(7))
    .scale("C4:dorian")
    .s("square")
    .lpf(600)
    .gain(0.15)
    .pan(rand)
    .crush(12)
    .room(0.5)
    .degradeBy(0.4),

  // Alarm potential - always watching
  n("[7, 11]")
    .scale("C5:dorian")
    .s("triangle")
    .gain(0.1)
    .hpf(3000)
    .slow(8)
    .sometimesBy(0.1, x => x.gain(0.4)),

  // The patient's heartbeat - slightly irregular from stress
  s("bd:1 ~ ~ ~ bd:1 ~ ~ bd:1?")
    .lpf(150)
    .gain(0.4)
    .room(0.5)
    .slow(2)
)
