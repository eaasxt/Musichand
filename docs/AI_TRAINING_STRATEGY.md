# AI Training Strategy for Strudel Code Generation

This document outlines strategies for training AI models to generate Strudel music code, leveraging the synthesized documentation.

---

## Overview

The goal is to train an AI that can:
1. Generate valid Strudel code from natural language descriptions
2. Produce musically coherent patterns
3. Apply appropriate effects and transformations
4. Combine multiple patterns into complete compositions

---

## Training Data Structure

### Input-Output Pairs

Structure training data as (description, code) pairs:

```json
{
  "description": "Four on the floor kick pattern",
  "code": "s(\"bd*4\")"
}

{
  "description": "House beat with hihat and clap",
  "code": "s(\"bd*4, [- cp]*2, hh*8\")"
}

{
  "description": "C minor pentatonic melody, slow",
  "code": "n(\"0 2 4 5 7\").scale(\"C:pentatonic\").slow(2)"
}
```

### Hierarchical Categories

Organize training data by:

1. **Complexity Level**
   - L1: Single pattern (e.g., `s("bd*4")`)
   - L2: Multiple voices (e.g., `s("bd, hh*4")`)
   - L3: With effects (e.g., `s("bd*4").room(0.3)`)
   - L4: Generative (e.g., `n(irand(8))...`)
   - L5: Complete composition

2. **Musical Category**
   - Rhythm patterns
   - Melodic patterns
   - Harmonic patterns (chords)
   - Effect chains
   - Full compositions

3. **Genre/Style**
   - Techno, House, Drum & Bass
   - Lo-fi, Ambient, Jazz
   - Experimental, Generative

---

## Data Augmentation Strategies

### 1. Tempo Variations

```javascript
// Original
s("bd sd, hh*4")

// Augmented
s("bd sd, hh*4").cpm(90)
s("bd sd, hh*4").cpm(120)
s("bd sd, hh*4").cpm(140)
```

### 2. Sound Bank Swaps

```javascript
// Original
s("bd sd, hh*4")

// Augmented
s("bd sd, hh*4").bank("RolandTR808")
s("bd sd, hh*4").bank("RolandTR909")
s("bd sd, hh*4").bank("AkaiLinn")
```

### 3. Scale Transposition

```javascript
// Original
n("0 2 4 7").scale("C:minor")

// Augmented
n("0 2 4 7").scale("D:minor")
n("0 2 4 7").scale("G:minor")
n("0 2 4 7").scale("A:dorian")
```

### 4. Effect Variations

```javascript
// Original
note("c2*4").s("sawtooth")

// Augmented with effects
note("c2*4").s("sawtooth").lpf(400)
note("c2*4").s("sawtooth").lpf(800).lpq(10)
note("c2*4").s("sawtooth").room(0.3)
note("c2*4").s("sawtooth").delay(0.4).delayfeedback(0.5)
```

### 5. Rhythmic Variations

```javascript
// Original
s("bd sd")

// Euclidean variations
s("bd(3,8), sd(2,8)")
s("bd(5,8), sd(3,8)")

// Subdivision variations
s("bd [bd bd] sd sd")
s("bd sd [sd sd] sd")
```

---

## Feature Extraction

### From Description

Extract musical intent:

| Feature | Examples | Strudel Mapping |
|---------|----------|-----------------|
| Tempo | "fast", "slow", "120 bpm" | `.cpm()`, `.fast()`, `.slow()` |
| Genre | "techno", "ambient" | Bank selection, tempo, patterns |
| Instrument | "kick", "synth", "piano" | `s()`, `sound()` choices |
| Mood | "dark", "bright", "aggressive" | Scale, filter, distortion |
| Complexity | "simple", "complex" | Nesting depth, voice count |

### From Code

Extract structural features:

```javascript
// Pattern: s("bd*4, hh*8")
{
  "voices": 2,
  "max_subdivision": 8,
  "has_euclidean": false,
  "has_effects": false,
  "instruments": ["bd", "hh"]
}
```

---

## Model Architecture Considerations

### 1. Sequence-to-Sequence

- Input: Natural language description
- Output: Strudel code tokens
- Good for: Direct translation tasks

### 2. Hierarchical Generation

- First generate structure (number of voices, tempo)
- Then generate each voice pattern
- Finally add effects
- Good for: Complex compositions

### 3. Template-Based + Infilling

- Use templates like `s("{PATTERN}").{EFFECTS}`
- Train model to fill in blanks
- Good for: Controllable generation

### 4. Retrieval-Augmented Generation

- Retrieve similar examples from training set
- Use as context for generation
- Good for: Style matching

---

## Evaluation Metrics

### 1. Syntactic Validity

```javascript
// Test if code parses without error
try {
  eval(generatedCode);
  return { valid: true };
} catch (e) {
  return { valid: false, error: e.message };
}
```

### 2. Musical Coherence

Score based on:
- Rhythmic regularity (euclidean patterns score higher)
- Harmonic consistency (in-scale notes)
- Structural balance (voice separation)

### 3. Description Alignment

Semantic similarity between:
- Input description
- Description of generated pattern's musical properties

### 4. Human Evaluation

- Does it sound good?
- Does it match the description?
- Would a musician write this?

---

## Prompt Engineering Templates

### For Generation

```
Generate Strudel code for: {description}

Requirements:
- Valid Strudel syntax
- Musically coherent
- Match the described style/mood

Examples:
{few_shot_examples}

Output:
```

### For Explanation

```
Explain this Strudel pattern:
{code}

Describe:
1. The rhythm structure
2. The sounds/instruments used
3. Any effects applied
4. The overall musical character
```

### For Modification

```
Modify this Strudel pattern:
{original_code}

Make it: {modification_description}

Keep the core musical idea but apply the requested change.
```

---

## Training Curriculum

### Phase 1: Syntax Learning

Focus on:
- Mini-notation basics
- Simple patterns
- Single-voice rhythms

### Phase 2: Musical Concepts

Focus on:
- Scales and chords
- Drum patterns by genre
- Euclidean rhythms

### Phase 3: Effects & Transformations

Focus on:
- Filter effects
- Time modifiers
- Spatial effects

### Phase 4: Composition

Focus on:
- Multi-voice patterns
- Layering techniques
- Complete songs

### Phase 5: Generation & Creativity

Focus on:
- Generative patterns
- Random/probabilistic elements
- Novel combinations

---

## Data Sources

### Primary Sources

1. **Strudel Documentation** (downloaded)
   - Official examples
   - Tutorial patterns
   - Recipe patterns

2. **User Patterns** (to collect)
   - GitHub repositories
   - Strudel REPL shares
   - Community contributions

3. **Synthetic Generation**
   - Template-based generation
   - Augmentation of existing patterns
   - Programmatic variation

### Secondary Sources

4. **TidalCycles Patterns**
   - Translate Haskell to JavaScript
   - Large existing corpus

5. **Music Theory Rules**
   - Generate scale exercises
   - Chord progression templates
   - Rhythmic templates by genre

---

## Implementation Roadmap

### Step 1: Data Collection

```bash
# Collect from downloaded docs
python scripts/extract_examples.py docs/strudel-docs/

# Parse and validate
python scripts/validate_patterns.py data/raw/

# Generate augmentations
python scripts/augment_data.py data/validated/
```

### Step 2: Training

```bash
# Fine-tune base model
python train.py \
  --base_model opus \
  --data data/augmented/ \
  --output models/strudel-v1/
```

### Step 3: Evaluation

```bash
# Run evaluation suite
python evaluate.py \
  --model models/strudel-v1/ \
  --test_set data/test/ \
  --metrics syntax,music,semantic
```

### Step 4: Iteration

- Analyze failure cases
- Add targeted training data
- Refine prompts and templates

---

## Success Criteria

1. **>95% syntactically valid** generated code
2. **>80% musically coherent** patterns (human eval)
3. **>70% description alignment** (semantic similarity)
4. **Diverse output** - not repetitive patterns
5. **Style coverage** - can generate multiple genres

---

## Next Steps for Musicman Project

1. Build example extraction script for HTML docs
2. Create pattern validation pipeline
3. Design augmentation rules
4. Implement evaluation framework
5. Set up fine-tuning infrastructure
6. Create human evaluation interface
