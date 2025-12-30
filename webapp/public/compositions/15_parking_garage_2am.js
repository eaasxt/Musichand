// PARKING GARAGE AT 2AM
// Concrete echo chamber - your footsteps, distant engines, existential dread

setcpm(76)

stack(
  // Footsteps - yours, getting faster
  s("bd:1 ~ bd:1 ~, ~ ~ [~ bd:1?] ~")
    .room(0.8)
    .size(8)
    .gain(0.5)
    .hpf(200),

  // Fluorescent flicker
  n("[4, 7]")
    .scale("E:minor")
    .s("square")
    .lpf(300)
    .gain(sine.range(0.1, 0.2).fast(7))
    .slow(8),

  // Distant car starting
  s("~ ~ ~ ~ ~ ~ ~ bd:3?")
    .lpf(1500)
    .hpf(400)
    .room(0.9)
    .gain(0.25)
    .slow(4),

  // Echo of your own breathing
  s("hh:3 ~ ~ hh:3?")
    .speed(0.4)
    .room(0.85)
    .size(10)
    .gain(0.2)
    .slow(2),

  // The hum of the structure itself
  n("[0, 7]")
    .scale("E1:minor")
    .s("triangle")
    .lpf(150)
    .gain(0.3)
    .slow(16),

  // Dripping from somewhere
  n("<7 9 7 11>".slow(4))
    .scale("E5:minor")
    .s("sine")
    .room(0.9)
    .delay(0.6)
    .delaytime(0.4)
    .delayfeedback(0.7)
    .gain(0.2)
    .slow(2),

  // Elevator ding - distant hope
  n("11")
    .scale("E5:minor")
    .s("triangle")
    .room(0.95)
    .gain(0.15)
    .slow(16)
    .degradeBy(0.6)
)
