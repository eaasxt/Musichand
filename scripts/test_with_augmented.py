#!/usr/bin/env python3
"""
Test Strudel generation quality using augmented dataset as few-shot examples.
Compares baseline (no examples) vs few-shot (with examples from augmented data).
"""

import subprocess
import json
import sys
import random
from pathlib import Path

# Same test cases as baseline
TEST_CASES = [
    {
        "description": "A simple four-on-the-floor kick drum pattern",
        "expected_contains": ["bd", "*4"],
        "complexity": "L1",
        "category": "rhythm"
    },
    {
        "description": "House beat with kick, snare on 2 and 4, and eighth note hi-hats",
        "expected_contains": ["bd", "sd", "hh"],
        "complexity": "L2",
        "category": "rhythm"
    },
    {
        "description": "C minor pentatonic melody using the scale function",
        "expected_contains": ["scale", "minor"],
        "complexity": "L2",
        "category": "melody"
    },
    {
        "description": "Acid bassline with filter sweep using sawtooth and lowpass filter",
        "expected_contains": ["sawtooth", "lpf"],
        "complexity": "L3",
        "category": "effects"
    },
    {
        "description": "Euclidean rhythm with 3 beats over 8 steps on kick drum",
        "expected_contains": ["(3,8)", "bd"],
        "complexity": "L2",
        "category": "rhythm"
    },
    {
        "description": "Jazz chord progression Dm7 G7 Cmaj7 with voicings",
        "expected_contains": ["chord", "voicing"],
        "complexity": "L3",
        "category": "harmony"
    },
    {
        "description": "Generative melody using random notes from a dorian scale",
        "expected_contains": ["irand", "scale"],
        "complexity": "L4",
        "category": "melody"
    },
    {
        "description": "Ambient pad with long attack, reverb, and slow filter movement",
        "expected_contains": ["attack", "room"],
        "complexity": "L4",
        "category": "effects"
    },
]


def load_augmented_examples(path: str, n_per_category: int = 3) -> dict:
    """Load examples from augmented dataset, grouped by category."""
    examples = []
    with open(path) as f:
        for line in f:
            examples.append(json.loads(line))
    
    # Group by category
    by_category = {}
    for ex in examples:
        cat = ex.get('category', 'general')
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(ex)
    
    # Sample from each category
    sampled = {}
    for cat, exs in by_category.items():
        # Prefer originals and simpler examples for few-shot
        originals = [e for e in exs if e.get('augmentation') == 'original']
        if len(originals) >= n_per_category:
            sampled[cat] = random.sample(originals, n_per_category)
        else:
            sampled[cat] = random.sample(exs, min(n_per_category, len(exs)))
    
    return sampled


def format_few_shot_examples(examples: list) -> str:
    """Format examples for few-shot prompt."""
    formatted = []
    for ex in examples:
        desc = ex.get('description', 'Pattern')
        code = ex.get('code', '')
        # Truncate long code
        if len(code) > 150:
            code = code[:150] + "..."
        formatted.append(f"Description: {desc}\nCode: {code}")
    return "\n\n".join(formatted)


STRUDEL_CONTEXT = '''# Strudel Quick Reference
- `s("bd sd")` - play samples
- `note("c4 e4")` - play notes  
- `n("0 2 4").scale("C:minor")` - scale degrees
- `chord("<Cm7 G7>").voicing()` - chords
- Mini-notation: `*4` speed up, `<a b>` alternate, `[a b]` subdivide, `,` parallel
- Effects: `.lpf()` `.room()` `.delay()` `.attack()` `.decay()`
- Signals: `sine`, `irand(n)`, `perlin` for continuous values'''


def build_prompt(description: str, few_shot_examples: str, with_examples: bool = True) -> str:
    """Build the generation prompt."""
    if with_examples:
        return f"""{STRUDEL_CONTEXT}

## Examples
{few_shot_examples}

## Task
Generate Strudel code for: {description}

Output ONLY the code, no explanation."""
    else:
        return f"""{STRUDEL_CONTEXT}

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


def run_comparison(model: str = "llama3.2", augmented_path: str = None):
    """Run baseline vs few-shot comparison."""
    
    if augmented_path is None:
        augmented_path = "/home/ubuntu/Musicman/data/strudel_examples_augmented.jsonl"
    
    print(f"Loading augmented examples from: {augmented_path}")
    examples_by_cat = load_augmented_examples(augmented_path)
    
    print(f"Testing with model: {model}")
    print("=" * 70)
    
    baseline_results = []
    fewshot_results = []
    
    for i, test in enumerate(TEST_CASES, 1):
        print(f"\n[{i}/{len(TEST_CASES)}] {test['description'][:50]}...")
        
        # Get relevant few-shot examples
        category = test.get('category', 'general')
        relevant_examples = examples_by_cat.get(category, [])
        if not relevant_examples:
            relevant_examples = examples_by_cat.get('melody', [])[:2]
        few_shot_text = format_few_shot_examples(relevant_examples[:3])
        
        # Baseline (no examples)
        prompt_baseline = build_prompt(test['description'], "", with_examples=False)
        output_baseline = query_ollama(prompt_baseline, model)
        check_baseline = check_output(output_baseline, test['expected_contains'])
        baseline_results.append({
            "test": test['description'],
            "output": output_baseline,
            "check": check_baseline
        })
        
        # Few-shot (with examples)
        prompt_fewshot = build_prompt(test['description'], few_shot_text, with_examples=True)
        output_fewshot = query_ollama(prompt_fewshot, model)
        check_fewshot = check_output(output_fewshot, test['expected_contains'])
        fewshot_results.append({
            "test": test['description'],
            "output": output_fewshot,
            "check": check_fewshot
        })
        
        # Print comparison
        b_status = "PASS" if check_baseline['score'] >= 0.5 else "FAIL"
        f_status = "PASS" if check_fewshot['score'] >= 0.5 else "FAIL"
        improvement = check_fewshot['score'] - check_baseline['score']
        imp_str = f"+{improvement:.0%}" if improvement > 0 else f"{improvement:.0%}"
        
        print(f"  Baseline:  [{b_status}] {check_baseline['score']:.0%}")
        print(f"  Few-shot:  [{f_status}] {check_fewshot['score']:.0%} ({imp_str})")
    
    # Summary
    baseline_avg = sum(r['check']['score'] for r in baseline_results) / len(baseline_results)
    fewshot_avg = sum(r['check']['score'] for r in fewshot_results) / len(fewshot_results)
    
    baseline_pass = sum(1 for r in baseline_results if r['check']['score'] >= 0.5)
    fewshot_pass = sum(1 for r in fewshot_results if r['check']['score'] >= 0.5)
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"                    Baseline    Few-shot    Improvement")
    print(f"  Average Score:    {baseline_avg:>6.0%}      {fewshot_avg:>6.0%}      {fewshot_avg - baseline_avg:>+.0%}")
    print(f"  Tests Passed:     {baseline_pass:>6}/{len(TEST_CASES)}      {fewshot_pass:>6}/{len(TEST_CASES)}")
    print("=" * 70)
    
    # Save results
    results = {
        "model": model,
        "baseline": {
            "average_score": baseline_avg,
            "passed": baseline_pass,
            "results": baseline_results
        },
        "fewshot": {
            "average_score": fewshot_avg,
            "passed": fewshot_pass,
            "results": fewshot_results
        },
        "improvement": fewshot_avg - baseline_avg
    }
    
    output_file = "/home/ubuntu/Musicman/data/generation_comparison_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {output_file}")
    
    return results


if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "llama3.2"
    run_comparison(model)
