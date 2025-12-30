# Strudel Code Examples for AI Training

This document contains curated Strudel code examples organized by complexity and musical purpose.

---

## Level 1: Fundamentals

### Simple Beats

```javascript
// Four-on-the-floor
s("bd*4")

// Basic rock
s("bd sd bd sd")

// With hihat
s("bd sd, hh*8")

// House kick pattern
s("bd*4, [- cp]*2")
```

### Simple Melodies

```javascript
// Scale run
note("c d e f g a b c5")

// Major triad arpeggio
note("c e g c5 g e")

// Simple hook
note("c c g g a a g")
```

### Basic Chords

```javascript
// Power chord
note("[c3, g3]")

// Major chord
note("[c, e, g]")

// Minor chord
note("[a, c, e]")
```

---

## Level 2: Rhythm Patterns

### Euclidean Rhythms

```javascript
// Tresillo
s("bd(3,8)")

// Cinquillo
s("bd(5,8)")

// West African bell
s("hh(7,12)")

// Son clave
s("bd(3,8,2), ~ cp")

// Rumba clave
s("bd(3,8,3)")
```

### Syncopation

```javascript
// Offbeat hihat
s("bd sd, [- hh]*4")

// Anticipated snare
s("bd [- sd] bd sd")

// Ghost notes
s("bd sd:1? bd sd, hh*8")
```

### Complex Subdivisions

```javascript
// Nested subdivisions
s("bd [hh [hh hh]] sd [hh oh]")

// Polyrhythm (3 against 4)
s("bd*3, hh*4")

// Polymeter
s("<bd sd hh, cp hh hh oh>*4")
```

---

## Level 3: Melodic Patterns

### Scale-Based Melodies

```javascript
// Pentatonic improvisation
n("0 2 4 5 7").scale("C:pentatonic")

// Dorian mode
n("0 1 2 3 4 5 6 7").scale("D:dorian")

// Blues scale
n("0 2 3 4 6").scale("A:blues")

// Bebop scale run
n("0 1 2 3 4 5 6 7").scale("C:bebop")
```

### Arpeggios

```javascript
// Major arpeggio with octave
n("0 2 4 7 4 2").scale("C:major")

// Minor 7th arpeggio
n("0 2 4 6").scale("A:minor")

// Diminished arpeggio
n("0 2 4 6").scale("B:diminished")
```

### Melodic Transformations

```javascript
// Reversed melody
note("c d e g").rev()

// Palindrome (forward then backward)
note("c d e g").palindrome()

// Rotating melody
note("c d e g").iter(4)

// Transposed sequence
note("c e g").add(note("<0 2 4>"))
```

---

## Level 4: Harmonic Patterns

### Chord Progressions

```javascript
// I-IV-V-I in C major
chord("<C F G C>").voicing()

// ii-V-I jazz
chord("<Dm7 G7 C^7>").voicing()

// vi-IV-I-V pop
chord("<Am F C G>").voicing()

// Minor blues
chord("<Cm7 Cm7 Cm7 Cm7 Fm7 Fm7 Cm7 Cm7 G7 Fm7 Cm7 G7>").voicing()
```

### Voicing Techniques

```javascript
// Close voicing
n("0 1 2 3").chord("Cm7").voicing()

// Drop voicing
chord("Dm7").dict('lefthand').voicing()

// Bass + chords
chord("<C Am F G>").layer(
  x => x.voicing(),
  x => x.rootNotes(2).s('bass')
)
```

### Modal Interchange

```javascript
// Borrowing from parallel minor
chord("<C Am Fm G>").voicing()

// Tritone substitution
chord("<Dm7 Db7 C^7>").voicing()

// Secondary dominants
chord("<C A7 Dm G7 C>").voicing()
```

---

## Level 5: Sound Design

### Filter Modulation

```javascript
// Acid bassline
note("c2*8").s("sawtooth")
  .lpf(sine.range(200, 2000).slow(4))
  .lpq(15).lpenv(4)

// Wah effect
s("guitar*4").bpf(sine.range(400, 2000))

// Filter sweep buildup
s("hh*16").lpf(saw.range(200, 8000).slow(16))
```

### Envelope Shaping

```javascript
// Plucky synth
note("c4 e4 g4 b4").s("sawtooth")
  .attack(0.01).decay(0.2).sustain(0)

// Pad sound
note("[c4,e4,g4]").s("triangle")
  .attack(0.5).decay(0.3).sustain(0.7).release(2)

// Percussive bass
note("c2*4").s("sawtooth")
  .attack(0.001).decay(0.1).sustain(0).lpf(400)
```

### FM Synthesis

```javascript
// Bell tone
note("c5 e5 g5 c6").s("sine").fm(7).fmi(2)

// Electric piano
note("[c4,e4,g4]").s("sine").fm(4).fmi(1)

// Metallic percussion
s("hh*8").fm(rand.range(1,8)).fmi(2)
```

---

## Level 6: Effects Processing

### Reverb Spaces

```javascript
// Small room
s("cp*4").room(0.2).roomsize(1)

// Large hall
note("c4 e4").s("piano").room(0.7).roomsize(8)

// Cathedral
note("[c3,e3,g3]").s("strings").room(1).roomsize(12)
```

### Delay Effects

```javascript
// Slapback delay
s("guitar*2").delay(0.3).delaytime(0.1).delayfeedback(0.2)

// Dub delay
s("rim*2").delay(0.6).delaytime(0.375).delayfeedback(0.7)

// Dotted eighth delay
s("synth*4").delay(0.5).delaytime(0.1875).delayfeedback(0.5)
```

### Distortion & Saturation

```javascript
// Light warmth
note("c2*4").s("sawtooth").shape(0.3)

// Heavy distortion
note("c1 c1 [c1 eb1]").s("sawtooth").distort(3).lpf(800)

// Lo-fi effect
s("bd sd, hh*4").crush(6).coarse(4)
```

---

## Level 7: Generative Music

### Random Selection

```javascript
// Random notes from scale
n(irand(8).segment(16)).scale("C:minor")

// Random rhythm
s("bd*8?0.5, hh*16?0.3")

// Random sound selection
s("<bd|sd|hh>*8")

// Perlin noise melody
n(perlin.range(0,12).segment(8)).scale("D:dorian")
```

### Probabilistic Patterns

```javascript
// Varied hi-hats
s("hh*16").sometimes(mul(speed(2)))

// Occasional variation
s("bd sd bd sd").every(4, fast(2))

// Rare accents
s("hh*8").rarely(mul(gain(1.5)))
```

### Evolving Patterns

```javascript
// Slowly changing melody
n(sine.range(0,7).segment(8).slow(8)).scale("A:pentatonic")

// Morphing rhythm
s("bd*<4 8 16 8>")

// Phase shifting
note("<c d e g>*[8, 8.1]").s("piano")
```

---

## Level 8: Complete Compositions

### Minimal Techno

```javascript
setcpm(130/4)
stack(
  s("bd*4").bank("RolandTR909"),
  s("[- cp]*2").bank("RolandTR909"),
  s("[hh hh hh oh]*2").bank("RolandTR909").gain(0.6),
  note("c2*8").s("sawtooth").lpf(sine.range(200,800).slow(8)).lpq(10)
).room(0.2)
```

### Lo-Fi Hip Hop

```javascript
setcpm(85/4)
stack(
  s("bd ~ [bd bd] ~, ~ sd ~ sd?").bank("RolandTR808"),
  s("hh*8?0.7").bank("RolandTR808").gain(0.4),
  chord("<Fm7 Bb7 Eb^7 Ab^7>").voicing().s("electric_piano")
    .lpf(2000).room(0.4)
).crush(8).coarse(4)
```

### Ambient Pad

```javascript
setcpm(60/4)
chord("<Cm9 Fm9 Gm7 Cm9>/2")
  .voicing().s("pad_choir")
  .attack(2).release(4)
  .lpf(sine.range(500,2000).slow(16))
  .room(0.8).roomsize(10)
  .delay(0.3).delaytime(0.5).delayfeedback(0.4)
```

### Drum & Bass

```javascript
setcpm(174/4)
stack(
  s("bd ~ ~ ~ bd ~ ~ bd, ~ ~ ~ ~ ~ cp ~ ~").bank("RolandTR909"),
  s("hh*16?0.8").bank("RolandTR909").gain(0.5),
  note("<c2 [c2 c2] c2 [c2 c2 c2], ~ ~ eb2 ~>")
    .s("sawtooth").lpf(400).gain(0.8)
)
```

### Jazz Trio

```javascript
setcpm(140/4)
chord("<Dm7 G7 C^7 A7>*2").layer(
  // Comping
  x => x.struct("[~ x]*2").voicing().s("electric_piano").room(0.3),
  // Bass walk
  x => n("0 2 4 5").set(x).voicing().add(note(-24)).s("bass"),
  // Ride cymbal
  () => s("rd*4, ~ rd").gain(0.5)
)
```

---

## Level 9: Advanced Techniques

### Sample Manipulation

```javascript
// Granular-style chopping
samples('github:yaxu/clean-breaks')
s("amen/4").fit().chop(32)
  .sometimesBy(0.3, mul(speed(-1)))
  .sometimes(ply(2))

// Wavetable synthesis
samples('github:bubobubobubobubo/dough-waveforms')
note("c2*8").s("wt_dbass").n(run(8))
  .lpf(perlin.range(100,1000).slow(8))
```

### Layered Sound Design

```javascript
// Supersaw pad
note("[c4,e4,g4,b4]").layer(
  x => x.s("sawtooth").detune(0),
  x => x.s("sawtooth").detune(5),
  x => x.s("sawtooth").detune(-5),
  x => x.s("sawtooth").detune(10),
  x => x.s("sawtooth").detune(-10)
).gain(0.3).lpf(3000).room(0.5)
```

### Polymetric Structures

```javascript
// 7/8 over 4/4
s("<bd sd hh sd bd hh sd>*4, bd*4")

// Phasing (Reich-style)
note("<c d e g>*[12, 12.1]").s("marimba")

// Multiple time signatures
stack(
  s("bd*4"),
  s("<hh hh oh>*4"),
  n("<0 2 4 5 7>").scale("C:major").s("piano")
)
```

---

## Pattern Variations Template

Use this template to generate variations:

```javascript
// Base pattern
const BASE = s("bd sd, hh*4")

// Tempo variation
BASE.cpm(90)
BASE.cpm(120)
BASE.cpm(150)

// Sound variation
BASE.bank("RolandTR808")
BASE.bank("RolandTR909")
BASE.bank("AkaiLinn")

// Rhythmic variation
BASE.ply(2)
BASE.euclid(3,8)
BASE.swing(4)

// Effect variation
BASE.room(0.3)
BASE.delay(0.4)
BASE.lpf(2000)
```
