# Strudel Training Data

## Files

| File | Description | Records |
|------|-------------|---------|
| `strudel_examples.jsonl` | Original extracted examples | 612 |
| `strudel_examples_augmented.jsonl` | Augmented training set | 3,646 |
| `generation_test_results.json` | Baseline generation test | 8 tests |
| `generation_comparison_v2.json` | Feature-based few-shot test | 8 tests |

## Generation Test Results

| Method | Average Score | Tests Passed |
|--------|---------------|--------------|
| Baseline (no examples) | 65% | 7/8 |
| Category-based few-shot | 65% | 6/8 |
| **Feature-based + golden** | **100%** | **8/8** |

Key improvements:
- Added 30 curated "golden" examples for common patterns
- Feature-based example selection instead of category matching
- Preference for simpler, shorter examples

## Augmented Dataset

The augmented dataset applies 8 transformation strategies + golden examples:

| Strategy | Count | Description |
|----------|-------|-------------|
| tempo | 1,148 | Add setcpm() with various BPM |
| effect | 770 | Add reverb, delay, filters |
| time | 643 | Add .slow(), .fast(), .swing() |
| bank | 228 | Swap drum machine banks |
| combo | 121 | Tempo + effect combinations |
| key | 44 | Transpose to different keys |
| euclidean | 28 | Convert to euclidean rhythms |
| scale | 24 | Change scale types |
| golden | 30 | Curated simple examples |

**Multiplier: 6.0x** (612 → 3,646)

## Data Schema

```json
{
  "code": "s(\"bd*4\")",
  "description": "Four-on-the-floor kick drum pattern",
  "source_file": "golden_examples",
  "section": "Curated",
  "complexity": "L1",
  "category": "rhythm",
  "augmentation": "golden",
  "tags": ["four-on-floor", "kick", "basic"]
}
```

### Fields

- **code**: Valid Strudel/JavaScript code
- **description**: Natural language description
- **source_file**: Origin in docs (or "golden_examples")
- **section**: Section heading
- **complexity**: L1-L5
- **category**: rhythm, melody, harmony, effects, synthesis, composition
- **augmentation**: Transformation applied (or "original"/"golden")
- **tags**: Feature tags for retrieval (golden examples only)

## Usage

```python
import json

# Load augmented dataset
examples = []
with open('strudel_examples_augmented.jsonl') as f:
    for line in f:
        examples.append(json.loads(line))

# Filter golden examples (best for few-shot)
golden = [e for e in examples if e['augmentation'] == 'golden']

# Filter by feature tags
euclidean = [e for e in examples if 'euclidean' in e.get('tags', [])]

# Filter originals only
originals = [e for e in examples if e['augmentation'] == 'original']
```

## Scripts

| Script | Purpose |
|--------|---------|
| `extract_strudel_examples.py` | Extract from HTML docs |
| `augment_strudel_examples.py` | Generate variations |
| `add_golden_examples.py` | Add curated examples |
| `test_strudel_generation.py` | Baseline generation test |
| `test_with_augmented.py` | Category-based few-shot |
| `test_with_augmented_v2.py` | Feature-based few-shot |
