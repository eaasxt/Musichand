# Strudel Knowledge Base for AI Music Generation

This document synthesizes all insights from the Strudel documentation for use in training AI models to generate Strudel code and understanding the pattern language.

---

## Core Philosophy

**Strudel** is a browser-based live coding music environment that ports TidalCycles to JavaScript. The fundamental paradigm is:

1. **Patterns as Functions**: Patterns are pure functions that take a time span and return events
2. **Cycle-Based Time**: Music is organized into cycles (default: 0.5 CPS = 1 cycle per 2 seconds)
3. **Functional Reactive Programming**: Patterns are immutable; transformations create new patterns
4. **Composability**: All operations can be chained and nested

---

## Mini-Notation Reference

The mini-notation is a compact DSL for expressing rhythmic patterns.

### Basic Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `space` | Sequence events | `"bd sd hh"` |
| `[]` | Group/subdivide | `"bd [hh hh]"` |
| `<>` | Alternate per cycle | `"<bd sd hh>"` |
| `,` | Parallel/layer | `"bd, hh*4"` |
| `*n` | Speed up n times | `"bd*4"` |
| `/n` | Slow down n times | `"bd/2"` |
| `~` or `-` | Rest/silence | `"bd ~ sd ~"` |
| `:n` | Sample number | `"hh:2"` |
| `@n` | Weight/elongate | `"bd@2 sd"` |
| `!n` | Replicate | `"bd!3 sd"` |
| `?` | 50% random removal | `"hh*8?"` |
| `?0.n` | n% removal chance | `"hh*8?0.2"` |
| `\|` | Random choice | `"bd \| sd \| hh"` |
| `(p,s)` | Euclidean rhythm | `"bd(3,8)"` |
| `(p,s,o)` | Euclidean with offset | `"bd(3,8,2)"` |

### Nesting Examples

```javascript
// Simple sequence
note("c d e g")

// Subdivided time
note("c [d e] g [a b c5]")

// Alternating per cycle
note("<c e> <d g>")

// Parallel voices
note("[c, e, g]")  // chord

// Combined
note("<[c e g] [d f a]>*2, c2")
```

---

## Core Functions

### Sound Generation

| Function | Description | Example |
|----------|-------------|---------|
| `sound(name)` / `s(name)` | Play sample | `s("bd sd")` |
| `note(pitch)` | Play note | `note("c4 e4 g4")` |
| `n(number)` | Sample/note number | `n("0 2 4").s("piano")` |
| `bank(name)` | Select drum bank | `s("bd").bank("RolandTR909")` |

### Tempo Control

| Function | Description | Example |
|----------|-------------|---------|
| `setcps(n)` | Cycles per second | `setcps(0.5)` |
| `setcpm(n)` | Cycles per minute | `setcpm(120/4)` |
| `cpm(n)` | Pattern-level CPM | `s("bd*4").cpm(90)` |

### Time Modifiers

| Function | Mini-notation | Description |
|----------|---------------|-------------|
| `slow(n)` | `/n` | Slow down |
| `fast(n)` | `*n` | Speed up |
| `early(n)` | - | Shift left |
| `late(n)` | - | Shift right |
| `rev()` | - | Reverse |
| `palindrome()` | - | Alternate reverse |
| `iter(n)` | - | Rotate subdivisions |
| `ply(n)` | - | Repeat each event |
| `euclid(p,s)` | `(p,s)` | Euclidean rhythm |
| `segment(n)` | - | Discretize continuous signals |
| `swing(n)` | - | Add swing feel |
| `ribbon(o,c)` | - | Loop portion of pattern |

### Tonal Functions

| Function | Description | Example |
|----------|-------------|---------|
| `scale(name)` | Apply scale | `n("0 2 4 6").scale("C:minor")` |
| `transpose(n)` | Semitone shift | `note("c e g").transpose(5)` |
| `scaleTranspose(n)` | Scale step shift | `n("0 2 4").scale("C:major").scaleTranspose(2)` |
| `voicing()` | Chord voicings | `chord("Cm7").voicing()` |
| `chord(name)` | Set chord | `n("0 1 2 3").chord("Am7").voicing()` |

### Continuous Signals

| Signal | Range | Description |
|--------|-------|-------------|
| `sine` | 0-1 | Sine wave LFO |
| `cosine` | 0-1 | Cosine LFO |
| `saw` | 0-1 | Sawtooth LFO |
| `tri` | 0-1 | Triangle LFO |
| `square` | 0-1 | Square LFO |
| `rand` | 0-1 | Random noise |
| `perlin` | 0-1 | Perlin noise (smooth) |
| `irand(n)` | 0 to n-1 | Random integers |

**Signal Methods:**
```javascript
sine.range(100, 1000)     // Scale to range
sine.slow(4)              // Slow down LFO
sine.segment(16)          // Sample 16 times per cycle
perlin.range(0.5, 1)      // Smooth random in range
```

---

## Audio Effects

### Signal Chain Order
1. Sound source (sample/oscillator)
2. Gain + ADSR envelope
3. Lowpass filter (`lpf`)
4. Highpass filter (`hpf`)
5. Bandpass filter (`bpf`)
6. Vowel filter
7. Sample rate reduction (`coarse`)
8. Bit crushing (`crush`)
9. Waveshape distortion (`shape`)
10. Normal distortion (`distort`)
11. Tremolo
12. Compressor
13. Panning
14. Phaser
15. Postgain
16. Split to: Dry / Delay / Reverb

### Filter Effects

```javascript
// Lowpass filter
s("bd*4").lpf(800)           // Cutoff frequency
s("bd*4").lpf(800).lpq(10)   // With resonance
s("bd*4").lpf("500:10")      // Mini-notation format

// Highpass filter
s("bd*4").hpf(200).hpq(5)

// Bandpass filter
s("bd*4").bpf(1000).bpq(2)

// Vowel filter
note("c2*4").s("sawtooth").vowel("<a e i o u>")
```

### Filter Envelopes

```javascript
// Attack-decay envelope on filter
note("c2").s("sawtooth")
  .lpf(300)
  .lpenv(4)    // Envelope depth (semitones)
  .lpa(0.1)    // Attack time
  .lpd(0.3)    // Decay time
  .lps(0.2)    // Sustain level
  .lpr(0.5)    // Release time
```

### Amplitude Envelope (ADSR)

```javascript
note("c4").s("sawtooth")
  .attack(0.1)     // Attack time (seconds)
  .decay(0.2)      // Decay time
  .sustain(0.5)    // Sustain level (0-1)
  .release(0.3)    // Release time

// Shorthand
note("c4").s("sawtooth").adsr(".1:.2:.5:.3")
```

### Spatial Effects

```javascript
// Panning (0 = left, 0.5 = center, 1 = right)
s("bd sd").pan("<0 1>")

// Reverb
s("bd sd").room(0.5).roomsize(4)

// Delay
s("bd sd").delay(0.5).delaytime(0.25).delayfeedback(0.6)
```

### Modulation Effects

```javascript
// Tremolo (amplitude modulation)
note("c4").s("sawtooth").tremolosync(4).tremolodepth(0.5)

// Phaser
s("supersaw").phaser(4)

// Vibrato (pitch modulation)
note("c4").s("sawtooth").vib("4:.2")  // rate:depth
```

### Distortion

```javascript
// Waveshaping
s("supersaw").shape(0.5)

// Distortion
s("supersaw").distort(2)

// Bit crushing
s("bd*4").crush(4)   // Number of bits

// Sample rate reduction
s("bd*4").coarse(8)
```

---

## Pattern Composition

### Stacking Patterns

```javascript
// Parallel with comma
s("bd*4, hh*8, ~ cp")

// Using stack()
stack(
  s("bd*4"),
  s("hh*8"),
  s("~ cp")
)

// Layer with transformations
note("c e g").layer(
  x => x.s("piano"),
  x => x.s("strings").add(note(12))
)
```

### Conditional Modifiers

```javascript
// Apply sometimes (50%)
s("hh*8").sometimes(fast(2))

// Custom probability
s("hh*8").sometimesBy(0.3, fast(2))  // 30% chance

// Named probabilities
s("hh*8").rarely(ply(2))             // ~25%
s("hh*8").often(ply(2))              // ~75%
s("hh*8").almostAlways(ply(2))       // ~90%

// Every n cycles
s("hh*8").every(4, fast(2))

// Conditional on cycle number
s("hh*8").when(c => c % 4 == 0, fast(2))
```

### Value Operations

```javascript
// Add to parameter
note("c4").add(note(5))       // Add 5 semitones
note("c4").add(note("<0 7>")) // Pattern of additions

// Multiply
s("bd*4").mul(speed(1.5))

// Set parameter
n("0 2 4").set(s("piano"))
```

---

## Common Patterns

### Drum Machine Notation

```javascript
// Standard 4/4 beat
s("bd*4, ~ cp ~ cp, hh*8")

// With bank
s("bd sd ~ sd, hh*8").bank("RolandTR909")

// Drum abbreviations:
// bd = bass drum       sd = snare drum
// hh = closed hihat    oh = open hihat
// cp = clap            rim = rimshot
// lt/mt/ht = toms      rd = ride, cr = crash
```

### Common Drum Banks

- `RolandTR808` - Classic hip-hop/electronic
- `RolandTR909` - House/techno standard
- `RolandTR707` - 80s pop/synthpop
- `RolandTR505` - Budget 80s drum machine
- `AkaiLinn` - LinnDrum sounds
- `RhythmAce` - Vintage rhythm box

### Euclidean Rhythm Examples

```javascript
// Tresillo (Cuban) - 3 hits over 8 steps
s("bd(3,8)")

// Pop Clave
s("bd(3,8), ~ cp")

// Rumba Clave - with rotation
s("bd(3,8,2)")

// Samba - 3 over 16 with offset
s("bd(3,16,14)")

// Bossa Nova
s("bd(5,8)")
```

### Chord Progressions

```javascript
// Using chord symbols
chord("<Cm7 Fm7 G7 Cm7>").voicing()

// With voicing dictionary
chord("<C^7 A7 Dm7 G7>").dict('ireal').voicing()

// Chord + bass line
chord("<C^7 Am7 Dm7 G7>*2").layer(
  x => x.struct("[~ x]*2").voicing(),
  x => n("0*4").set(x).mode("root:g2").voicing().s('bass')
)
```

### Scale Patterns

```javascript
// Pentatonic melody
n(irand(5).segment(16)).scale("C:pentatonic")

// Minor scale arpeggios
n("0 2 4 7").scale("A:minor")

// Common scales:
// major, minor, dorian, phrygian, lydian,
// mixolydian, locrian, pentatonic, blues,
// bebop, melodic_minor, harmonic_minor
```

---

## Sample Loading

```javascript
// From GitHub repository
samples('github:tidalcycles/dirt-samples')

// From URL object
samples({
  'kick': 'https://example.com/kick.wav',
  'snare': 'https://example.com/snare.wav'
})

// Using loaded samples
s("kick snare")
```

---

## Synth Oscillators

```javascript
// Basic waveforms
note("c4").s("sine")
note("c4").s("triangle")
note("c4").s("sawtooth")
note("c4").s("square")
note("c4").s("pulse")    // Variable pulse width

// Supersaw (detuned saws)
note("c4").s("supersaw")

// FM synthesis
note("c4").s("sawtooth").fm(4)   // FM modulation ratio
note("c4").s("sawtooth").fmi(2)  // FM modulation index
```

---

## Code Patterns for AI Training

### Pattern 1: Basic Beat
```javascript
setcpm(120/4)
s("bd sd bd sd, hh*8").bank("RolandTR909")
```

### Pattern 2: Melodic Sequence
```javascript
n("0 2 4 7 4 2").scale("C:minor")
  .s("piano").clip(2)
```

### Pattern 3: Filter Sweep
```javascript
note("c2*8").s("sawtooth")
  .lpf(sine.range(200, 2000).slow(8))
  .lpq(8)
```

### Pattern 4: Chord Pad
```javascript
chord("<Cm7 Fm7 Bb7 Eb^7>")
  .voicing().s("strings")
  .attack(0.5).release(1)
  .room(0.5)
```

### Pattern 5: Complex Layered Beat
```javascript
setcpm(90/4)
stack(
  s("bd*2").bank("RolandTR808"),
  s("~ cp").bank("RolandTR808"),
  s("hh*8?").bank("RolandTR808").gain(0.7),
  n("0 ~ 2 4").scale("G:minor").s("bass").lpf(400)
).room(0.3)
```

### Pattern 6: Generative Melody
```javascript
n(irand(8).segment(16))
  .scale("D:dorian")
  .sometimes(add(note(12)))
  .s("piano")
  .delay(0.3).delaytime(0.25)
  .room(0.4)
```

### Pattern 7: Arpeggiated Chords
```javascript
n("0 1 2 3").chord("<Cm Am F G>")
  .mode("above:c3").voicing()
  .s("gm_electric_guitar_clean")
  .clip(2)
```

### Pattern 8: Breakbeat Chopping
```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit()
  .slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1).rarely(ply("2"))
```

---

## Key Insights for AI Generation

1. **Temporal Subdivision**: All time is relative to cycles. Nested brackets subdivide time.

2. **Pattern Composition**: Patterns combine through:
   - Space (sequence in time)
   - Comma (parallel/simultaneous)
   - `stack()` function
   - `layer()` function with transformations

3. **Transformation Chains**: Methods chain fluently:
   ```javascript
   note("c4").s("piano").lpf(800).room(0.3).delay(0.2)
   ```

4. **Continuous vs Discrete**: Signals are continuous, sampled when events occur.

5. **Mini-Notation Power**: Complex rhythms in compact text:
   ```javascript
   "<[bd sd]*2, hh*8, ~ cp!3 [cp cp]>*<1 2>"
   ```

6. **Euclidean Rhythms**: Natural musical patterns from simple numbers.

7. **Scale Awareness**: Numbers + scales = musicality without music theory knowledge.

8. **Randomness & Variation**: Use `?`, `|`, `rand`, `perlin`, `sometimes` for organic feel.

9. **Effect Chaining**: Build complex timbres through filter/effect combinations.

10. **Cycle Thinking**: Everything loops. Use `<>` for slow evolution across cycles.

---

## Training Data Extraction Strategy

For AI model training, extract patterns from:

1. **Rhythm patterns**: Mini-notation drum sequences
2. **Melodic patterns**: Scale-based note sequences
3. **Harmonic patterns**: Chord progressions with voicings
4. **Timbral patterns**: Effect chains and filter envelopes
5. **Structural patterns**: How patterns layer and evolve

Consider generating variations by:
- Changing tempo (`setcpm`)
- Swapping drum banks
- Transposing scales
- Modifying effect parameters
- Adjusting probability values

---

## References

- Website: https://strudel.cc/
- Repository: https://codeberg.org/uzu/strudel
- Parent Project: TidalCycles (https://tidalcycles.org/)
- Theory: Godfried Toussaint's Euclidean Rhythms paper
