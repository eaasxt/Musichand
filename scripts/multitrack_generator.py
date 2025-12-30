#!/usr/bin/env python3
"""
Multi-Track Composition Generator - Creates full Strudel compositions
with coordinated drums, bass, chords, and melody layers.
"""

import json
import re
import random
from pathlib import Path
from typing import Optional
import subprocess

# Ollama settings
DEFAULT_MODEL = "qwen2.5:32b"
OLLAMA_URL = "http://localhost:11434/api/generate"

# Musical data
KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

# Scale degrees in semitones (for chord building)
MAJOR_DEGREES = {
    "I": (0, ""),    # major
    "ii": (2, "m"),  # minor
    "iii": (4, "m"), # minor
    "IV": (5, ""),   # major
    "V": (7, ""),    # major
    "vi": (9, "m"),  # minor
    "vii": (11, "dim"), # diminished
}

MINOR_DEGREES = {
    "i": (0, "m"),    # minor
    "ii": (2, "dim"), # diminished
    "III": (3, ""),   # major (natural minor: b3)
    "iv": (5, "m"),   # minor
    "v": (7, "m"),    # minor (natural minor)
    "VI": (8, ""),    # major (natural minor: b6)
    "VII": (10, ""),  # major (natural minor: b7)
}

GENRE_PRESETS = {
    "house": {
        "tempo": (120, 128),
        "drums": 's("bd*4, ~ sd ~ sd, hh*8")',
        "bass_pattern": '"0 ~ 0 ~ 0 ~ 0 3"',
        "bass_sound": "sawtooth",
        "lead_active": False,
    },
    "techno": {
        "tempo": (130, 140),
        "drums": 's("bd*4, ~ sd:2 ~ sd:2, hh(5,8)")',
        "bass_pattern": '"0*4"',
        "bass_sound": "square",
        "lead_active": False,
    },
    "ambient": {
        "tempo": (60, 80),
        "drums": 's("~ bd ~ ~, ~ ~ sd ~")',
        "bass_pattern": '"0 ~ ~ 3 ~ ~ 5 ~"',
        "bass_sound": "sine",
        "lead_active": True,
    },
    "dnb": {
        "tempo": (170, 180),
        "drums": 's("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ ~ sd, hh*16")',
        "bass_pattern": '"0 0 ~ 0 ~ 0 0 ~"',
        "bass_sound": "sawtooth",
        "lead_active": False,
    },
    "lofi": {
        "tempo": (70, 85),
        "drums": 's("bd ~ ~ bd, ~ sd ~ ~, hh*4").room(0.3)',
        "bass_pattern": '"0 ~ 3 ~"',
        "bass_sound": "triangle",
        "lead_active": True,
    },
    "jazz": {
        "tempo": (100, 140),
        "drums": 's("bd ~ ~ bd, ~ sd:brush ~ sd:brush, hh(3,8)")',
        "bass_pattern": '"0 2 3 5"',
        "bass_sound": "triangle",
        "lead_active": True,
    },
    "minimal": {
        "tempo": (120, 125),
        "drums": 's("bd*4, hh(3,8)")',
        "bass_pattern": '"0 ~ ~ ~"',
        "bass_sound": "sine",
        "lead_active": False,
    },
    "disco": {
        "tempo": (115, 125),
        "drums": 's("bd*4, ~ sd ~ sd, hh*16")',
        "bass_pattern": '"0 0 3 3 5 5 3 3"',
        "bass_sound": "sawtooth",
        "lead_active": False,
    },
    "trap": {
        "tempo": (130, 150),
        "drums": 's("bd ~ ~ ~ bd ~ ~ bd, ~ ~ ~ ~ sd ~ ~ ~, hh*16")',
        "bass_pattern": '"0 ~ 0 ~ ~ 0 ~ ~"',
        "bass_sound": "square",
        "lead_active": False,
    },
}

CHORD_PROGRESSIONS = {
    "major": {
        "pop": ["I", "V", "vi", "IV"],
        "jazz": ["ii", "V", "I", "I"],
        "rock": ["I", "IV", "V", "I"],
        "emotional": ["I", "vi", "IV", "V"],
        "uplifting": ["I", "IV", "I", "V"],
    },
    "minor": {
        "pop": ["i", "VI", "III", "VII"],
        "jazz": ["i", "iv", "VII", "III"],
        "rock": ["i", "iv", "v", "i"],
        "emotional": ["i", "VII", "VI", "VII"],
        "dark": ["i", "iv", "i", "v"],
    },
}


def parse_prompt(prompt: str) -> dict:
    """Extract musical parameters from natural language prompt."""
    prompt_lower = prompt.lower()
    
    params = {
        "genre": "house",
        "key": None,
        "mode": None,
        "tempo": None,
        "energy": "medium",
        "include_lead": False,
        "prog_style": None,
    }
    
    # Detect genre
    for genre in GENRE_PRESETS:
        if genre in prompt_lower:
            params["genre"] = genre
            break
    
    # Detect specific keywords for genre/style
    if "chill" in prompt_lower or "relaxed" in prompt_lower:
        params["genre"] = "lofi"
    elif "fast" in prompt_lower or "energetic" in prompt_lower:
        params["energy"] = "high"
    elif "slow" in prompt_lower:
        params["energy"] = "low"
    
    # Detect progression style keywords
    if "dark" in prompt_lower:
        params["prog_style"] = "dark"
    elif "uplifting" in prompt_lower or "happy" in prompt_lower:
        params["prog_style"] = "uplifting"
    elif "emotional" in prompt_lower or "sad" in prompt_lower:
        params["prog_style"] = "emotional"
    elif "jazz" in prompt_lower:
        params["prog_style"] = "jazz"
    
    # Detect key
    for key in KEYS:
        patterns = [
            rf"\b{key}\s*(major|minor|maj|min)\b",
            rf"\bin\s+{key}\b",
            rf"\bkey\s+of\s+{key}\b",
        ]
        for pattern in patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                params["key"] = key
                break
    
    # Detect mode
    if "major" in prompt_lower or "happy" in prompt_lower or "bright" in prompt_lower:
        params["mode"] = "major"
    elif "minor" in prompt_lower or "sad" in prompt_lower or "dark" in prompt_lower:
        params["mode"] = "minor"
    
    # Detect tempo
    tempo_match = re.search(r"(\d{2,3})\s*bpm", prompt_lower)
    if tempo_match:
        params["tempo"] = int(tempo_match.group(1))
    
    # Detect lead/melody requests
    if any(word in prompt_lower for word in ["melody", "lead", "solo"]):
        params["include_lead"] = True
    
    return params


def roman_to_chord(numeral: str, root_key: str, mode: str) -> str:
    """Convert roman numeral to chord name in the given key."""
    degrees = MINOR_DEGREES if mode == "minor" else MAJOR_DEGREES
    
    if numeral in degrees:
        semitones, quality = degrees[numeral]
    else:
        # Fallback
        semitones, quality = 0, "m" if mode == "minor" else ""
    
    root_idx = KEYS.index(root_key)
    chord_idx = (root_idx + semitones) % 12
    
    return KEYS[chord_idx] + quality


def build_composition(params: dict) -> str:
    """Build a multi-track Strudel composition from parameters."""
    
    genre = params["genre"]
    preset = GENRE_PRESETS.get(genre, GENRE_PRESETS["house"])
    
    # Determine tempo
    if params["tempo"]:
        tempo = params["tempo"]
    else:
        tempo_range = preset["tempo"]
        if params["energy"] == "high":
            tempo = tempo_range[1]
        elif params["energy"] == "low":
            tempo = tempo_range[0]
        else:
            tempo = (tempo_range[0] + tempo_range[1]) // 2
    
    # Determine key and mode
    key = params["key"] or random.choice(["C", "D", "E", "F", "G", "A"])
    mode = params["mode"] or random.choice(["major", "minor"])
    scale = f"{key}:{mode}"
    
    # Choose chord progression
    prog_style = params["prog_style"] or random.choice(list(CHORD_PROGRESSIONS[mode].keys()))
    if prog_style not in CHORD_PROGRESSIONS[mode]:
        prog_style = random.choice(list(CHORD_PROGRESSIONS[mode].keys()))
    
    progression = CHORD_PROGRESSIONS[mode][prog_style]
    
    # Convert roman numerals to chord names
    chord_names = [roman_to_chord(num, key, mode) for num in progression]
    chord_str = " ".join(chord_names)
    
    # Build the composition
    lines = [
        f"// {genre.title()} composition in {key} {mode}",
        f"// Tempo: {tempo} BPM | Progression: {' - '.join(progression)}",
        f"setcpm({tempo}/4);",
        "",
        "stack(",
        "  // === DRUMS ===",
        f"  {preset['drums']},",
        "",
        "  // === BASS ===",
        f"  n({preset['bass_pattern']}).scale(\"{scale}\").s(\"{preset['bass_sound']}\").lpf(300).gain(0.8),",
        "",
        "  // === CHORDS ===",
        f"  chord(\"<{chord_str}>\").voicing().s(\"triangle\").lpf(800).gain(0.4).room(0.2)",
    ]
    
    # Add lead if requested or preset includes it
    if params["include_lead"] or preset.get("lead_active"):
        lines.append(",")
        lines.append("")
        lines.append("  // === LEAD ===")
        if mode == "minor":
            melody = "0 2 3 5 7 5 3 2"
        else:
            melody = "0 2 4 5 7 5 4 2"
        lines.append(f"  n(\"{melody}\").scale(\"{scale}\").s(\"sine\").lpf(2000).gain(0.3)")
    
    lines.append(")")
    
    return "\n".join(lines)


def generate_with_llm(prompt: str, model: str = DEFAULT_MODEL) -> Optional[str]:
    """Use LLM to generate more creative compositions."""
    
    system_prompt = """You are a Strudel live coding music expert. Generate ONLY valid Strudel JavaScript code.

Rules:
- Use stack() to layer multiple patterns
- Use s() for samples/synths: s("bd sd hh")
- Use n() for notes with scale(): n("0 2 4").scale("C:minor")
- Use chord() for chords: chord("<Am Dm>")
- Add effects: .lpf(freq), .room(amt), .gain(amt), .fast(n), .slow(n)
- Set tempo with setcpm(bpm/4)

Output ONLY the code, no explanations."""

    full_prompt = f"Generate a Strudel composition for: {prompt}"
    
    try:
        result = subprocess.run(
            ["curl", "-s", OLLAMA_URL, "-d", json.dumps({
                "model": model,
                "prompt": full_prompt,
                "system": system_prompt,
                "stream": False,
                "options": {"temperature": 0.7}
            })],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        response = json.loads(result.stdout)
        code = response.get("response", "").strip()
        
        # Extract code block if wrapped
        if "```" in code:
            match = re.search(r"```(?:javascript|js)?\s*([\s\S]*?)```", code)
            if match:
                code = match.group(1).strip()
        
        return code if code else None
        
    except Exception as e:
        print(f"LLM generation failed: {e}")
        return None


def generate_composition(prompt: str, use_llm: bool = False, model: str = DEFAULT_MODEL) -> dict:
    """Generate a complete multi-track composition."""
    
    # Parse the prompt for parameters
    params = parse_prompt(prompt)
    
    if use_llm:
        # Try LLM generation first
        code = generate_with_llm(prompt, model)
        if code:
            return {
                "prompt": prompt,
                "params": params,
                "code": code,
                "method": "llm"
            }
    
    # Fall back to template-based generation
    code = build_composition(params)
    
    return {
        "prompt": prompt,
        "params": params,
        "code": code,
        "method": "template"
    }


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate multi-track Strudel compositions")
    parser.add_argument("prompt", nargs="?", default="house beat with bass and chords",
                        help="Description of the music to generate")
    parser.add_argument("--llm", action="store_true", help="Use LLM for generation")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Ollama model to use")
    args = parser.parse_args()
    
    result = generate_composition(args.prompt, use_llm=args.llm, model=args.model)
    
    print(f"\n{'='*60}")
    print(f"Prompt: {result['prompt']}")
    print(f"Detected: {result['params']}")
    print(f"Method: {result['method']}")
    print(f"{'='*60}")
    print(result['code'])
    print(f"{'='*60}")
