// BONE LIBRARY
// Ancient ossuary where knowledge is stored in marrow - skeletal, reverent, deep

setcpm(54)

stack(
  // Vertebrae percussion - clicking, hollow
  s("<[cp ~] [~ cp ~] [cp cp ~]> <[~ cp] [cp ~ cp] [~ ~ cp]>")
    .room(0.85)
    .size(10)
    .gain(0.5)
    .hpf(800)
    .slow(1.5),

  // Femur bass - resonant, hollow
  n("0 ~ ~ ~ -7 ~ 0 ~")
    .scale("B:phrygian")
    .s("triangle")
    .lpf(250)
    .room(0.7)
    .gain(0.6)
    .slow(2),

  // Skull choir - whispered harmonics
  n("[0, 3, 7, 11]")
    .scale("B2:phrygian")
    .s("triangle")
    .attack(1.5)
    .release(3)
    .lpf(1200)
    .room(0.9)
    .size(15)
    .gain(0.35)
    .slow(4),

  // Finger bones on ancient texts
  n(irand(7).segment(5))
    .scale("B4:phrygian")
    .s("triangle")
    .gain(0.3)
    .room(0.8)
    .delay(0.5)
    .delaytime(0.666)
    .delayfeedback(0.6)
    .degradeBy(0.3)
    .slow(0.75),

  // The breath between ribs
  s("~ ~ ~ bd:1?")
    .lpf(100)
    .gain(0.4)
    .room(0.9)
    .slow(4)
)
