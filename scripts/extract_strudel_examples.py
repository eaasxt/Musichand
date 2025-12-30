#!/usr/bin/env python3
"""
Extract Strudel code examples from downloaded HTML documentation.
Outputs structured JSONL for AI training.
"""

import json
import re
import os
from pathlib import Path
from html.parser import HTMLParser
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class StrudelExample:
    """A single Strudel code example with metadata."""
    code: str
    description: str
    source_file: str
    section: str
    complexity: str  # L1-L5
    category: str    # rhythm, melody, harmony, effects, composition


class StrudelHTMLParser(HTMLParser):
    """Extract code examples and surrounding context from Strudel docs HTML."""

    def __init__(self):
        super().__init__()
        self.examples = []
        self.current_section = ""
        self.in_code = False
        self.in_heading = False
        self.in_paragraph = False
        self.current_code = ""
        self.current_description = ""
        self.heading_level = 0
        self.pending_description = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Track headings for section context
        if tag in ('h1', 'h2', 'h3', 'h4'):
            self.in_heading = True
            self.heading_level = int(tag[1])

        # Track code blocks (pre tags typically contain code)
        elif tag == 'pre':
            self.in_code = True
            self.current_code = ""

        # Track paragraphs for descriptions
        elif tag == 'p':
            self.in_paragraph = True

    def handle_endtag(self, tag):
        if tag in ('h1', 'h2', 'h3', 'h4'):
            self.in_heading = False

        elif tag == 'pre':
            self.in_code = False
            if self.current_code.strip():
                # Check if it looks like Strudel code
                code = self.current_code.strip()
                if self._is_strudel_code(code):
                    self.examples.append({
                        'code': code,
                        'section': self.current_section,
                        'description': self.pending_description.strip()
                    })
            self.current_code = ""

        elif tag == 'p':
            self.in_paragraph = False

    def handle_data(self, data):
        if self.in_heading:
            self.current_section = data.strip()
            self.pending_description = ""

        elif self.in_code:
            self.current_code += data

        elif self.in_paragraph:
            # Accumulate paragraph text as potential description
            self.pending_description = data.strip()

    def _is_strudel_code(self, code: str) -> bool:
        """Check if code looks like valid Strudel."""
        # Common Strudel patterns
        strudel_indicators = [
            r'\bs\s*\(',           # s("...")
            r'\bsound\s*\(',       # sound("...")
            r'\bnote\s*\(',        # note("...")
            r'\bn\s*\(',           # n("...")
            r'\bchord\s*\(',       # chord("...")
            r'\.scale\s*\(',       # .scale("...")
            r'\.voicing\s*\(',     # .voicing()
            r'\.lpf\s*\(',         # .lpf(...)
            r'\.room\s*\(',        # .room(...)
            r'\.slow\s*\(',        # .slow(...)
            r'\.fast\s*\(',        # .fast(...)
            r'\bstack\s*\(',       # stack(...)
            r'\bsetcpm\s*\(',      # setcpm(...)
            r'"[^"]*\*\d',         # "*4" pattern
            r'"[^"]*\(\d,\d',      # euclidean "(3,8)"
        ]

        for pattern in strudel_indicators:
            if re.search(pattern, code):
                return True
        return False


def classify_complexity(code: str) -> str:
    """Estimate complexity level L1-L5."""
    features = 0

    # Count complexity indicators
    if re.search(r',', code):  # parallel voices
        features += 1
    if re.search(r'\[.*\]', code):  # subdivisions
        features += 1
    if re.search(r'<.*>', code):  # alternation
        features += 1
    if re.search(r'\.lpf|\.hpf|\.room|\.delay', code):  # effects
        features += 1
    if re.search(r'\.scale|\.chord|\.voicing', code):  # tonal
        features += 1
    if re.search(r'irand|rand|perlin', code):  # generative
        features += 2
    if re.search(r'stack\s*\(', code):  # composition
        features += 2
    if re.search(r'\.layer\s*\(', code):  # layering
        features += 2
    if len(code) > 200:  # longer code
        features += 1

    if features <= 1:
        return "L1"
    elif features <= 2:
        return "L2"
    elif features <= 4:
        return "L3"
    elif features <= 6:
        return "L4"
    else:
        return "L5"


def classify_category(code: str, section: str) -> str:
    """Classify the musical category of the example."""
    section_lower = section.lower()
    code_lower = code.lower()

    # Check section name first
    if any(x in section_lower for x in ['rhythm', 'euclidean', 'drum', 'beat']):
        return "rhythm"
    if any(x in section_lower for x in ['melody', 'scale', 'note']):
        return "melody"
    if any(x in section_lower for x in ['chord', 'harmony', 'voicing']):
        return "harmony"
    if any(x in section_lower for x in ['effect', 'filter', 'reverb', 'delay']):
        return "effects"
    if any(x in section_lower for x in ['synth', 'sound design', 'envelope']):
        return "synthesis"

    # Fall back to code analysis
    if re.search(r'\bchord\b|\.voicing', code_lower):
        return "harmony"
    if re.search(r'\.scale\s*\(|note\s*\(', code_lower):
        return "melody"
    if re.search(r'\.lpf|\.hpf|\.room|\.delay|\.distort', code_lower):
        return "effects"
    if re.search(r'\bbd\b|\bsd\b|\bhh\b|\.bank', code_lower):
        return "rhythm"
    if re.search(r'stack\s*\(|\.layer', code_lower):
        return "composition"

    return "general"


def generate_description(code: str, original_desc: str, section: str) -> str:
    """Generate or enhance description for training."""
    if original_desc and len(original_desc) > 10:
        return original_desc

    # Generate based on code analysis
    parts = []

    # Detect main elements
    if re.search(r'\bbd\b', code):
        parts.append("kick drum")
    if re.search(r'\bsd\b', code):
        parts.append("snare")
    if re.search(r'\bhh\b', code):
        parts.append("hi-hat")
    if re.search(r'\.scale\s*\(["\']([^"\']+)', code):
        match = re.search(r'\.scale\s*\(["\']([^"\']+)', code)
        parts.append(f"{match.group(1)} scale")
    if re.search(r'\bchord\s*\(', code):
        parts.append("chord progression")
    if re.search(r'\.lpf', code):
        parts.append("lowpass filter")
    if re.search(r'\.room', code):
        parts.append("reverb")
    if re.search(r'irand|rand', code):
        parts.append("random/generative")

    if parts:
        return f"Pattern with {', '.join(parts)}"
    elif section:
        return f"Example from {section}"
    else:
        return "Strudel pattern"


def clean_code(code: str) -> str:
    """Clean up extracted code."""
    # Remove markdown code fence markers
    code = re.sub(r'^```\w*\n?', '', code)
    code = re.sub(r'\n?```$', '', code)

    # Remove HTML entities
    code = code.replace('&lt;', '<')
    code = code.replace('&gt;', '>')
    code = code.replace('&amp;', '&')
    code = code.replace('&quot;', '"')
    code = code.replace('&#x27;', "'")
    code = code.replace('&#39;', "'")

    # Trim whitespace
    code = code.strip()

    return code


def extract_from_file(filepath: Path) -> list[dict]:
    """Extract examples from a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

    parser = StrudelHTMLParser()
    try:
        parser.feed(content)
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return []

    examples = []
    for raw in parser.examples:
        code = clean_code(raw['code'])
        if not code or len(code) < 5:
            continue

        example = StrudelExample(
            code=code,
            description=generate_description(code, raw['description'], raw['section']),
            source_file=str(filepath.relative_to(filepath.parents[2])),
            section=raw['section'],
            complexity=classify_complexity(code),
            category=classify_category(code, raw['section'])
        )
        examples.append(asdict(example))

    return examples


def extract_all(docs_dir: Path, output_path: Path):
    """Extract examples from all HTML files in docs directory."""
    all_examples = []

    html_files = list(docs_dir.rglob("*.html"))
    print(f"Found {len(html_files)} HTML files")

    for filepath in html_files:
        examples = extract_from_file(filepath)
        all_examples.extend(examples)
        if examples:
            print(f"  {filepath.name}: {len(examples)} examples")

    # Deduplicate by code
    seen_codes = set()
    unique_examples = []
    for ex in all_examples:
        code_key = ex['code'].strip()
        if code_key not in seen_codes:
            seen_codes.add(code_key)
            unique_examples.append(ex)

    print(f"\nTotal: {len(unique_examples)} unique examples")

    # Write JSONL output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        for ex in unique_examples:
            f.write(json.dumps(ex) + '\n')

    print(f"Saved to: {output_path}")

    # Print statistics
    by_complexity = {}
    by_category = {}
    for ex in unique_examples:
        by_complexity[ex['complexity']] = by_complexity.get(ex['complexity'], 0) + 1
        by_category[ex['category']] = by_category.get(ex['category'], 0) + 1

    print("\nBy complexity:")
    for k in sorted(by_complexity.keys()):
        print(f"  {k}: {by_complexity[k]}")

    print("\nBy category:")
    for k, v in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

    return unique_examples


if __name__ == "__main__":
    import sys

    docs_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/ubuntu/Musicman/docs/strudel-docs/strudel.cc")
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("/home/ubuntu/Musicman/data/strudel_examples.jsonl")

    extract_all(docs_dir, output_path)
