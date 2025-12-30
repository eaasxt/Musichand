#!/usr/bin/env python3
"""
Quick prototype: Test Strudel code generation using knowledge base context.
Uses local Ollama for fast iteration.
"""

import subprocess
import json
import sys

# Test prompts with expected characteristics
TEST_CASES = [
    {
        "description": "A simple four-on-the-floor kick drum pattern",
        "expected_contains": ["bd", "*4"],
        "complexity": "L1"
    },
    {
        "description": "House beat with kick, snare on 2 and 4, and eighth note hi-hats",
        "expected_contains": ["bd", "sd", "hh"],
        "complexity": "L2"
    },
    {
        "description": "C minor pentatonic melody, 8 notes, using the scale function",
        "expected_contains": ["scale", "minor", "pentatonic"],
        "complexity": "L2"
    },
    {
        "description": "Acid bassline with filter sweep using sawtooth and lowpass filter",
        "expected_contains": ["sawtooth", "lpf"],
        "complexity": "L3"
    },
    {
        "description": "Euclidean rhythm with 3 beats over 8 steps on kick drum",
        "expected_contains": ["(3,8)", "bd"],
        "complexity": "L2"
    },
    {
        "description": "Jazz chord progression: Dm7 G7 Cmaj7 with voicings",
        "expected_contains": ["chord", "voicing"],
        "complexity": "L3"
    },
    {
        "description": "Generative melody using random notes from a scale",
        "expected_contains": ["irand", "scale"],
        "complexity": "L4"
    },
    {
        "description": "Ambient pad with long attack, reverb, and slow filter movement",
        "expected_contains": ["attack", "room", "lpf"],
        "complexity": "L4"
    },
]

# Condensed knowledge context (key syntax only)
STRUDEL_CONTEXT = '''
# Strudel Quick Reference

## Mini-Notation
- Sequence: space-separated `"bd sd hh"`
- Subdivide: brackets `"bd [hh hh]"`
- Parallel: comma `"bd, hh*4"`
- Alternate per cycle: `"<bd sd hh>"`
- Speed up: `"bd*4"`, Slow down: `"bd/2"`
- Rest: `~` or `-`
- Euclidean: `"bd(3,8)"` = 3 beats over 8 steps
- Sample number: `"hh:2"`
- Probability: `"hh?"` (50%), `"hh?0.3"` (30%)

## Core Functions
- `s("pattern")` or `sound("pattern")` - play samples
- `note("c4 e4 g4")` - play notes
- `n("0 2 4").scale("C:minor")` - scale degrees
- `chord("<Cm7 G7>").voicing()` - chord voicings

## Time Modifiers
- `.slow(2)` / `.fast(2)` - tempo
- `.rev()` - reverse
- `.euclid(3,8)` - euclidean rhythm
- `.swing(4)` - swing feel

## Effects
- `.lpf(freq)` / `.hpf(freq)` - filters
- `.lpq(resonance)` - filter resonance
- `.room(amount)` - reverb
- `.delay(amount).delaytime(t)` - delay
- `.pan(0-1)` - stereo position

## Envelope
- `.attack(t)` / `.decay(t)` / `.sustain(level)` / `.release(t)`

## Signals (continuous, use with .segment(n) to discretize)
- `sine`, `saw`, `tri`, `square` - LFOs (0-1)
- `rand`, `perlin` - random (0-1)
- `irand(n)` - random integers 0 to n-1
- `.range(min, max)` - scale signal range

## Common Patterns
- Drums: `s("bd sd, hh*8")` or `.bank("RolandTR909")`
- Melody: `n("0 2 4 7").scale("C:minor").s("piano")`
- Chords: `chord("<Cm7 Fm7 G7>").voicing()`
- Filter sweep: `.lpf(sine.range(200,2000).slow(4))`
'''

SYSTEM_PROMPT = f"""You are a Strudel live coding assistant. Generate valid Strudel/JavaScript code for music patterns.

{STRUDEL_CONTEXT}

Rules:
1. Output ONLY the Strudel code, no explanation
2. Use valid Strudel syntax
3. Keep it concise but complete
4. Include setcpm() if tempo matters for the style"""


def query_ollama(prompt: str, model: str = "llama3.2") -> str:
    """Query local Ollama instance."""
    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input=f"{SYSTEM_PROMPT}\n\nGenerate Strudel code for: {prompt}",
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return "ERROR: Timeout"
    except Exception as e:
        return f"ERROR: {e}"


def check_output(output: str, expected: list[str]) -> dict:
    """Check if output contains expected elements."""
    output_lower = output.lower()
    found = []
    missing = []

    for item in expected:
        if item.lower() in output_lower:
            found.append(item)
        else:
            missing.append(item)

    return {
        "found": found,
        "missing": missing,
        "score": len(found) / len(expected) if expected else 1.0
    }


def run_tests(model: str = "llama3.2"):
    """Run all test cases and report results."""
    print(f"Testing Strudel generation with model: {model}")
    print("=" * 60)

    results = []
    total_score = 0

    for i, test in enumerate(TEST_CASES, 1):
        print(f"\n[{i}/{len(TEST_CASES)}] {test['complexity']}: {test['description'][:50]}...")

        output = query_ollama(test['description'], model)
        check = check_output(output, test['expected_contains'])

        results.append({
            "description": test['description'],
            "complexity": test['complexity'],
            "output": output,
            "check": check
        })

        total_score += check['score']

        # Print result
        status = "PASS" if check['score'] >= 0.5 else "FAIL"
        print(f"  [{status}] Score: {check['score']:.0%}")
        if check['missing']:
            print(f"    Missing: {check['missing']}")
        print(f"    Output: {output[:100]}{'...' if len(output) > 100 else ''}")

    # Summary
    print("\n" + "=" * 60)
    avg_score = total_score / len(TEST_CASES)
    print(f"Average Score: {avg_score:.0%}")
    print(f"Passed (>=50%): {sum(1 for r in results if r['check']['score'] >= 0.5)}/{len(TEST_CASES)}")

    # Save results
    with open("/home/ubuntu/Musicman/data/generation_test_results.json", "w") as f:
        json.dump({
            "model": model,
            "average_score": avg_score,
            "results": results
        }, f, indent=2)

    print(f"\nResults saved to: /home/ubuntu/Musicman/data/generation_test_results.json")

    return results


if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "llama3.2"
    run_tests(model)
