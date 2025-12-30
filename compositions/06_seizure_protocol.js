// SEIZURE PROTOCOL
// Neural misfiring, synaptic chaos, the brain's electrical storm - glitchy, fractured, urgent

setcpm(175)

stack(
  // Erratic heartbeat trying to keep up
  s("<bd [bd bd] bd ~> <bd ~ [bd ~] bd> <[bd bd] ~ bd bd>")
    .gain(0.8)
    .sometimes(x => x.speed(0.5))
    .rarely(x => x.fast(2)),

  // Synaptic misfires
  n("<[0 5] [~ 3] [7 ~] [2 0]> <[3 ~] [0 7] [~ 5] [0 ~]>".fast(2))
    .scale("Db:chromatic")
    .s("square")
    .lpf(rand.range(400, 4000).segment(16))
    .lpq(8)
    .gain(0.4)
    .pan(rand)
    .crush(7),

  // High frequency interference
  s("hh*<8 16 32 16>")
    .speed("<1 1.5 2 0.75>")
    .gain("0.3 0.1 0.2 0.4".fast(4))
    .pan(sine.fast(11))
    .hpf(5000),

  // Trying to find ground
  n("0")
    .scale("Db1:minor")
    .s("sine")
    .lpf(80)
    .gain(0.5)
    .every(4, x => x.gain(0)),

  // Fragmented thoughts - melody trying to form
  n("[0 2] ~ [4 ~] 5 ~ [7 4] [2 ~] 0")
    .scale("Db3:minor")
    .s("triangle")
    .lpf(1500)
    .gain(0.35)
    .room(0.3)
    .sometimesBy(0.4, x => x.rev())
    .sometimesBy(0.2, x => x.fast(2)),

  // Static bursts
  s("~ ~ ~ hh:0?")
    .speed(0.3)
    .lpf(3000)
    .hpf(1000)
    .gain(0.3)
    .room(0.4)
    .fast(2)
)
