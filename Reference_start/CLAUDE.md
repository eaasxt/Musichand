# Strudel Composer - AI Music Generation with Farmhand

You are a music composition agent using Strudel, a browser-based live coding environment for algorithmic music. Your compositions are played via a web app that hot-reloads your code.

## Quick Reference

```bash
# Check your work
bd ready                    # See available tasks
bd stats                    # Project health

# Before editing ANY file
file_reservation_paths(project_key="/home/ubuntu", agent_name="YOUR_NAME", paths=["compositions/*.js"], ttl_seconds=3600, exclusive=True, reason="composing")

# Analyze reference audio
python scripts/analyze_audio.py references/track.mp3

# View your composition's spectrogram (after web app records output)
# Check output/ directory for generated analysis images
```

## Project Structure

```
~/strudel-composer/
├── CLAUDE.md                    # This file
├── compositions/                # Your Strudel code goes here
│   └── current.js              # Hot-reloaded by web app
├── references/                  # Audio files to analyze and match
│   └── *.mp3
├── output/                      # Analysis outputs (spectrograms, etc.)
├── scripts/                     # Audio analysis tools
│   ├── analyze_audio.py        # Extract BPM, key, structure from mp3
│   └── generate_spectrogram.py # Create visual feedback from recordings
├── web/                        # Vite + @strudel/web app
└── docs/                       # Strudel reference documentation
```

## Workflow

### 1. Start Session
```python
macro_start_session(
    human_key="/home/ubuntu",
    program="claude-code",
    model="opus-4.5",
    file_reservation_paths=["compositions/**/*.js"]
)
```

### 2. Pick a Task
```bash
bd ready                    # See what's available
bd update <id> --status in_progress
```

### 3. If Working from Reference Audio
```bash
python scripts/analyze_audio.py references/your_track.mp3
```
This outputs: BPM, detected key, rhythm patterns, frequency balance, structural sections.

### 4. Compose
Write your Strudel code to `compositions/current.js`. The web app will hot-reload it.

### 5. Get Feedback
After listening, check `output/` for spectrograms. Analyze the image to understand:
- Is the bass muddy (too much energy 100-300Hz)?
- Is the rhythm consistent (clear vertical lines)?
- Is there enough high-end sparkle?
- Does the structure evolve over time?

### 6. Iterate
Make changes, the web app reloads, analyze again.

### 7. Complete
```bash
bd close <id>
release_file_reservations()
```

---

## Strudel Fundamentals

### The Cycle
Everything in Strudel happens in **cycles**. One cycle = one measure by default. Speed is controlled by `setcpm()` (cycles per minute) or `setcps()` (cycles per second).

```javascript
setcpm(120)  // 120 cycles per minute = 120 BPM if 1 cycle = 1 bar
```

### Mini-Notation (inside double quotes)
The core of Strudel. Patterns inside `"..."` are parsed as mini-notation.

```javascript
// Basic sequence - elements divide the cycle equally
s("bd sd bd sd")           // 4 hits per cycle

// Grouping with [] - subdivide time
s("bd [sd sd] bd sd")      // sd sd happens in same time as single bd

// Alternation with <> - cycle through options
s("bd <sd cp> bd sd")      // sd on cycle 1, cp on cycle 2, repeat

// Repetition with *
s("bd*4")                  // 4 kicks per cycle
s("hh*8")                  // 8 hihats per cycle

// Slow down with /
s("bd/2")                  // 1 kick every 2 cycles

// Euclidean rhythms (beats, steps, offset)
s("bd(3,8)")               // 3 hits spread over 8 steps = "tresillo"
s("hh(5,8)")               // 5 over 8

// Rest with ~
s("bd ~ sd ~")             // kick, rest, snare, rest

// Random choice with |
s("bd|cp")                 // randomly bd OR cp each cycle

// Elongate with @
s("bd@3 sd")               // bd takes 3/4, sd takes 1/4

// Parallel with , (inside same pattern)
s("bd*4, hh*8, ~ cp ~ cp") // kick, hat, and clap patterns together
```

### Core Functions

```javascript
// Sound sources
s("bd sd")                          // samples
note("c4 e4 g4").s("piano")        // notes with instrument
n("0 2 4").scale("C:minor").s("sawtooth")  // scale degrees

// Stack multiple patterns (main way to layer)
stack(
  s("bd*4"),
  s("~ cp ~ cp"),
  note("c2 eb2 g2 bb2").s("sawtooth")
)

// Effects
.lpf(800)           // lowpass filter at 800Hz
.hpf(200)           // highpass filter
.lpq(5)             // filter resonance
.room(0.5)          // reverb amount
.size(4)            // reverb size
.delay(0.5)         // delay amount
.delaytime(0.25)    // delay time
.delayfeedback(0.6) // delay feedback
.gain(0.8)          // volume
.pan(0.5)           // stereo position

// Time manipulation
.fast(2)            // 2x speed
.slow(2)            // half speed
.rev()              // reverse pattern
.jux(rev)           // play reversed in other speaker

// Pattern modulation
.sometimes(x => x.fast(2))   // 50% chance to apply
.often(x => x.gain(0.5))     // ~75% chance
.rarely(x => x.rev())        // ~25% chance
.every(4, x => x.fast(2))    // every 4th cycle

// Signals (continuous values)
sine                // 0 to 1 sine wave
saw                 // 0 to 1 sawtooth
tri                 // 0 to 1 triangle
rand                // random 0-1
perlin              // smooth random noise

// Use signals to modulate
.lpf(sine.range(200, 2000).slow(8))  // filter sweep over 8 cycles
.gain(perlin.range(0.5, 1))          // random volume variation
```

### Sample Banks

```javascript
// Built-in drum machines
s("bd sd hh cp").bank("RolandTR909")
s("bd sd hh cp").bank("RolandTR808")

// GM sounds (General MIDI)
note("c4 e4 g4").s("gm_acoustic_bass")
note("c4 e4 g4").s("gm_epiano1")
note("c4 e4 g4").s("gm_strings")

// Synths
note("c4").s("sawtooth")
note("c4").s("square")
note("c4").s("triangle")
note("c4").s("sine")
```

### Scales and Chords

```javascript
// Scale degrees
n("0 2 4 5").scale("C:minor")       // C Eb G Ab
n("0 1 2 3 4 5 6 7").scale("D:dorian")

// Chord symbols
chord("Cm7").voicing()
chord("<Am7 Dm7 G7 Cmaj7>").voicing()  // Jazz progression

// Arpeggio
n("0 2 4 7").scale("E:minor").arp("up")
```

### Structural Patterns

```javascript
// 4-bar intro before main pattern
"0 0 0 0 1!60".mask(
  stack(
    s("bd*4"),
    // ... rest of pattern
  )
)

// Use .when() for section changes
stack(
  s("bd*4"),
  s("~ cp ~ cp")
).when("0000111100001111", x => x.add(note("12")))  // add octave on certain cycles
```

---

## Composition Guidelines

### For "Tolerable" Output
- Keep consistent tempo (`setcpm()` or `setcps()`)
- Stay in one key (use `.scale()`)
- Use simple chord progressions (I-V-vi-IV works everywhere)

### For "Decent" Output
- Layer drums, bass, and melody in separate `stack()` elements
- Use euclidean rhythms for interesting grooves
- Add movement with filter sweeps (`.lpf(sine.range(...))`)
- Use `.room()` and `.delay()` for space
- Vary patterns with `.every()`, `.sometimes()`

### For "Good" Output
- Build tension and release with `.mask()` or `.when()`
- Create contrast between sections
- Use call-and-response between elements
- Subtle variation with `.degradeBy()`, `.sometimesBy()`
- Match reference track characteristics

---

## Matching Reference Tracks

When you analyze a reference track, you'll get:
- **BPM**: Match with `setcpm()`
- **Key**: Use `.scale("X:major")` or `.scale("X:minor")`
- **Rhythm density**: How many events per beat? Use `*` multipliers
- **Frequency balance**: Where is energy? Low = bass focus, High = bright
- **Structure**: Intro, verse, chorus patterns

Example workflow:
```
Reference: 128 BPM, A minor, 4-on-floor kick, lots of reverb on synths

setcpm(128)
stack(
  s("bd*4").gain(0.9),                              // 4-on-floor
  s("~ cp ~ cp").room(0.4),                         // backbeat with reverb
  n("0 3 5 7").scale("A:minor").s("sawtooth")      // A minor arp
    .lpf(800).room(0.6)                            // filtered, reverby
)
```

---

## Analyzing Your Output

When viewing spectrograms of your compositions:

### Frequency Bands
- **Sub-bass (20-60Hz)**: Feel, not hear. Should be present but controlled.
- **Bass (60-250Hz)**: Kick drum body, bass notes. Should be clear, not muddy.
- **Low-mids (250-500Hz)**: Muddiness zone. Cut if cluttered.
- **Mids (500-2kHz)**: Main melodic content. Should be clear.
- **High-mids (2-4kHz)**: Presence, attack. Important for clarity.
- **Highs (4-20kHz)**: Air, sparkle, hi-hats.

### Visual Patterns
- **Vertical lines**: Transients (drums, attacks). Regular = good rhythm.
- **Horizontal bands**: Sustained tones, drones.
- **Energy distribution**: Should evolve over time, not be static.

---

## Common Patterns

### Basic Beat
```javascript
setcpm(120)
stack(
  s("bd*4"),
  s("~ sd ~ sd"),
  s("hh*8").gain(0.6)
).bank("RolandTR909")
```

### Lo-fi Chill
```javascript
setcpm(85)
stack(
  s("bd ~ [bd bd] ~, ~ sd ~ sd").bank("RolandCompuRhythm1000"),
  n("<0 3 5 7>*2").scale("Dm:minor7").s("gm_epiano1")
    .room(0.6).lpf(1200),
  n("0 ~ 5 ~").scale("D2:minor").s("triangle").lpf(400)
)
```

### Techno
```javascript
setcpm(130)
stack(
  s("bd*4").gain(0.95),
  s("[~ hh]*4").gain(0.4),
  s("~ cp ~ [cp cp]").room(0.3),
  n("0 0 0 [0 3]").scale("C2:minor").s("sawtooth")
    .lpf(perlin.range(200, 1200).slow(8)).lpq(8)
).bank("RolandTR909")
```

### Ambient
```javascript
setcpm(60)
stack(
  chord("<Cmaj7 Am7 Fmaj7 G7>").voicing().s("gm_pad_warm")
    .room(0.9).size(8).slow(4),
  n("0 4 7 11").scale("C:major").s("gm_celesta")
    .delay(0.6).delaytime(0.375).delayfeedback(0.5)
    .sometimesBy(0.3, x => x.fast(2))
)
```

---

## Multi-Agent Extension (Future)

When we add multiple agents:
- **Agent A**: Drums and rhythm (reserve `compositions/drums.js`)
- **Agent B**: Bass and harmony (reserve `compositions/bass.js`)
- **Agent C**: Lead and effects (reserve `compositions/lead.js`)

Main file imports and stacks:
```javascript
// compositions/current.js
import { drums } from './drums.js'
import { bass } from './bass.js'
import { lead } from './lead.js'

stack(drums, bass, lead)
```

Handoff protocol:
1. Agent A completes drums, sends message to Agent B
2. Agent B analyzes drums spectrogram, writes complementary bass
3. Agent C listens to both, adds lead that fills remaining frequency space

---

## Troubleshooting

### No sound
- Check browser console for errors
- Make sure `.s()` is called to specify sound source
- Try simpler pattern first: `s("bd").play()`

### Clicking/popping
- Lower `.gain()`
- Add `.clip(0.8)` to limit output
- Reduce overlapping notes with `.cut(1)`

### Muddy sound
- Use `.hpf(100)` on non-bass elements
- Reduce `.room()` values
- Cut low-mids with EQ if available

### Pattern not changing
- Check for syntax errors
- Make sure file saved
- Hard refresh browser if needed
