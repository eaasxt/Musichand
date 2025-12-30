# Strudel Mini-Notation Grammar

A formal grammar specification for the Strudel mini-notation, useful for parsing and generating patterns programmatically.

---

## EBNF Grammar

```ebnf
(* Top-level pattern *)
pattern         = sequence ;

(* Sequence: space-separated events *)
sequence        = element { SPACE element } ;

(* Element: single event with optional modifiers *)
element         = ( group | alternate | atom ) { modifier } ;

(* Grouping constructs *)
group           = "[" sequence { "," sequence } "]" ;
alternate       = "<" sequence { SPACE sequence } ">" ;

(* Atomic values *)
atom            = rest | value ;
rest            = "~" | "-" ;
value           = name [ ":" number [ ":" number ] ] ;
name            = LETTER { LETTER | DIGIT | "#" | "b" } ;
number          = DIGIT { DIGIT } [ "." DIGIT { DIGIT } ] ;

(* Modifiers *)
modifier        = multiply | divide | elongate | replicate |
                  probability | euclidean ;
multiply        = "*" number ;
divide          = "/" number ;
elongate        = "@" number ;
replicate       = "!" number ;
probability     = "?" [ number ] ;
euclidean       = "(" number "," number [ "," number ] ")" ;

(* Random choice (special case) *)
random_choice   = element { "|" element } ;

(* Terminals *)
SPACE           = " " | "\t" | "\n" ;
LETTER          = "a"-"z" | "A"-"Z" | "_" ;
DIGIT           = "0"-"9" ;
```

---

## Syntax Elements

### Atoms

| Pattern | Meaning | Example |
|---------|---------|---------|
| `name` | Sound/note name | `bd`, `c4`, `piano` |
| `name:n` | With sample number | `hh:2` |
| `name:n:g` | With sample and gain | `hh:2:0.5` |
| `~` | Rest (silence) | `bd ~ sd ~` |
| `-` | Rest (alternative) | `bd - sd -` |
| `_` | Continue previous | `bd _ sd _` |

### Grouping

| Pattern | Meaning | Example |
|---------|---------|---------|
| `[a b]` | Subdivide into one slot | `bd [hh hh] sd hh` |
| `[a,b]` | Play simultaneously | `[bd,hh] [sd,hh]` |
| `<a b>` | One per cycle | `<bd sd hh cp>` |
| `{a b}` | Choose by position | `{bd sd hh}%8` |

### Modifiers

| Modifier | Meaning | Example |
|----------|---------|---------|
| `*n` | Speed up by n | `hh*4` |
| `/n` | Slow down by n | `[bd sd]/2` |
| `@n` | Weight (relative duration) | `bd@2 sd` |
| `!n` | Replicate n times | `bd!3 sd` |
| `?` | 50% probability | `hh?` |
| `?n` | n probability (0-1) | `hh?0.3` |
| `(p,s)` | Euclidean (pulses, steps) | `bd(3,8)` |
| `(p,s,o)` | With offset | `bd(3,8,2)` |

---

## Operator Precedence (Highest to Lowest)

1. `:` - Sample/parameter separator
2. `()` - Euclidean grouping
3. `*`, `/`, `@`, `!` - Multiplicative modifiers
4. `?` - Probability
5. `[]` - Grouping
6. `<>` - Alternation
7. SPACE - Sequencing
8. `,` - Parallel
9. `|` - Random choice

---

## Semantic Rules

### Temporal Division

```
Total cycle time = 1.0 (normalized)

For sequence [a b c]:
  Each element duration = 1.0 / 3

For nested [a [b c]]:
  a duration = 0.5
  b duration = 0.25
  c duration = 0.25
```

### Multiplication & Division

```
"a*2"   -> Play 'a' twice per its slot
"[a b]/2" -> Play sequence over 2 cycles

"a*2" is equivalent to "[a a]"
"a/2" means 'a' spans 2 cycles
```

### Euclidean Distribution

```
(pulses, steps) -> Distribute pulses evenly across steps
(pulses, steps, offset) -> With rotation offset

Example: (3,8) produces: x . . x . . x .
Example: (3,8,2) produces: . x . . x . . x
```

### Probability

```
"a?" -> 50% chance of playing
"a?0.3" -> 30% chance of playing
"a?0" -> Never plays
"a?1" -> Always plays
```

---

## Mini-Notation Examples with AST

### Example 1: Simple Sequence
```
Input: "bd sd hh"

AST:
Sequence
├── Atom("bd")
├── Atom("sd")
└── Atom("hh")
```

### Example 2: Nested Groups
```
Input: "bd [hh hh] sd [hh oh]"

AST:
Sequence
├── Atom("bd")
├── Group
│   ├── Atom("hh")
│   └── Atom("hh")
├── Atom("sd")
└── Group
    ├── Atom("hh")
    └── Atom("oh")
```

### Example 3: Parallel & Modifiers
```
Input: "bd*4, [- cp]*2"

AST:
Parallel
├── Modified(Atom("bd"), Multiply(4))
└── Modified
    ├── Group
    │   ├── Rest("-")
    │   └── Atom("cp")
    └── Multiply(2)
```

### Example 4: Alternation with Modifiers
```
Input: "<bd sd hh cp>*4"

AST:
Modified
├── Alternate
│   ├── Atom("bd")
│   ├── Atom("sd")
│   ├── Atom("hh")
│   └── Atom("cp")
└── Multiply(4)
```

### Example 5: Euclidean Rhythm
```
Input: "bd(3,8,2), hh*8"

AST:
Parallel
├── Euclidean(Atom("bd"), pulses=3, steps=8, offset=2)
└── Modified(Atom("hh"), Multiply(8))
```

---

## JavaScript Method Chaining Grammar

```ebnf
(* Pattern expression *)
pattern_expr    = source { method_call } ;

(* Source functions *)
source          = sound_source | note_source | n_source | other_source ;
sound_source    = ( "s" | "sound" ) "(" string ")" ;
note_source     = "note" "(" string ")" ;
n_source        = "n" "(" string ")" ;
other_source    = "chord" "(" string ")" | "stack" "(" args ")" ;

(* Method calls *)
method_call     = "." method_name "(" [ args ] ")" ;
method_name     = IDENTIFIER ;
args            = arg { "," arg } ;
arg             = string | number | signal | pattern_expr ;

(* Signals *)
signal          = signal_name { "." signal_method } ;
signal_name     = "sine" | "cosine" | "saw" | "tri" | "square" |
                  "rand" | "perlin" | "irand" "(" number ")" ;
signal_method   = "range" "(" number "," number ")" |
                  "slow" "(" number ")" |
                  "fast" "(" number ")" |
                  "segment" "(" number ")" ;

(* Terminals *)
string          = '"' { CHARACTER } '"' | "'" { CHARACTER } "'" |
                  "`" { CHARACTER } "`" ;
IDENTIFIER      = LETTER { LETTER | DIGIT } ;
```

---

## Common Method Signatures

### Sound Generation
```javascript
s(pattern: string): Pattern
sound(pattern: string): Pattern
note(pattern: string): Pattern
n(pattern: string | number | Signal): Pattern
chord(pattern: string): Pattern
```

### Time Modification
```javascript
.slow(factor: number | Pattern): Pattern
.fast(factor: number | Pattern): Pattern
.early(cycles: number | Pattern): Pattern
.late(cycles: number | Pattern): Pattern
.rev(): Pattern
.palindrome(): Pattern
.iter(n: number): Pattern
.euclid(pulses: number, steps: number, offset?: number): Pattern
.segment(n: number): Pattern
.swing(n: number): Pattern
```

### Tonal
```javascript
.scale(name: string): Pattern
.transpose(semitones: number | Pattern): Pattern
.scaleTranspose(steps: number | Pattern): Pattern
.voicing(): Pattern
.add(pattern: Pattern): Pattern
.sub(pattern: Pattern): Pattern
```

### Effects
```javascript
.lpf(freq: number | Signal): Pattern
.hpf(freq: number | Signal): Pattern
.lpq(resonance: number | Pattern): Pattern
.room(amount: number | Pattern): Pattern
.delay(amount: number | Pattern): Pattern
.pan(position: number | Pattern): Pattern
.gain(volume: number | Pattern): Pattern
```

### Envelopes
```javascript
.attack(time: number | Pattern): Pattern
.decay(time: number | Pattern): Pattern
.sustain(level: number | Pattern): Pattern
.release(time: number | Pattern): Pattern
.adsr(pattern: string): Pattern
```

### Conditional
```javascript
.sometimes(fn: Pattern => Pattern): Pattern
.sometimesBy(prob: number, fn: Pattern => Pattern): Pattern
.every(n: number, fn: Pattern => Pattern): Pattern
.when(cond: (cycle) => boolean, fn: Pattern => Pattern): Pattern
```

### Combination
```javascript
.layer(...fns: (Pattern => Pattern)[]): Pattern
.stack(...patterns: Pattern[]): Pattern
.set(pattern: Pattern): Pattern
.struct(pattern: string): Pattern
```

---

## Token Patterns (Regex)

```javascript
// Note names
const NOTE_REGEX = /^[a-gA-G](#|b)?[0-9]?$/;

// Drum sounds
const DRUM_REGEX = /^(bd|sd|hh|oh|cp|rim|lt|mt|ht|rd|cr)$/;

// Sample with number
const SAMPLE_REGEX = /^([a-z_]+)(:[0-9]+)?(:[0-9.]+)?$/;

// Numbers
const NUMBER_REGEX = /^[0-9]+(\.[0-9]+)?$/;

// Modifiers
const MODIFIER_REGEX = /^(\*|\/|@|!|\?)([0-9.]+)?$/;

// Euclidean
const EUCLIDEAN_REGEX = /^\(([0-9]+),([0-9]+)(,[0-9]+)?\)$/;

// Chord symbols
const CHORD_REGEX = /^[A-G](#|b)?(m|M|dim|aug|sus[24])?[0-9]*(b5|#5|b9|#9|b11|#11|b13)?$/;

// Scale names
const SCALE_REGEX = /^[A-G](#|b)?[0-9]?:(major|minor|dorian|phrygian|lydian|mixolydian|locrian|pentatonic|blues|bebop|whole_tone|chromatic|harmonic_minor|melodic_minor)$/;
```

---

## Parsing Strategy

1. **Tokenize**: Split input into tokens (atoms, operators, grouping symbols)
2. **Parse Groups**: Recursively parse `[]`, `<>`, `{}`
3. **Apply Modifiers**: Right-to-left attachment of `*`, `/`, `@`, `!`, `?`, `()`
4. **Build Parallel**: Split on `,` at same nesting level
5. **Build Sequence**: Split on SPACE at same nesting level
6. **Resolve Random**: Handle `|` for random choice

---

## Code Generation Templates

### From Pattern Description to Code

```
Input: "Four kick drums with hihat pattern"
Output: s("bd*4, hh*8")

Input: "C minor chord arpeggio"
Output: n("0 2 4 7").scale("C:minor")

Input: "Euclidean bass rhythm"
Output: note("c2").euclid(3,8)

Input: "Filtered sawtooth bass"
Output: note("c2").s("sawtooth").lpf(400).lpq(5)
```

### Variation Templates

```
// Tempo
{base}.cpm({tempo})

// Sound swap
{base}.bank("{bank}")

// Effect chain
{base}.{effect1}({param1}).{effect2}({param2})

// Conditional
{base}.{condition}({transform})

// Layering
stack({layer1}, {layer2}, {layer3})
```
