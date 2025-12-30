#!/usr/bin/env python3
"""
Basic audio analysis script.
Extracts BPM, key, and frequency information from audio files.
"""

import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np


def analyze_audio(audio_path: str) -> dict:
    """Analyze audio file and extract musical features."""

    print(f"Loading: {audio_path}")
    y, sr = librosa.load(audio_path, sr=22050)
    duration = librosa.get_duration(y=y, sr=sr)

    print("Detecting tempo...")
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(tempo) if isinstance(tempo, np.ndarray) else tempo

    print("Analyzing pitch/key...")
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)

    # Map to key names
    key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    key_idx = int(np.argmax(chroma_mean))
    key = key_names[key_idx]

    # Detect major/minor using chroma profile
    major_profile = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])
    minor_profile = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0])

    # Rotate profiles to match detected key
    major_corr = np.corrcoef(np.roll(major_profile, key_idx), chroma_mean)[0, 1]
    minor_corr = np.corrcoef(np.roll(minor_profile, key_idx), chroma_mean)[0, 1]

    mode = "major" if major_corr > minor_corr else "minor"

    print("Analyzing spectral features...")
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)

    analysis = {
        "file": str(audio_path),
        "duration_seconds": round(duration, 2),
        "bpm": round(tempo, 1),
        "key": key,
        "mode": mode,
        "beat_times": librosa.frames_to_time(beat_frames, sr=sr).tolist()[:32],
        "spectral": {
            "centroid_mean": float(np.mean(spectral_centroid)),
            "bandwidth_mean": float(np.mean(spectral_bandwidth))
        }
    }

    return analysis


def main():
    parser = argparse.ArgumentParser(description="Analyze audio file")
    parser.add_argument("audio_file", help="Path to audio file (MP3, WAV, etc.)")
    parser.add_argument("-o", "--output", help="Output JSON path")
    args = parser.parse_args()

    audio_path = Path(args.audio_file)
    if not audio_path.exists():
        print(f"Error: File not found: {audio_path}", file=sys.stderr)
        sys.exit(1)

    analysis = analyze_audio(str(audio_path))

    output_path = args.output
    if not output_path:
        output_path = audio_path.with_suffix('.analysis.json')

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)

    print(f"\nAnalysis saved to: {output_path}")
    print(f"BPM: {analysis['bpm']}")
    print(f"Key: {analysis['key']} {analysis['mode']}")
    print(f"Duration: {analysis['duration_seconds']}s")


if __name__ == "__main__":
    main()
