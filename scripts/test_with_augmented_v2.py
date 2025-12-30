#!/usr/bin/env python3
"""
Test Strudel generation with improved feature-based example selection.
"""

import subprocess
import json
import sys
import re
from pathlib import Path

TEST_CASES = [
    {
        "description": "A simple four-on-the-floor kick drum pattern",
        "expected_contains": ["bd", "*4"],
        "complexity": "L1",
        "category": "rhythm",
        "features": ["four-on-floor", "kick", "bd"]
    },
    {
        "description": "House beat with kick, snare on 2 and 4, and eighth note hi-hats",
        "expected_contains": ["bd", "sd", "hh"],
        "complexity": "L2",
        "category": "rhythm",
        "features": ["house", "beat", "kick", "snare", "hihat"]
    },
    {
        "description": "C minor pentatonic melody using the scale function",
        "expected_contains": ["scale", "minor"],
        "complexity": "L2",
        "category": "melody",
        "features": ["scale", "pentatonic", "minor"]
    },
    {
        "description": "Acid bassline with filter sweep using sawtooth and lowpass filter",
        "expected_contains": ["sawtooth", "lpf"],
        "complexity": "L3",
        "category": "effects",
        "features": ["acid", "bass", "sawtooth", "lpf", "filter"]
    },
    {
        "description": "Euclidean rhythm with 3 beats over 8 steps on kick drum",
        "expected_contains": ["(3,8)", "bd"],
        "complexity": "L2",
        "category": "rhythm",
        "features": ["euclidean", "kick", "bd"]
    },
    {
        "description": "Jazz chord progression Dm7 G7 Cmaj7 with voicings",
        "expected_contains": ["chord", "voicing"],
        "complexity": "L3",
        "category": "harmony",
        "features": ["chord", "voicing", "jazz", "251"]
    },
    {
        "description": "Generative melody using random notes from a dorian scale",
        "expected_contains": ["irand", "scale"],
        "complexity": "L4",
        "category": "melody",
        "features": ["random", "generative", "irand", "dorian"]
    },
    {
        "description": "Ambient pad with long attack, reverb, and slow filter movement",
        "expected_contains": ["attack", "room"],
        "complexity": "L4",
        "category": "effects",
        "features": ["ambient", "pad", "attack", "room", "filter"]
    },
]


def load_examples(path: str) -> list:
    """Load all examples from augmented dataset."""
    examples = []
    with open(path) as f:
        for line in f:
            examples.append(json.loads(line))
    return examples


def extract_features(example: dict) -> set:
    """Extract features from an example for matching."""
    features = set()
    code = example.get('code', '').lower()
    desc = example.get('description', '').lower()
    tags = example.get('tags', [])
    
    # Add explicit tags
    features.update(tags)
    
    # Extract from code
    if 'bd' in code: features.add('kick'); features.add('bd')
    if 'sd' in code: features.add('snare'); features.add('sd')
    if 'hh' in code: features.add('hihat'); features.add('hh')
    if 'cp' in code: features.add('clap'); features.add('cp')
    if '*4' in code: features.add('four-on-floor')
    if re.search(r'\(\d+,\d+\)', code): features.add('euclidean')
    if 'scale' in code: features.add('scale')
    if 'chord' in code: features.add('chord')
    if 'voicing' in code: features.add('voicing')
    if 'irand' in code: features.add('irand'); features.add('random'); features.add('generative')
    if 'sawtooth' in code: features.add('sawtooth')
    if 'lpf' in code: features.add('lpf'); features.add('filter')
    if 'room' in code: features.add('room'); features.add('reverb')
    if 'attack' in code: features.add('attack')
    if 'delay' in code: features.add('delay')
    
    # Extract from description
    if 'house' in desc: features.add('house')
    if 'jazz' in desc: features.add('jazz')
    if 'ambient' in desc: features.add('ambient')
    if 'acid' in desc: features.add('acid')
    if 'pentatonic' in desc: features.add('pentatonic')
    if 'dorian' in desc: features.add('dorian')
    if 'minor' in desc: features.add('minor')
    if 'major' in desc: features.add('major')
    
    return features


def find_matching_examples(examples: list, target_features: list, n: int = 3) -> list:
    """Find examples that best match target features."""
    scored = []
    target_set = set(f.lower() for f in target_features)
    
    for ex in examples:
        ex_features = extract_features(ex)
        # Score by intersection
        matches = len(target_set & ex_features)
        if matches > 0:
            # Prefer golden examples and simpler ones
            bonus = 0
            if ex.get('augmentation') == 'golden':
                bonus = 2
            elif ex.get('augmentation') == 'original':
                bonus = 1
            # Prefer shorter, simpler code
            code_len = len(ex.get('code', ''))
            if code_len < 50:
                bonus += 1
            scored.append((matches + bonus, ex))
    
    # Sort by score descending
    scored.sort(key=lambda x: -x[0])
    return [ex for score, ex in scored[:n]]


def format_examples(examples: list) -> str:
    """Format examples for prompt."""
    formatted = []
    for ex in examples:
        desc = ex.get('description', 'Pattern')
        code = ex.get('code', '')
        if len(code) > 150:
            code = code[:150] + "..."
        formatted.append(f"Description: {desc}\nCode: {code}")
    return "\n\n".join(formatted)


STRUDEL_CONTEXT = '''# Strudel Quick Reference
- `s("bd sd")` - play samples (bd=kick, sd=snare, hh=hihat, cp=clap)
- `note("c4 e4")` - play notes  
- `n("0 2 4").scale("C:minor")` - scale degrees
- `chord("<Cm7 G7>").voicing()` - chords with voicings
- Mini-notation: `*4` repeat, `<a b>` alternate, `[a b]` subdivide, `,` parallel
- Euclidean: `"bd(3,8)"` = 3 beats over 8 steps
- Effects: `.lpf(freq)` `.room(amt)` `.delay(amt)` `.attack(t)` `.decay(t)`
- Signals: `sine`, `irand(n)` for random integers, `perlin` for noise'''


def build_prompt(description: str, examples_text: str) -> str:
    """Build generation prompt with examples."""
    return f"""{STRUDEL_CONTEXT}

## Examples
{examples_text}

## Task
Generate Strudel code for: {description}

Output ONLY the code, no explanation."""


def query_ollama(prompt: str, model: str = "llama3.2") -> str:
    """Query local Ollama."""
    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"


def check_output(output: str, expected: list) -> dict:
    """Check if output contains expected elements."""
    output_lower = output.lower()
    found = [item for item in expected if item.lower() in output_lower]
    missing = [item for item in expected if item.lower() not in output_lower]
    return {
        "found": found,
        "missing": missing,
        "score": len(found) / len(expected) if expected else 1.0
    }


def run_test(model: str = "llama3.2", augmented_path: str = None):
    """Run improved few-shot test."""
    if augmented_path is None:
        augmented_path = "/home/ubuntu/Musicman/data/strudel_examples_augmented.jsonl"
    
    print(f"Loading examples from: {augmented_path}")
    all_examples = load_examples(augmented_path)
    print(f"Loaded {len(all_examples)} examples")
    
    # Count golden examples
    golden_count = sum(1 for ex in all_examples if ex.get('augmentation') == 'golden')
    print(f"Golden examples: {golden_count}")
    
    print(f"\nTesting with model: {model}")
    print("=" * 70)
    
    results = []
    
    for i, test in enumerate(TEST_CASES, 1):
        print(f"\n[{i}/{len(TEST_CASES)}] {test['description'][:50]}...")
        
        # Find matching examples using features
        features = test.get('features', [])
        matching = find_matching_examples(all_examples, features, n=3)
        
        # Show what examples we're using
        print(f"  Using {len(matching)} examples with features: {features[:3]}...")
        for j, m in enumerate(matching):
            code_preview = m['code'][:40].replace('\n', ' ')
            print(f"    {j+1}. {code_preview}...")
        
        examples_text = format_examples(matching)
        prompt = build_prompt(test['description'], examples_text)
        
        output = query_ollama(prompt, model)
        check = check_output(output, test['expected_contains'])
        
        results.append({
            "test": test['description'],
            "features": features,
            "examples_used": [m['code'][:50] for m in matching],
            "output": output,
            "check": check
        })
        
        status = "PASS" if check['score'] >= 0.5 else "FAIL"
        print(f"  Result: [{status}] {check['score']:.0%}")
        if check['missing']:
            print(f"  Missing: {check['missing']}")
        print(f"  Output: {output[:80]}{'...' if len(output) > 80 else ''}")
    
    # Summary
    avg_score = sum(r['check']['score'] for r in results) / len(results)
    passed = sum(1 for r in results if r['check']['score'] >= 0.5)
    
    print("\n" + "=" * 70)
    print("SUMMARY (Feature-based selection)")
    print("=" * 70)
    print(f"  Average Score: {avg_score:.0%}")
    print(f"  Tests Passed:  {passed}/{len(TEST_CASES)}")
    print("=" * 70)
    
    # Save results
    output_file = "/home/ubuntu/Musicman/data/generation_comparison_v2.json"
    with open(output_file, 'w') as f:
        json.dump({
            "model": model,
            "method": "feature_based_selection",
            "average_score": avg_score,
            "passed": passed,
            "results": results
        }, f, indent=2)
    print(f"\nResults saved to: {output_file}")
    
    return results


if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "llama3.2"
    run_test(model)
