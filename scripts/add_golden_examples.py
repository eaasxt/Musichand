#!/usr/bin/env python3
"""
Add curated 'golden' examples - simple, clear patterns for common requests.
These serve as high-quality few-shot examples.
"""

import json
from pathlib import Path

# Golden examples: simple, isolated patterns that match common requests
GOLDEN_EXAMPLES = [
    # Four-on-the-floor variations
    {
        "code": 's("bd*4")',
        "description": "Four-on-the-floor kick drum pattern",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["four-on-floor", "kick", "basic"]
    },
    {
        "code": 's("bd*4").bank("RolandTR808")',
        "description": "Four-on-the-floor kick with 808 drums",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["four-on-floor", "kick", "808"]
    },
    {
        "code": 's("bd*4").bank("RolandTR909")',
        "description": "Four-on-the-floor kick with 909 drums",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["four-on-floor", "kick", "909"]
    },
    
    # Euclidean rhythms on different drums
    {
        "code": 's("bd(3,8)")',
        "description": "Euclidean rhythm with 3 kicks over 8 steps",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["euclidean", "kick"]
    },
    {
        "code": 's("bd(5,8)")',
        "description": "Euclidean rhythm with 5 kicks over 8 steps",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["euclidean", "kick"]
    },
    {
        "code": 's("sd(3,8)")',
        "description": "Euclidean snare pattern, 3 hits over 8 steps",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["euclidean", "snare"]
    },
    {
        "code": 's("cp(3,8)")',
        "description": "Euclidean clap pattern, 3 hits over 8 steps",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["euclidean", "clap"]
    },
    {
        "code": 's("hh(5,8)")',
        "description": "Euclidean hi-hat pattern, 5 hits over 8 steps",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["euclidean", "hihat"]
    },
    {
        "code": 's("bd(3,8), sd(5,8), hh(7,8)")',
        "description": "Polyrhythmic euclidean drum pattern",
        "category": "rhythm",
        "complexity": "L2",
        "tags": ["euclidean", "polyrhythm"]
    },
    
    # Basic house/techno beats
    {
        "code": 's("bd sd bd sd")',
        "description": "Basic kick snare pattern",
        "category": "rhythm",
        "complexity": "L1",
        "tags": ["basic", "kick", "snare"]
    },
    {
        "code": 's("bd*4, sd*2, hh*8")',
        "description": "House beat with kick, snare, and hi-hats",
        "category": "rhythm",
        "complexity": "L2",
        "tags": ["house", "beat"]
    },
    {
        "code": 's("bd*4, ~ sd ~ sd, hh*8")',
        "description": "House beat with snare on 2 and 4",
        "category": "rhythm",
        "complexity": "L2",
        "tags": ["house", "backbeat"]
    },
    {
        "code": 's("bd*4, ~ cp ~ cp, [hh hh hh hh]*2")',
        "description": "House beat with clap on 2 and 4, eighth note hi-hats",
        "category": "rhythm",
        "complexity": "L2",
        "tags": ["house", "beat"]
    },
    
    # Scale melodies
    {
        "code": 'n("0 2 4 5 7").scale("C:minor")',
        "description": "C minor scale ascending",
        "category": "melody",
        "complexity": "L1",
        "tags": ["scale", "minor"]
    },
    {
        "code": 'n("0 2 4 7").scale("C:minor:pentatonic")',
        "description": "C minor pentatonic melody",
        "category": "melody",
        "complexity": "L1",
        "tags": ["scale", "pentatonic", "minor"]
    },
    {
        "code": 'n("0 2 4 5 7").scale("C:major")',
        "description": "C major scale ascending",
        "category": "melody",
        "complexity": "L1",
        "tags": ["scale", "major"]
    },
    {
        "code": 'n("0 2 3 5 7").scale("D:dorian")',
        "description": "D dorian scale melody",
        "category": "melody",
        "complexity": "L1",
        "tags": ["scale", "dorian"]
    },
    
    # Generative/random
    {
        "code": 'n(irand(8)).scale("C:minor").s("piano")',
        "description": "Random notes from C minor scale on piano",
        "category": "melody",
        "complexity": "L2",
        "tags": ["random", "generative", "irand"]
    },
    {
        "code": 'n(irand(5)).scale("C:minor:pentatonic").s("piano")',
        "description": "Random pentatonic melody",
        "category": "melody",
        "complexity": "L2",
        "tags": ["random", "generative", "pentatonic"]
    },
    {
        "code": 'n(irand(12)).scale("D:dorian").s("sawtooth")',
        "description": "Generative dorian melody with sawtooth synth",
        "category": "melody",
        "complexity": "L2",
        "tags": ["random", "generative", "dorian"]
    },
    
    # Chord progressions
    {
        "code": 'chord("<Cm7 Fm7 G7 Cm7>").voicing()',
        "description": "Minor jazz chord progression with voicings",
        "category": "harmony",
        "complexity": "L2",
        "tags": ["chord", "voicing", "jazz"]
    },
    {
        "code": 'chord("<Dm7 G7 Cmaj7>").voicing()',
        "description": "II-V-I jazz progression with voicings",
        "category": "harmony",
        "complexity": "L2",
        "tags": ["chord", "voicing", "jazz", "251"]
    },
    {
        "code": 'chord("<Am F C G>").voicing()',
        "description": "Pop chord progression with voicings",
        "category": "harmony",
        "complexity": "L2",
        "tags": ["chord", "voicing", "pop"]
    },
    
    # Acid/bass
    {
        "code": 'note("a1 a1 a2 a1").s("sawtooth").lpf(800)',
        "description": "Basic acid bassline with sawtooth and lowpass filter",
        "category": "effects",
        "complexity": "L2",
        "tags": ["acid", "bass", "sawtooth", "lpf"]
    },
    {
        "code": 'note("c2 c2 c3 c2").s("sawtooth").lpf(sine.range(200,2000).slow(4))',
        "description": "Acid bassline with filter sweep",
        "category": "effects",
        "complexity": "L3",
        "tags": ["acid", "bass", "filter", "sweep"]
    },
    {
        "code": 'note("c2 eb2 g2 bb2").s("sawtooth").lpf(400).lpq(10)',
        "description": "Resonant acid bass with filter",
        "category": "effects",
        "complexity": "L3",
        "tags": ["acid", "bass", "resonant"]
    },
    
    # Ambient/pad
    {
        "code": 'note("c3 e3 g3").s("pad").attack(2).release(4).room(0.5)',
        "description": "Ambient pad with slow attack and reverb",
        "category": "effects",
        "complexity": "L3",
        "tags": ["ambient", "pad", "reverb"]
    },
    {
        "code": 'note("c4 e4 g4 b4").s("sine").attack(4).decay(2).room(0.8).roomsize(4)',
        "description": "Ambient pad with long attack, reverb, large room",
        "category": "effects",
        "complexity": "L3",
        "tags": ["ambient", "pad", "attack", "room"]
    },
    {
        "code": 'note("c3 g3 c4").s("triangle").attack(3).release(5).lpf(sine.range(400,1200).slow(8)).room(0.6)',
        "description": "Ambient pad with slow filter movement and reverb",
        "category": "effects",
        "complexity": "L4",
        "tags": ["ambient", "pad", "filter", "movement"]
    },
    
    # Effects examples
    {
        "code": 's("bd sd").room(0.5)',
        "description": "Drums with reverb",
        "category": "effects",
        "complexity": "L1",
        "tags": ["reverb", "room"]
    },
    {
        "code": 's("bd sd").delay(0.5).delaytime(0.25)',
        "description": "Drums with delay effect",
        "category": "effects",
        "complexity": "L2",
        "tags": ["delay"]
    },
    {
        "code": 's("hh*8").lpf(2000).hpf(500)',
        "description": "Hi-hats with bandpass filtering",
        "category": "effects",
        "complexity": "L2",
        "tags": ["filter", "lpf", "hpf"]
    },
]


def add_golden_examples(augmented_path: str, output_path: str = None):
    """Add golden examples to the augmented dataset."""
    if output_path is None:
        output_path = augmented_path
    
    # Load existing examples
    existing = []
    existing_codes = set()
    with open(augmented_path) as f:
        for line in f:
            ex = json.loads(line)
            existing.append(ex)
            existing_codes.add(ex['code'].strip())
    
    print(f"Loaded {len(existing)} existing examples")
    
    # Add golden examples (avoiding duplicates)
    added = 0
    for golden in GOLDEN_EXAMPLES:
        if golden['code'].strip() not in existing_codes:
            example = {
                "code": golden['code'],
                "description": golden['description'],
                "source_file": "golden_examples",
                "section": "Curated",
                "complexity": golden['complexity'],
                "category": golden['category'],
                "augmentation": "golden",
                "tags": golden.get('tags', [])
            }
            existing.append(example)
            existing_codes.add(golden['code'].strip())
            added += 1
    
    print(f"Added {added} golden examples")
    
    # Write output
    with open(output_path, 'w') as f:
        for ex in existing:
            f.write(json.dumps(ex) + '\n')
    
    print(f"Total: {len(existing)} examples")
    print(f"Saved to: {output_path}")
    
    return existing


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "/home/ubuntu/Musicman/data/strudel_examples_augmented.jsonl"
    add_golden_examples(path)
