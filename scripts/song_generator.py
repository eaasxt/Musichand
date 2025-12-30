#!/usr/bin/env python3
"""
Song Generator - Generate full songs with intro/verse/chorus/drop structure.
Uses Strudel's scene switching capabilities.
"""

import json
import random
from pathlib import Path
from typing import Optional

# Import local modules
from multitrack_generator import (
    parse_prompt, GENRE_PRESETS, CHORD_PROGRESSIONS, 
    roman_to_chord, KEYS
)

# Song structures by genre
SONG_STRUCTURES = {
    "house": ["intro", "buildup", "drop", "breakdown", "drop", "outro"],
    "techno": ["intro", "buildup", "drop", "drop", "breakdown", "drop", "outro"],
    "ambient": ["intro", "verse", "verse", "bridge", "verse", "outro"],
    "dnb": ["intro", "drop", "breakdown", "drop", "outro"],
    "lofi": ["intro", "verse", "chorus", "verse", "chorus", "outro"],
    "jazz": ["intro", "head", "solo", "head", "outro"],
    "trap": ["intro", "verse", "drop", "verse", "drop", "outro"],
    "minimal": ["intro", "buildup", "main", "variation", "main", "outro"],
    "disco": ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
}

# Section characteristics
SECTION_MODIFIERS = {
    "intro": {
        "drums": False,
        "bass": False, 
        "chords": True,
        "lead": False,
        "filter": ".lpf(400)",
        "gain": ".gain(0.5)",
    },
    "verse": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": False,
        "filter": ".lpf(800)",
        "gain": ".gain(0.7)",
    },
    "chorus": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": True,
        "filter": "",
        "gain": ".gain(1)",
    },
    "buildup": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": False,
        "filter": ".lpf(sine.range(400,4000).slow(8))",
        "gain": ".gain(0.8)",
    },
    "drop": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": True,
        "filter": "",
        "gain": ".gain(1.1)",
    },
    "breakdown": {
        "drums": False,
        "bass": True,
        "chords": True,
        "lead": False,
        "filter": ".lpf(600)",
        "gain": ".gain(0.6)",
    },
    "bridge": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": False,
        "filter": ".lpf(1000)",
        "gain": ".gain(0.8)",
    },
    "head": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": True,
        "filter": "",
        "gain": ".gain(0.9)",
    },
    "solo": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": True,
        "filter": "",
        "gain": ".gain(1)",
    },
    "main": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": False,
        "filter": "",
        "gain": ".gain(1)",
    },
    "variation": {
        "drums": True,
        "bass": True,
        "chords": True,
        "lead": True,
        "filter": ".lpf(1200)",
        "gain": ".gain(0.9)",
    },
    "outro": {
        "drums": True,
        "bass": False,
        "chords": True,
        "lead": False,
        "filter": ".lpf(sine.range(2000,400).slow(8))",
        "gain": ".gain(0.6)",
    },
}


def generate_section(section_name: str, genre: str, key: str, mode: str,
                     tempo: int, chord_str: str) -> str:
    """Generate code for a single section."""
    
    preset = GENRE_PRESETS.get(genre, GENRE_PRESETS["house"])
    mods = SECTION_MODIFIERS.get(section_name, SECTION_MODIFIERS["verse"])
    scale = f"{key}:{mode}"
    
    layers = []
    
    # Drums
    if mods["drums"]:
        drums = preset["drums"]
        layers.append(f'    {drums}')
    
    # Bass
    if mods["bass"]:
        bass_pattern = preset.get("bass_pattern", '"0 3 5 7"')
        bass_sound = preset.get("bass_sound", "sawtooth")
        bass = f'n({bass_pattern}).scale("{scale}").s("{bass_sound}").lpf(400).gain(0.8)'
        layers.append(f'    {bass}')
    
    # Chords
    if mods["chords"]:
        chords = f'chord("<{chord_str}>").voicing().s("triangle").lpf(800).gain(0.4)'
        layers.append(f'    {chords}')
    
    # Lead
    if mods["lead"]:
        if mode == "minor":
            melody = "0 2 3 5 7 5 3 2"
        else:
            melody = "0 2 4 5 7 5 4 2"
        lead = f'n("{melody}").scale("{scale}").s("sine").lpf(2000).gain(0.4)'
        layers.append(f'    {lead}')
    
    # Build section
    section_filter = mods.get("filter", "")
    section_gain = mods.get("gain", "")
    
    code = f'  "{section_name}": () => stack(\n'
    code += ',\n'.join(layers)
    code += f'\n  ){section_filter}{section_gain}'
    
    return code


def generate_song(prompt: str) -> dict:
    """Generate a full song with multiple sections."""
    
    # Parse prompt
    params = parse_prompt(prompt)
    genre = params["genre"]
    key = params["key"] or random.choice(["C", "D", "E", "F", "G", "A"])
    mode = params["mode"] or random.choice(["major", "minor"])
    
    # Get tempo
    preset = GENRE_PRESETS.get(genre, GENRE_PRESETS["house"])
    if params["tempo"]:
        tempo = params["tempo"]
    else:
        tempo_range = preset["tempo"]
        tempo = (tempo_range[0] + tempo_range[1]) // 2
    
    # Get chord progression
    prog_style = random.choice(list(CHORD_PROGRESSIONS[mode].keys()))
    progression = CHORD_PROGRESSIONS[mode][prog_style]
    chord_names = [roman_to_chord(num, key, mode) for num in progression]
    chord_str = " ".join(chord_names)
    
    # Get song structure
    structure = SONG_STRUCTURES.get(genre, SONG_STRUCTURES["house"])
    
    # Generate sections
    sections = []
    seen_sections = set()
    
    for section_name in structure:
        if section_name not in seen_sections:
            section_code = generate_section(
                section_name, genre, key, mode, tempo, chord_str
            )
            sections.append(section_code)
            seen_sections.add(section_name)
    
    # Build full song code
    lines = [
        f'// {genre.title()} song in {key} {mode}',
        f'// Structure: {" -> ".join(structure)}',
        f'// Tempo: {tempo} BPM | Progression: {" - ".join(progression)}',
        f'',
        f'setcpm({tempo}/4);',
        f'',
        f'// Define sections',
        f'const sections = {{'
    ]
    
    lines.append(',\n'.join(sections))
    lines.append('};')
    lines.append('')
    
    # Generate the arrangement
    lines.append('// Play the song (change section with keyboard)')
    lines.append('// Press 1-9 to switch sections manually')
    
    # Default to first section
    first_section = structure[0]
    lines.append(f'sections["{first_section}"]()')
    
    # Add section guide
    lines.append('')
    lines.append('// Section order:')
    for i, section in enumerate(structure):
        lines.append(f'// {i+1}. {section}')
    
    code = '\n'.join(lines)
    
    return {
        "prompt": prompt,
        "params": params,
        "structure": structure,
        "code": code,
        "sections": list(seen_sections)
    }


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate full songs with structure")
    parser.add_argument("prompt", nargs="?", default="house track",
                        help="Description of the song")
    args = parser.parse_args()
    
    result = generate_song(args.prompt)
    
    print(f"\n{'='*60}")
    print(f"Prompt: {result['prompt']}")
    print(f"Structure: {' -> '.join(result['structure'])}")
    print(f"Sections: {', '.join(result['sections'])}")
    print(f"{'='*60}")
    print(result['code'])
    print(f"{'='*60}")
