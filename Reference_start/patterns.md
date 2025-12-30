# Strudel Patterns Reference

Quick reference for common patterns and idioms.

## Drum Patterns

### Basic 4/4
```javascript
s("bd*4, ~ sd ~ sd, hh*8")
```

### Breakbeat
```javascript
s("bd ~ [~ bd] ~, ~ sd ~ [sd sd], hh*8")
```

### Trap Hi-hats
```javascript
s("hh*16").gain("1 .5 .7 .5 1 .5 .7 .5")
```

### Euclidean Rhythms
```javascript
// Classic patterns
s("bd(3,8)")    // Tresillo
s("sd(5,8)")    // Cinquillo  
s("hh(7,16)")   // Dense hats
s("cp(2,5)")    // Sparse clap
```

### Drum Fill
```javascript
s("bd*4, ~ sd ~ sd, hh*8")
  .every(8, x => x.fast(2).gain(1.2))  // Double-time every 8 bars
```

## Bass Patterns

### Simple Root
```javascript
n("0 0 0 0").scale("C2:minor").s("sawtooth").lpf(400)
```

### Octave Jump
```javascript
n("0 0 0 [0 12]").scale("C2:minor").s("sawtooth").lpf(600)
```

### Walking Bass
```javascript
n("0 2 4 5").scale("C2:minor").s("triangle").lpf(500)
```

### Acid Bass
```javascript
n("0 0 [0 3] [5 0]")
  .scale("C2:minor")
  .s("sawtooth")
  .lpf(sine.range(200, 1200).slow(4))
  .lpq(8)
```

### Sub Bass
```javascript
n("0").scale("C1:minor").s("sine").gain(0.8).slow(2)
```

## Melodic Patterns

### Simple Arp
```javascript
n("0 2 4 7").scale("C4:minor").s("triangle")
```

### Random Melody
```javascript
n(irand(8)).scale("C4:pentatonic").s("sine").room(0.3)
```

### Chord Stabs
```javascript
chord("<Cm7 Fm7 Gm7 Cm7>").voicing().s("sawtooth").lpf(800).room(0.4)
```

### Call and Response
```javascript
stack(
  n("0 2 4 ~").scale("C4:minor").s("square"),
  n("~ ~ ~ 7").scale("C4:minor").s("sine")
)
```

## Effects Chains

### Dub Space
```javascript
.room(0.6).size(4).delay(0.5).delaytime(0.375).delayfeedback(0.6)
```

### Lo-fi
```javascript
.lpf(1200).crush(6).room(0.3)
```

### Bright Lead
```javascript
.hpf(400).room(0.3).delay(0.2)
```

### Dark Pad
```javascript
.lpf(600).room(0.8).size(8).slow(4)
```

### Telephone
```javascript
.hpf(500).lpf(2000).gain(0.6)
```

## Modulation

### Filter Sweep
```javascript
.lpf(sine.range(200, 2000).slow(8))
```

### Random Volume
```javascript
.gain(perlin.range(0.5, 1))
```

### Panning
```javascript
.pan(sine.range(-1, 1).slow(4))
```

### Rhythmic Gain
```javascript
.gain("1 .5 .7 .5")
```

## Structure Patterns

### Intro (silence then music)
```javascript
"0!16 1!48".mask(
  stack(/* your patterns */)
)
```

### Build-up
```javascript
stack(
  s("hh*4").fast("<1 2 4 8>".slow(16)),
  s("bd*4")
)
```

### Drop with Filter
```javascript
.lpf("<400 400 400 400 2000>".slow(16))  // Opens on 5th bar
```

### Section Changes
```javascript
.when("0000111100001111", x => x.add(note("12")))
```

## Sample Banks

### Drum Machines
```javascript
.bank("RolandTR909")
.bank("RolandTR808")
.bank("RolandTR707")
.bank("RolandCompuRhythm1000")
.bank("AkaiLinn")
```

### GM Sounds (General MIDI)
```javascript
// Pianos
.s("gm_acoustic_grand_piano")
.s("gm_bright_acoustic_piano")
.s("gm_electric_grand_piano")
.s("gm_epiano1")
.s("gm_epiano2")

// Bass
.s("gm_acoustic_bass")
.s("gm_electric_bass_finger")
.s("gm_synth_bass_1")

// Strings
.s("gm_strings")
.s("gm_violin")

// Pads
.s("gm_pad_warm")
.s("gm_pad_polysynth")

// Leads
.s("gm_lead_square")
.s("gm_lead_sawtooth")
```

### Synths
```javascript
.s("sawtooth")
.s("square")
.s("triangle")
.s("sine")
```

## Scales

### Common Scales
```javascript
.scale("C:major")
.scale("C:minor")
.scale("C:dorian")
.scale("C:mixolydian")
.scale("C:pentatonic")
.scale("C:minor pentatonic")
.scale("C:blues")
```

### Jazz Scales
```javascript
.scale("C:lydian")
.scale("C:altered")
.scale("C:wholetone")
```

## Chord Progressions

### Pop (I-V-vi-IV)
```javascript
chord("<C G Am F>").voicing()
```

### Jazz ii-V-I
```javascript
chord("<Dm7 G7 Cmaj7>").voicing()
```

### Minor i-iv-VII-III
```javascript
chord("<Am Dm G C>").voicing()
```

### House
```javascript
chord("<Cm7 Fm7>").voicing()
```

## Full Examples

### Minimal Techno
```javascript
setcpm(130)
stack(
  s("bd*4"),
  s("[~ hh]*4").gain(0.5),
  s("~ cp ~ ~").room(0.3),
  n("0 0 3 0").scale("C2:minor").s("sawtooth")
    .lpf(perlin.range(200, 800).slow(8)).lpq(6)
)
```

### Lo-fi Hip Hop
```javascript
setcpm(85)
stack(
  s("[bd ~] [~ bd] sd ~").bank("RolandCompuRhythm1000"),
  n("<0 3 5 7>*2").scale("Dm:minor").s("gm_epiano1")
    .lpf(1000).room(0.5).crush(8),
  n("0 ~").scale("D2:minor").s("triangle").lpf(400)
)
```

### Ambient
```javascript
setcpm(60)
stack(
  chord("<Cmaj7 Am7 Fmaj7 G7>").voicing()
    .s("gm_pad_warm").room(0.9).size(8).slow(4),
  n("0 4 7").scale("C5:major").s("gm_celesta")
    .delay(0.6).delaytime(0.375).room(0.8)
    .arp("up").slow(2)
)
```

### Jungle/DnB
```javascript
setcpm(170)
stack(
  s("[bd ~ bd ~] [~ ~ bd ~] [~ bd ~ bd] [~ ~ ~ ~]"),
  s("~ sd ~ [sd sd]").room(0.2),
  s("hh*16").gain("1 .5 .7 .5 1 .5 .7 .5").pan(sine),
  n("0 ~ 0 [0 5]").scale("Am:minor").s("sawtooth").lpf(600)
)
```
