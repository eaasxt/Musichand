#!/usr/bin/env python3
"""
Augment Strudel training examples with systematic variations.
"""

import json
import re
import random
from pathlib import Path
from copy import deepcopy

DRUM_BANKS = [
    "RolandTR808", "RolandTR909", "RolandTR707", "RolandTR505",
    "AkaiLinn", "RhythmAce", "RolandCompurhythm1000", "ViscoSpaceDrum",
]

TEMPOS = {
    "slow": [60, 70, 80],
    "medium": [90, 100, 110],
    "fast": [120, 130, 140],
    "very_fast": [150, 160, 174],
}

KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
SCALE_TYPES = ["major", "minor", "dorian", "phrygian", "lydian", "mixolydian", "pentatonic", "blues"]

EFFECT_PRESETS = {
    "reverb_small": ".room(0.2)",
    "reverb_large": ".room(0.6).roomsize(4)",
    "delay_short": ".delay(0.3).delaytime(0.125)",
    "delay_long": ".delay(0.5).delaytime(0.25).delayfeedback(0.5)",
    "filtered": ".lpf(800)",
    "filtered_resonant": ".lpf(600).lpq(10)",
    "bright": ".hpf(200)",
    "lo_fi": ".crush(8).coarse(4)",
}

TIME_MODS = {
    "half_speed": ".slow(2)",
    "double_speed": ".fast(2)",
    "swing": ".swing(4)",
    "reverse": ".rev()",
}

EUCLIDEAN_PATTERNS = [(3, 8), (5, 8), (7, 8), (3, 4), (5, 16), (7, 12), (11, 16)]


def augment_tempo(example):
    results = []
    code = example['code']
    if 'setcpm' in code.lower():
        return results
    tempo_category = random.choice(list(TEMPOS.keys()))
    for tempo in TEMPOS[tempo_category]:
        new_example = deepcopy(example)
        new_example['code'] = f"setcpm({tempo}/4)\n{code}"
        new_example['description'] = f"{example['description']} at {tempo} BPM"
        new_example['augmentation'] = f"tempo_{tempo}"
        results.append(new_example)
    return results


def augment_bank(example):
    results = []
    code = example['code']
    if example.get('category') != 'rhythm':
        return results
    if not any(d in code for d in ['bd', 'sd', 'hh', 'oh', 'cp', 'rim']):
        return results
    has_bank = '.bank(' in code
    for bank in random.sample(DRUM_BANKS, min(3, len(DRUM_BANKS))):
        if has_bank:
            new_code = re.sub(r'\.bank\(["\'][^"\']+["\']\)', f'.bank("{bank}")', code)
        else:
            new_code = code.rstrip()
            if new_code.endswith(')'):
                new_code += f'.bank("{bank}")'
            else:
                continue
        if new_code != code:
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} with {bank}"
            new_example['augmentation'] = f"bank_{bank}"
            results.append(new_example)
    return results


def augment_scale(example):
    results = []
    code = example['code']
    if '.scale(' not in code and 'scale(' not in code:
        return results
    match = re.search(r'\.?scale\s*\(\s*["\']([A-G]#?b?)(:?\w+)?["\']', code)
    if not match:
        return results
    original_key = match.group(1)
    for new_key in random.sample([k for k in KEYS if k != original_key], min(3, len(KEYS)-1)):
        new_code = re.sub(
            r'(\.?scale\s*\(\s*["\'])([A-G]#?b?)(:?\w+)?(["\'])',
            f'\\g<1>{new_key}\\g<3>\\g<4>', code
        )
        if new_code != code:
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} in {new_key}"
            new_example['augmentation'] = f"key_{new_key}"
            results.append(new_example)
    return results


def augment_scale_type(example):
    results = []
    code = example['code']
    if '.scale(' not in code:
        return results
    match = re.search(r'(\.?scale\s*\(\s*["\'][A-G]#?b?:)(\w+)(["\'])', code)
    if not match:
        return results
    original_type = match.group(2)
    for new_type in random.sample([t for t in SCALE_TYPES if t != original_type], min(2, len(SCALE_TYPES)-1)):
        new_code = re.sub(
            r'(\.?scale\s*\(\s*["\'][A-G]#?b?:)(\w+)(["\'])',
            f'\\g<1>{new_type}\\g<3>', code
        )
        if new_code != code:
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} using {new_type} scale"
            new_example['augmentation'] = f"scale_{new_type}"
            results.append(new_example)
    return results


def augment_effects(example):
    results = []
    code = example['code']
    effect_count = sum(1 for e in ['.room', '.delay', '.lpf', '.hpf', '.crush'] if e in code)
    if effect_count >= 2:
        return results
    for name, chain in random.sample(list(EFFECT_PRESETS.items()), min(2, len(EFFECT_PRESETS))):
        new_code = code.rstrip()
        if new_code.endswith(')'):
            new_code += chain
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} with {name.replace('_', ' ')}"
            new_example['augmentation'] = f"effect_{name}"
            results.append(new_example)
    return results


def augment_time(example):
    results = []
    code = example['code']
    if any(m in code for m in ['.slow(', '.fast(', '.swing(', '.rev(']):
        return results
    for name, mod in random.sample(list(TIME_MODS.items()), min(2, len(TIME_MODS))):
        new_code = code.rstrip()
        if new_code.endswith(')'):
            new_code += mod
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} ({name.replace('_', ' ')})"
            new_example['augmentation'] = f"time_{name}"
            results.append(new_example)
    return results


def augment_euclidean(example):
    results = []
    code = example['code']
    if example.get('category') != 'rhythm':
        return results
    if re.search(r'\(\d+,\d+', code):
        return results
    for drum in ['bd', 'sd', 'hh', 'cp', 'rim']:
        pattern = rf's\s*\(\s*["\']({drum})(\*\d+)?["\']\s*\)'
        if re.search(pattern, code):
            for pulses, steps in random.sample(EUCLIDEAN_PATTERNS, min(2, len(EUCLIDEAN_PATTERNS))):
                new_code = re.sub(pattern, f's("{drum}({pulses},{steps})")', code)
                if new_code != code:
                    new_example = deepcopy(example)
                    new_example['code'] = new_code
                    new_example['description'] = f"{example['description']} euclidean ({pulses},{steps})"
                    new_example['augmentation'] = f"euclidean_{pulses}_{steps}"
                    results.append(new_example)
            break
    return results


def augment_combination(example):
    results = []
    code = example['code']
    if example.get('complexity') not in ['L2', 'L3', 'L4']:
        return results
    if 'setcpm' not in code.lower() and '.room' not in code:
        tempo = random.choice([90, 120, 140])
        effect = random.choice(['.room(0.3)', '.delay(0.3).delaytime(0.25)'])
        new_code = code.rstrip()
        if new_code.endswith(')'):
            new_code = f"setcpm({tempo}/4)\n{new_code}{effect}"
            new_example = deepcopy(example)
            new_example['code'] = new_code
            new_example['description'] = f"{example['description']} at {tempo} BPM with effects"
            new_example['augmentation'] = f"combo_tempo_{tempo}"
            results.append(new_example)
    return results


STRATEGY_MAP = {
    'tempo': augment_tempo,
    'bank': augment_bank,
    'scale': augment_scale,
    'scale_type': augment_scale_type,
    'effects': augment_effects,
    'time': augment_time,
    'euclidean': augment_euclidean,
    'combination': augment_combination,
}


def augment_example(example, strategies=None):
    if strategies is None:
        strategies = list(STRATEGY_MAP.keys())
    all_augmented = []
    for strategy in strategies:
        if strategy in STRATEGY_MAP:
            try:
                all_augmented.extend(STRATEGY_MAP[strategy](example))
            except Exception:
                pass
    return all_augmented


def augment_dataset(input_path, output_path, max_per_example=5, include_originals=True):
    originals = []
    with open(input_path) as f:
        for line in f:
            originals.append(json.loads(line))
    print(f"Loaded {len(originals)} original examples")

    all_examples = []
    if include_originals:
        for ex in originals:
            ex['augmentation'] = 'original'
            all_examples.append(ex)

    aug_counts = {}
    for i, example in enumerate(originals):
        augmented = augment_example(example)
        if len(augmented) > max_per_example:
            augmented = random.sample(augmented, max_per_example)
        for aug in augmented:
            aug_type = aug.get('augmentation', 'unknown').split('_')[0]
            aug_counts[aug_type] = aug_counts.get(aug_type, 0) + 1
        all_examples.extend(augmented)
        if (i + 1) % 100 == 0:
            print(f"  Processed {i + 1}/{len(originals)}...")

    seen = set()
    unique = []
    for ex in all_examples:
        key = ex['code'].strip()
        if key not in seen:
            seen.add(key)
            unique.append(ex)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        for ex in unique:
            f.write(json.dumps(ex) + '\n')

    print(f"\n{'='*60}")
    print(f"Original: {len(originals)}")
    print(f"After augmentation: {len(unique)}")
    print(f"Multiplier: {len(unique) / len(originals):.1f}x")
    print(f"\nBreakdown:")
    for t, c in sorted(aug_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")
    print(f"\nSaved: {output_path}")
    return unique


if __name__ == "__main__":
    import sys
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/ubuntu/Musicman/data/strudel_examples.jsonl")
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("/home/ubuntu/Musicman/data/strudel_examples_augmented.jsonl")
    augment_dataset(input_path, output_path)
