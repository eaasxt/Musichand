#!/usr/bin/env python3
"""
Audio to Strudel v2 - Enhanced audio analysis for Strudel code generation.
Analyzes reference tracks to create training data with:
- Drum pattern detection (kick/snare/hihat separation)
- Chord progression detection
- Melody/bass line extraction
- Multi-layer Strudel code generation
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
import tempfile

VENV_PYTHON = "/home/ubuntu/.venv/strudel-ml/bin/python"

# Analysis script that runs in the ML venv with librosa
ANALYSIS_SCRIPT = '''
import librosa
import numpy as np
import json
import sys

KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

def analyze_audio(audio_path, duration=30):
    """Full audio analysis returning structured data."""

    # Load audio
    y, sr = librosa.load(audio_path, sr=22050, duration=duration)

    # === TEMPO & BEAT DETECTION ===
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(tempo) if hasattr(tempo, "item") else float(tempo)
    beat_times = librosa.frames_to_time(beats, sr=sr)

    # === HARMONIC/PERCUSSIVE SEPARATION ===
    y_harmonic, y_percussive = librosa.effects.hpss(y)

    # === DRUM PATTERN ANALYSIS ===
    drums = analyze_drums_detailed(y_percussive, sr, tempo, len(beat_times))

    # === CHORD/HARMONY ANALYSIS ===
    harmony = analyze_harmony_detailed(y_harmonic, sr, tempo)

    # === MELODY ANALYSIS ===
    melody = analyze_melody(y_harmonic, sr)

    # === STRUCTURE ANALYSIS ===
    structure = {
        "tempo": round(tempo),
        "beats": len(beat_times),
        "duration": float(len(y) / sr),
        "beat_duration": round(60 / tempo, 3) if tempo > 0 else 0.5
    }

    return {
        "structure": structure,
        "drums": drums,
        "harmony": harmony,
        "melody": melody
    }


def analyze_drums_detailed(y_perc, sr, tempo, n_beats):
    """Analyze percussive content for drum patterns."""

    # Frequency band separation for different drum sounds
    # Kick: 20-120 Hz, Snare: 200-400 Hz, Hihat: 6000-16000 Hz
    # Adjusted ranges to reduce cross-contamination

    # Get spectrogram
    S = np.abs(librosa.stft(y_perc))
    freqs = librosa.fft_frequencies(sr=sr)

    # Define frequency bands (tighter ranges)
    kick_mask = (freqs >= 30) & (freqs <= 120)
    snare_mask = (freqs >= 200) & (freqs <= 400)
    hihat_mask = (freqs >= 6000) & (freqs <= 16000)

    # Sum energy in each band over time
    kick_energy = np.sum(S[kick_mask, :], axis=0)
    snare_energy = np.sum(S[snare_mask, :], axis=0)
    hihat_energy = np.sum(S[hihat_mask, :], axis=0)

    # Detect onsets in each band with different thresholds
    kick_onsets = detect_band_onsets(kick_energy, sr, threshold=0.4)
    snare_onsets = detect_band_onsets(snare_energy, sr, threshold=0.5)
    hihat_onsets = detect_band_onsets(hihat_energy, sr, threshold=0.3)

    # Convert to pattern (quantize to 16th notes)
    beat_duration = 60 / tempo if tempo > 0 else 0.5
    sixteenth = beat_duration / 4

    # Analyze first 4 beats (1 bar) to detect pattern
    bar_duration = beat_duration * 4

    kick_pattern = quantize_to_pattern(kick_onsets, sixteenth, bar_duration)
    snare_pattern = quantize_to_pattern(snare_onsets, sixteenth, bar_duration)
    hihat_pattern = quantize_to_pattern(hihat_onsets, sixteenth, bar_duration)

    # Apply common pattern heuristics
    kick_pattern = refine_kick_pattern(kick_pattern)
    snare_pattern = refine_snare_pattern(snare_pattern)
    hihat_pattern = refine_hihat_pattern(hihat_pattern)

    # Detect pattern style
    style = detect_drum_style(kick_pattern, snare_pattern, hihat_pattern)

    return {
        "kick_pattern": kick_pattern,
        "snare_pattern": snare_pattern,
        "hihat_pattern": hihat_pattern,
        "kick_onsets": len(kick_onsets),
        "snare_onsets": len(snare_onsets),
        "hihat_onsets": len(hihat_onsets),
        "style": style
    }


def refine_kick_pattern(pattern):
    """Apply heuristics to clean up kick pattern."""
    # If we have 4+ kicks evenly spaced, assume four-on-floor
    if sum(pattern) >= 4:
        if pattern[0] and pattern[4] and pattern[8] and pattern[12]:
            return [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]
    return pattern


def refine_snare_pattern(pattern):
    """Apply heuristics to clean up snare pattern."""
    # Common pattern: snare on 2 and 4 (positions 4 and 12)
    if pattern[4] and pattern[12]:
        return [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
    # Check for half-time (just beat 3)
    if pattern[8] and not pattern[4] and not pattern[12]:
        return [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
    return pattern


def refine_hihat_pattern(pattern):
    """Apply heuristics to clean up hihat pattern."""
    hits = sum(pattern)
    # If many hits, assume consistent pattern
    if hits >= 12:
        return [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  # 16ths
    if hits >= 6:
        return [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]  # 8ths
    if hits >= 3:
        return [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]  # quarters
    return pattern


def detect_band_onsets(energy, sr, threshold=0.3):
    """Detect onsets from energy envelope."""
    # Normalize
    if np.max(energy) > 0:
        energy = energy / np.max(energy)

    # Simple peak detection
    peaks = []
    hop_length = 512
    min_gap = int(sr / hop_length * 0.05)  # Minimum 50ms between peaks

    last_peak = -min_gap
    for i in range(1, len(energy) - 1):
        if (energy[i] > threshold and 
            energy[i] > energy[i-1] and 
            energy[i] > energy[i+1] and
            i - last_peak >= min_gap):
            time = librosa.frames_to_time(i, sr=sr, hop_length=hop_length)
            peaks.append(time)
            last_peak = i

    return peaks


def quantize_to_pattern(onsets, step_duration, bar_duration, steps=16):
    """Quantize onset times to a 16-step pattern."""
    pattern = [0] * steps

    for onset in onsets:
        if onset < bar_duration:
            step = int(round(onset / step_duration)) % steps
            pattern[step] = 1

    return pattern


def detect_drum_style(kick, snare, hihat):
    """Detect drum style from patterns."""

    kick_count = sum(kick)
    snare_count = sum(snare)
    hihat_count = sum(hihat)

    # Four-on-the-floor: kick on 1, 5, 9, 13 (every beat)
    four_floor = kick[0] and kick[4] and kick[8] and kick[12]

    # Backbeat: snare on 5 and 13 (beats 2 and 4)
    backbeat = snare[4] and snare[12]

    # Busy hihats
    busy_hats = hihat_count >= 8

    if four_floor and busy_hats:
        return "house"
    elif four_floor and backbeat:
        return "disco"
    elif backbeat and not four_floor:
        return "rock"
    elif kick_count <= 3 and snare_count <= 2:
        return "minimal"
    elif hihat_count >= 12:
        return "dnb"
    else:
        return "breakbeat"


def analyze_harmony_detailed(y_harm, sr, tempo):
    """Analyze harmonic content for chords and key."""

    # Chromagram
    chroma = librosa.feature.chroma_cqt(y=y_harm, sr=sr)

    # Average chroma for key detection
    chroma_avg = np.mean(chroma, axis=1)

    # Key detection
    key_idx = int(np.argmax(chroma_avg))
    key = KEYS[key_idx]

    # Major/minor detection using correlation with templates
    major_template = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])
    minor_template = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0])

    rolled_major = np.roll(major_template, key_idx)
    rolled_minor = np.roll(minor_template, key_idx)

    major_corr = np.corrcoef(rolled_major, chroma_avg)[0, 1]
    minor_corr = np.corrcoef(rolled_minor, chroma_avg)[0, 1]

    mode = "major" if major_corr > minor_corr else "minor"

    # Build chord names relative to detected key
    if mode == "major":
        # I, ii, iii, IV, V, vi, vii°
        scale_degrees = [0, 2, 4, 5, 7, 9, 11]
        qualities = ["", "m", "m", "", "", "m", "dim"]
    else:
        # i, ii°, III, iv, v, VI, VII
        scale_degrees = [0, 2, 3, 5, 7, 8, 10]
        qualities = ["m", "dim", "", "m", "m", "", ""]

    chord_names = []
    for deg, qual in zip(scale_degrees, qualities):
        note_idx = (key_idx + deg) % 12
        chord_names.append(KEYS[note_idx] + qual)

    # Chord progression detection (analyze per beat)
    beat_interval = 60/tempo if tempo > 0 else 0.5
    beat_frames = librosa.time_to_frames(
        np.arange(0, len(y_harm)/sr, beat_interval),
        sr=sr
    )

    chords = []

    # Sample chords at each beat
    for i in range(min(8, len(beat_frames) - 1)):
        start_frame = beat_frames[i]
        end_frame = beat_frames[i + 1] if i + 1 < len(beat_frames) else chroma.shape[1]

        if start_frame < chroma.shape[1]:
            beat_chroma = np.mean(chroma[:, start_frame:min(end_frame, chroma.shape[1])], axis=1)
            chord_idx = int(np.argmax(beat_chroma))
            
            # Map to scale degree (distance from key)
            degree = (chord_idx - key_idx) % 12
            
            # Find closest scale degree
            closest = min(range(len(scale_degrees)), key=lambda i: abs(scale_degrees[i] - degree))
            chords.append(chord_names[closest])

    # Simplify chord progression
    if len(chords) >= 4:
        progression = " ".join(chords[:4])
    else:
        progression = " ".join(chords) if chords else key + ("m" if mode == "minor" else "")

    return {
        "key": key,
        "mode": mode,
        "chords": chords[:8],
        "progression": progression,
        "chord_names": chord_names  # For reference
    }


def analyze_melody(y_harm, sr):
    """Extract melody characteristics."""

    # Pitch detection using pyin
    try:
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y_harm,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr
        )

        # Get voiced pitches
        valid_f0 = f0[voiced_flag]

        if len(valid_f0) > 0:
            # Convert to MIDI notes
            midi_notes = librosa.hz_to_midi(valid_f0)
            midi_notes = midi_notes[~np.isnan(midi_notes)]

            if len(midi_notes) > 0:
                # Find range
                low_note = int(np.min(midi_notes))
                high_note = int(np.max(midi_notes))
                avg_note = int(np.mean(midi_notes))

                # Determine register
                if avg_note < 48:  # Below C3
                    register = "bass"
                elif avg_note < 60:  # Below C4
                    register = "low"
                elif avg_note < 72:  # Below C5
                    register = "mid"
                else:
                    register = "high"

                # Note activity
                activity = len(midi_notes) / (len(f0) + 1)

                return {
                    "register": register,
                    "range": high_note - low_note,
                    "low_midi": low_note,
                    "high_midi": high_note,
                    "activity": round(activity, 2)
                }
    except Exception as e:
        pass

    return {
        "register": "mid",
        "range": 12,
        "low_midi": 48,
        "high_midi": 60,
        "activity": 0.5
    }


if __name__ == "__main__":
    audio_path = sys.argv[1]
    result = analyze_audio(audio_path)
    print("ANALYSIS_JSON:" + json.dumps(result))
'''


def run_demucs(audio_path: Path, output_dir: Path) -> dict:
    """Separate audio into stems using Demucs."""
    print(f"[1/5] Separating stems with Demucs...")

    cmd = [
        VENV_PYTHON, "-m", "demucs",
        "-n", "htdemucs",
        "-o", str(output_dir),
        "--two-stems", "drums",
        str(audio_path)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    stem_dir = output_dir / "htdemucs" / audio_path.stem
    stems = {}
    if stem_dir.exists():
        for stem_file in stem_dir.glob("*.wav"):
            stems[stem_file.stem] = stem_file

    print(f"  Found stems: {list(stems.keys())}")
    return stems


def run_analysis(audio_path: Path) -> dict:
    """Run detailed audio analysis using librosa."""
    print(f"[2/5] Running detailed audio analysis...")

    # Write analysis script to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(ANALYSIS_SCRIPT)
        script_path = f.name

    try:
        result = subprocess.run(
            [VENV_PYTHON, script_path, str(audio_path)],
            capture_output=True,
            text=True,
            timeout=120
        )

        # Parse output
        for line in result.stdout.split('\n'):
            if line.startswith('ANALYSIS_JSON:'):
                json_str = line[14:]
                return json.loads(json_str)

        # If parsing failed, return defaults
        print(f"  Warning: Analysis parsing failed, using defaults")
        if result.stderr:
            print(f"  stderr: {result.stderr[:200]}")

    except subprocess.TimeoutExpired:
        print(f"  Warning: Analysis timed out")
    except Exception as e:
        print(f"  Warning: Analysis error: {e}")
    finally:
        Path(script_path).unlink(missing_ok=True)

    return {
        "structure": {"tempo": 120, "beats": 32, "duration": 30},
        "drums": {"kick_pattern": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                  "snare_pattern": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                  "hihat_pattern": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                  "style": "house"},
        "harmony": {"key": "C", "mode": "minor", "chords": ["Cm", "Fm", "Gm", "Cm"]},
        "melody": {"register": "mid", "range": 12}
    }


def pattern_to_mini(pattern: list, sound: str) -> str:
    """Convert binary pattern to Strudel mini notation."""
    if not any(pattern):
        return ""

    # Convert simple repeating patterns
    if pattern == [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]:
        return f"{sound}*4"
    if pattern == [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]:
        return f"{sound}*8"
    if pattern == [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]:
        return f"{sound}*16"
    if pattern == [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]:
        return f"~ {sound} ~ {sound}"  # backbeat
    if pattern == [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]:
        return f"~*2 {sound} ~"  # half-time snare

    # Use euclidean if possible
    hits = sum(pattern)
    total = len(pattern)
    if hits > 0 and hits < total:
        euclidean = generate_euclidean(hits, total)
        if euclidean == pattern:
            return f"{sound}({hits},{total})"

    # Group consecutive hits/rests for complex patterns
    result = []
    i = 0
    while i < len(pattern):
        if pattern[i]:
            count = 1
            while i + count < len(pattern) and pattern[i + count]:
                count += 1
            if count > 1:
                result.append(f"{sound}*{count}")
            else:
                result.append(sound)
            i += count
        else:
            count = 1
            while i + count < len(pattern) and not pattern[i + count]:
                count += 1
            if count > 1:
                result.append(f"~*{count}")
            else:
                result.append("~")
            i += count

    return " ".join(result)


def generate_euclidean(hits: int, steps: int) -> list:
    """Generate euclidean rhythm pattern."""
    pattern = [0] * steps
    bucket = 0
    for i in range(steps):
        bucket += hits
        if bucket >= steps:
            bucket -= steps
            pattern[i] = 1
    return pattern


def generate_strudel_v2(analysis: dict, audio_name: str) -> str:
    """Generate sophisticated multi-layer Strudel code from analysis."""
    print(f"[5/5] Generating Strudel code...")

    structure = analysis.get("structure", {})
    drums = analysis.get("drums", {})
    harmony = analysis.get("harmony", {})
    melody = analysis.get("melody", {})

    tempo = structure.get("tempo", 120)
    key = harmony.get("key", "C")
    mode = harmony.get("mode", "minor")
    style = drums.get("style", "house")

    # Build drum patterns
    kick_pattern = drums.get("kick_pattern", [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0])
    snare_pattern = drums.get("snare_pattern", [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0])
    hihat_pattern = drums.get("hihat_pattern", [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0])

    kick_mini = pattern_to_mini(kick_pattern, "bd")
    snare_mini = pattern_to_mini(snare_pattern, "sd")
    hihat_mini = pattern_to_mini(hihat_pattern, "hh")

    # Build chord progression (use first 4 unique or repeat)
    chords = harmony.get("chords", [])
    if chords:
        # Deduplicate consecutive same chords for cleaner progression
        unique_chords = [chords[0]]
        for c in chords[1:4]:
            if c != unique_chords[-1]:
                unique_chords.append(c)
        chord_str = " ".join(unique_chords)
    else:
        chord_str = key + ("m" if mode == "minor" else "")

    # Build code
    lines = [
        f'// Analyzed from: {audio_name}',
        f'// Tempo: {tempo} BPM | Key: {key} {mode} | Style: {style}',
        f'setcpm({tempo}/4);',
        '',
        '// === DRUMS ===',
    ]

    # Add drum layers
    drum_layers = []
    if kick_mini:
        drum_layers.append(f's("{kick_mini}").gain(1.2)')
    if snare_mini:
        drum_layers.append(f's("{snare_mini}").gain(0.9)')
    if hihat_mini:
        drum_layers.append(f's("{hihat_mini}").gain(0.6)')

    if drum_layers:
        lines.append("stack(")
        lines.append("  " + ",\n  ".join(drum_layers))
        lines.append(")")
    else:
        lines.append('s("bd*4, sd*2, hh*8")')

    lines.append('')
    lines.append('// === BASS ===')
    lines.append(f'n("0 3 5 7").scale("{key}:{mode}").s("sawtooth").lpf(400).gain(0.7)')

    lines.append('')
    lines.append('// === CHORDS ===')
    lines.append(f'chord("<{chord_str}>").voicing().s("triangle").lpf(800).gain(0.4).room(0.3)')

    # Add lead melody hint
    lines.append('')
    lines.append('// === LEAD (optional) ===')
    lines.append(f'// n("0 2 4 5").scale("{key}:{mode}").s("triangle").lpf(1500).gain(0.4)')

    return '\n'.join(lines)


def process_audio(audio_path: Path, output_dir: Path, skip_demucs: bool = False) -> dict:
    """Full pipeline: audio -> detailed analysis -> Strudel code."""
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"Processing: {audio_path.name}")
    print(f"{'='*60}")

    # Step 1: Separate stems (optional)
    if not skip_demucs:
        stems = run_demucs(audio_path, output_dir)
    else:
        print("[1/5] Skipping Demucs (--skip-demucs)")
        stems = {}

    # Step 2-4: Run combined analysis
    analysis = run_analysis(audio_path)

    # Step 5: Generate Strudel code
    code = generate_strudel_v2(analysis, audio_path.name)

    print(f"\n{'='*60}")
    print("Generated Strudel Code:")
    print(f"{'='*60}")
    print(code)
    print(f"{'='*60}")

    # Save results
    result = {
        "source": str(audio_path),
        "analysis": analysis,
        "code": code
    }

    json_path = output_dir / f"{audio_path.stem}_analysis.json"
    code_path = output_dir / f"{audio_path.stem}.strudel.js"

    json_path.write_text(json.dumps(result, indent=2))
    code_path.write_text(code)

    print(f"\nSaved:")
    print(f"  Analysis: {json_path}")
    print(f"  Code: {code_path}")

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Analyze audio and generate Strudel code"
    )
    parser.add_argument("audio", type=Path, help="Audio file to analyze")
    parser.add_argument("-o", "--output", type=Path, default=Path("./output"),
                        help="Output directory")
    parser.add_argument("--skip-demucs", action="store_true",
                        help="Skip stem separation (faster)")
    args = parser.parse_args()

    if not args.audio.exists():
        sys.exit(f"Error: {args.audio} not found")

    process_audio(args.audio, args.output, args.skip_demucs)
