#!/usr/bin/env python3
"""
Music Feature Extraction Pipeline for Strudel Composer

Extracts musical features from audio files to generate Strudel live coding patterns.

Pipeline:
1. Source Separation (Demucs) - Split into drums, bass, vocals, other
2. Drum Analysis - Detect kick, snare, hi-hat; quantize to grid
3. Bass Analysis - Pitch detection, scale degree mapping
4. Chord Analysis - Detect chord progressions
5. Global Features - BPM, key, structure

Usage:
    python extract_music.py <audio_file> [--output-dir OUTPUT_DIR]

Output:
    - analysis.json with all extracted features
    - Separated stems in output/stems/
    - Suggested Strudel code

Requirements:
    pip install demucs librosa madmom basic-pitch numpy scipy
    pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
"""

import argparse
import json
import logging
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np

# Lazy imports for optional heavy dependencies
librosa = None
madmom = None


def import_dependencies():
    """Import heavy dependencies lazily."""
    global librosa, madmom

    try:
        import librosa as _librosa
        librosa = _librosa
    except ImportError:
        logging.error("librosa not installed. Run: pip install librosa")
        sys.exit(1)

    try:
        import madmom as _madmom
        madmom = _madmom
    except ImportError:
        logging.warning("madmom not installed. BPM detection will use librosa fallback.")
        madmom = None


# Krumhansl-Schmuckler key profiles
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


@dataclass
class DrumPattern:
    """Extracted drum pattern info."""
    pattern: str
    kick_times: List[float]
    snare_times: List[float]
    hihat_times: List[float]
    hihat_density: int


@dataclass
class BassPattern:
    """Extracted bass pattern info."""
    pattern: str
    notes: List[str]
    scale_degrees: List[int]
    root_note: str
    scale: str


@dataclass
class ChordProgression:
    """Extracted chord progression."""
    progression: List[str]
    strudel: str


@dataclass
class AnalysisResult:
    """Complete analysis result."""
    file: str
    bpm: float
    key: str
    mode: str
    duration_seconds: float
    drums: Optional[Dict]
    bass: Optional[Dict]
    chords: Optional[Dict]
    suggested_strudel: str
    stems_dir: str


def detect_bpm_madmom(audio_path: str) -> float:
    """Detect BPM using madmom (more accurate than librosa)."""
    if madmom is None:
        return detect_bpm_librosa(audio_path)

    try:
        from madmom.features.beats import RNNBeatProcessor, BeatTrackingProcessor

        proc = RNNBeatProcessor()
        act = proc(audio_path)
        beat_proc = BeatTrackingProcessor(fps=100)
        beats = beat_proc(act)

        if len(beats) < 2:
            return detect_bpm_librosa(audio_path)

        intervals = np.diff(beats)
        median_interval = np.median(intervals)
        bpm = 60.0 / median_interval

        common_bpms = [60, 70, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 128, 130, 135, 140, 145, 150, 160, 170, 180]
        bpm = min(common_bpms, key=lambda x: abs(x - bpm))
        return float(bpm)
    except Exception as e:
        logging.warning(f"madmom BPM detection failed: {e}, using librosa")
        return detect_bpm_librosa(audio_path)


def detect_bpm_librosa(audio_path: str) -> float:
    """Fallback BPM detection using librosa."""
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if hasattr(tempo, '__iter__'):
        tempo = tempo[0]
    return float(tempo)


def detect_key(y: np.ndarray, sr: int) -> Tuple[str, str, float]:
    """Detect musical key using Krumhansl-Schmuckler algorithm."""
    y_harmonic = librosa.effects.harmonic(y)
    chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    chroma_mean = chroma_mean / (np.sum(chroma_mean) + 1e-6)

    best_corr = -1
    best_key = 'C'
    best_mode = 'major'

    for i, pitch in enumerate(PITCH_CLASSES):
        major_rotated = np.roll(MAJOR_PROFILE, i)
        minor_rotated = np.roll(MINOR_PROFILE, i)
        major_rotated = major_rotated / np.sum(major_rotated)
        minor_rotated = minor_rotated / np.sum(minor_rotated)

        major_corr = np.corrcoef(chroma_mean, major_rotated)[0, 1]
        minor_corr = np.corrcoef(chroma_mean, minor_rotated)[0, 1]

        if major_corr > best_corr:
            best_corr = major_corr
            best_key = pitch
            best_mode = 'major'
        if minor_corr > best_corr:
            best_corr = minor_corr
            best_key = pitch
            best_mode = 'minor'

    return best_key, best_mode, float(best_corr)


def run_demucs(audio_path: str, output_dir: str) -> Dict[str, str]:
    """Run Demucs source separation."""
    audio_path = Path(audio_path)
    output_dir = Path(output_dir)

    cmd = ["demucs", "-o", str(output_dir), str(audio_path)]
    logging.info(f"Running Demucs: {' '.join(cmd)}")

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        logging.error(f"Demucs failed: {e.stderr}")
        raise
    except FileNotFoundError:
        logging.error("Demucs not installed. Run: pip install demucs")
        raise

    stem_dir = output_dir / "htdemucs" / audio_path.stem
    stems = {}
    for stem_name in ["drums", "bass", "vocals", "other"]:
        stem_path = stem_dir / f"{stem_name}.wav"
        if stem_path.exists():
            stems[stem_name] = str(stem_path)
    return stems


def analyze_drums(drums_path: str, bpm: float, sr: int = 22050) -> DrumPattern:
    """Analyze drum stem to extract kick, snare, hi-hat patterns."""
    y, sr = librosa.load(drums_path, sr=sr, mono=True)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(y=y, sr=sr, onset_envelope=onset_env, backtrack=True, units='time')

    S = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    kick_times, snare_times, hihat_times = [], [], []
    hop_length = 512

    for onset_time in onsets:
        frame = librosa.time_to_frames(onset_time, sr=sr, hop_length=hop_length)
        if frame >= S.shape[1]:
            continue
        spectrum = S[:, frame]
        centroid = np.sum(freqs * spectrum) / (np.sum(spectrum) + 1e-6)

        if centroid < 200:
            kick_times.append(onset_time)
        elif centroid < 2000:
            snare_times.append(onset_time)
        else:
            hihat_times.append(onset_time)

    beat_duration = 60.0 / bpm
    sixteenth = beat_duration / 4

    def quantize(times):
        return [round(t / sixteenth) * sixteenth for t in times]

    kick_times = quantize(kick_times)
    snare_times = quantize(snare_times)
    hihat_times = quantize(hihat_times)

    duration = librosa.get_duration(y=y, sr=sr)
    num_beats = duration / beat_duration
    hihat_density = int(len(hihat_times) / max(num_beats, 1))
    hihat_density = min(max(hihat_density, 2), 16)

    pattern = generate_drum_pattern(kick_times, snare_times, hihat_density, bpm)
    return DrumPattern(pattern=pattern, kick_times=kick_times[:32], snare_times=snare_times[:32],
                       hihat_times=hihat_times[:32], hihat_density=hihat_density)


def generate_drum_pattern(kicks: List[float], snares: List[float], hihat_density: int, bpm: float) -> str:
    """Generate Strudel mini-notation for drums."""
    beat_dur = 60.0 / bpm
    kick_pattern, snare_pattern = [], []

    for beat in range(4):
        beat_start = beat * beat_dur
        beat_end = (beat + 1) * beat_dur
        has_kick = any(beat_start <= k < beat_end for k in kicks[:16])
        has_snare = any(beat_start <= s < beat_end for s in snares[:16])
        kick_pattern.append("bd" if has_kick else "~")
        snare_pattern.append("sd" if has_snare else "~")

    kick_str = " ".join(kick_pattern)
    snare_str = " ".join(snare_pattern)
    return f's("{kick_str}, {snare_str}, hh*{hihat_density}")'


def analyze_bass(bass_path: str, key: str, mode: str, sr: int = 22050) -> BassPattern:
    """Analyze bass stem to extract pitch pattern."""
    y, sr = librosa.load(bass_path, sr=sr, mono=True)
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=30, fmax=500)
    pitch_values = []

    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            pitch_values.append(pitch)

    if not pitch_values:
        scale = f"{key}:minor" if mode == "minor" else f"{key}:major"
        return BassPattern(pattern='n("0").scale("C2:minor")', notes=["C2"],
                          scale_degrees=[0], root_note="C2", scale=scale)

    midi_notes = librosa.hz_to_midi(np.array(pitch_values))
    root_midi = librosa.note_to_midi(f"{key}2")
    scale_intervals = [0, 2, 3, 5, 7, 8, 10] if mode == "minor" else [0, 2, 4, 5, 7, 9, 11]

    def to_scale_degree(midi_note):
        interval = int(midi_note - root_midi) % 12
        return scale_intervals.index(min(scale_intervals, key=lambda x: abs(x - interval)))

    scale_degrees = [to_scale_degree(m) for m in midi_notes[:8]]
    notes = [librosa.midi_to_note(m) for m in midi_notes[:8]]
    degree_str = " ".join(str(d) for d in scale_degrees[:4])
    scale_name = f"{key}2:{mode}"

    return BassPattern(pattern=f'n("{degree_str}").scale("{scale_name}")', notes=notes[:8],
                      scale_degrees=scale_degrees[:8], root_note=f"{key}2", scale=scale_name)


def analyze_chords(other_path: str, key: str, mode: str, sr: int = 22050) -> ChordProgression:
    """Analyze harmonic content for chord progression."""
    y, sr = librosa.load(other_path, sr=sr, mono=True)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

    chord_templates = {
        'maj': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        'min': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        '7': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        'm7': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    }

    n_segments = 4
    segment_len = chroma.shape[1] // n_segments
    progression = []

    for i in range(n_segments):
        segment_chroma = np.mean(chroma[:, i*segment_len:(i+1)*segment_len], axis=1)
        best_score, best_chord = -1, f"{key}m" if mode == "minor" else key

        for root_idx, root in enumerate(PITCH_CLASSES):
            for chord_type, template in chord_templates.items():
                rotated = np.roll(template, root_idx)
                score = np.corrcoef(segment_chroma, rotated)[0, 1]
                if score > best_score:
                    best_score = score
                    suffix = "" if chord_type == "maj" else "m" if chord_type == "min" else chord_type
                    best_chord = f"{root}{suffix}"
        progression.append(best_chord)

    chord_str = " ".join(progression)
    return ChordProgression(progression=progression, strudel=f'chord("<{chord_str}>").voicing()')


def generate_strudel_code(analysis: AnalysisResult) -> str:
    """Generate complete Strudel code from analysis."""
    lines = [
        f'// Generated from: {analysis.file}',
        f'// Key: {analysis.key} {analysis.mode}, BPM: {analysis.bpm}',
        '',
        f'setcpm({int(analysis.bpm)})',
        '',
        'stack('
    ]

    if analysis.drums:
        drum_pattern = analysis.drums.get("pattern", 's("bd*4")')
        lines.append('  // Drums')
        lines.append(f'  {drum_pattern}.bank("RolandTR909"),')
    if analysis.bass:
        bass_pattern = analysis.bass.get("pattern", 'n("0")')
        lines.append('  // Bass')
        lines.append(f'  {bass_pattern}.s("sawtooth").lpf(400).gain(0.8),')
    if analysis.chords:
        chord_pattern = analysis.chords.get("strudel", 'chord("<Am>")')
        lines.append('  // Chords')
        lines.append(f'  {chord_pattern}.s("gm_pad_warm").room(0.5).gain(0.6)')
    lines.append(')')
    return '\n'.join(lines)


def analyze_audio(audio_path: str, output_dir: str = "output") -> AnalysisResult:
    """Main analysis pipeline."""
    import_dependencies()
    audio_path, output_dir = Path(audio_path), Path(output_dir)

    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    logging.info(f"Analyzing: {audio_path}")
    stems_dir = output_dir / "stems" / audio_path.stem
    analysis_dir = output_dir / "analysis"
    stems_dir.mkdir(parents=True, exist_ok=True)
    analysis_dir.mkdir(parents=True, exist_ok=True)

    y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    logging.info("Detecting BPM...")
    bpm = detect_bpm_madmom(str(audio_path))
    logging.info("Detecting key...")
    key, mode, confidence = detect_key(y, sr)
    logging.info(f"BPM: {bpm}, Key: {key} {mode} (confidence: {confidence:.2f})")

    stems = {}
    try:
        logging.info("Running source separation...")
        stems = run_demucs(str(audio_path), str(output_dir / "stems"))
    except Exception as e:
        logging.warning(f"Source separation failed: {e}")

    drums_analysis = bass_analysis = chords_analysis = None

    if "drums" in stems:
        try:
            drums_analysis = asdict(analyze_drums(stems["drums"], bpm))
        except Exception as e:
            logging.warning(f"Drum analysis failed: {e}")

    if "bass" in stems:
        try:
            bass_analysis = asdict(analyze_bass(stems["bass"], key, mode))
        except Exception as e:
            logging.warning(f"Bass analysis failed: {e}")

    if "other" in stems:
        try:
            chords_analysis = asdict(analyze_chords(stems["other"], key, mode))
        except Exception as e:
            logging.warning(f"Chord analysis failed: {e}")

    result = AnalysisResult(
        file=str(audio_path.name), bpm=bpm, key=key, mode=mode,
        duration_seconds=duration, drums=drums_analysis, bass=bass_analysis,
        chords=chords_analysis, suggested_strudel="", stems_dir=str(stems_dir)
    )
    result.suggested_strudel = generate_strudel_code(result)

    with open(analysis_dir / f"{audio_path.stem}_analysis.json", 'w') as f:
        json.dump(asdict(result), f, indent=2)
    with open(analysis_dir / f"{audio_path.stem}.js", 'w') as f:
        f.write(result.suggested_strudel)

    logging.info(f"Analysis saved to: {analysis_dir}")
    return result


def main():
    parser = argparse.ArgumentParser(description="Extract musical features from audio for Strudel composition")
    parser.add_argument("audio_file", help="Path to audio file (mp3, wav, etc.)")
    parser.add_argument("--output-dir", "-o", default="output", help="Output directory")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                       format="%(asctime)s - %(levelname)s - %(message)s")

    try:
        result = analyze_audio(args.audio_file, args.output_dir)
        print(f"\n{'='*60}\nANALYSIS COMPLETE\n{'='*60}")
        print(f"File: {result.file}\nBPM: {result.bpm}\nKey: {result.key} {result.mode}")
        print(f"Duration: {result.duration_seconds:.1f}s\n\nSuggested Strudel Code:\n{'-'*60}")
        print(result.suggested_strudel)
    except Exception as e:
        logging.error(f"Analysis failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
