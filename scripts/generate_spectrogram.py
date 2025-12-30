#!/usr/bin/env python3
"""
Generate spectrogram visualization from audio files.
Used for visual feedback when comparing compositions.
"""

import argparse
import sys
from pathlib import Path

import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np


def generate_spectrogram(audio_path: str, output_path: str = None,
                         show: bool = False) -> str:
    """Generate and save a spectrogram from an audio file."""

    print(f"Loading: {audio_path}")
    y, sr = librosa.load(audio_path, sr=22050)

    # Create figure with subplots
    fig, axes = plt.subplots(3, 1, figsize=(14, 10))

    # 1. Waveform
    ax1 = axes[0]
    librosa.display.waveshow(y, sr=sr, ax=ax1, color='steelblue')
    ax1.set_title('Waveform')
    ax1.set_xlabel('')

    # 2. Mel Spectrogram
    ax2 = axes[1]
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    S_dB = librosa.power_to_db(S, ref=np.max)
    img = librosa.display.specshow(S_dB, x_axis='time', y_axis='mel',
                                    sr=sr, fmax=8000, ax=ax2, cmap='magma')
    ax2.set_title('Mel Spectrogram')
    fig.colorbar(img, ax=ax2, format='%+2.0f dB')

    # 3. Chromagram
    ax3 = axes[2]
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    img2 = librosa.display.specshow(chroma, y_axis='chroma', x_axis='time',
                                     ax=ax3, cmap='coolwarm')
    ax3.set_title('Chromagram (Pitch Classes)')
    fig.colorbar(img2, ax=ax3)

    plt.tight_layout()

    # Determine output path
    if output_path is None:
        output_path = Path(audio_path).with_suffix('.spectrogram.png')

    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Spectrogram saved to: {output_path}")

    if show:
        plt.show()
    else:
        plt.close()

    return str(output_path)


def compare_spectrograms(audio1: str, audio2: str, output_path: str = None):
    """Generate side-by-side comparison of two audio files."""

    print(f"Comparing: {audio1} vs {audio2}")

    y1, sr1 = librosa.load(audio1, sr=22050)
    y2, sr2 = librosa.load(audio2, sr=22050)

    fig, axes = plt.subplots(2, 2, figsize=(16, 10))

    # First audio
    S1 = librosa.feature.melspectrogram(y=y1, sr=sr1, n_mels=128)
    S1_dB = librosa.power_to_db(S1, ref=np.max)

    librosa.display.specshow(S1_dB, x_axis='time', y_axis='mel',
                              sr=sr1, ax=axes[0, 0], cmap='magma')
    axes[0, 0].set_title(f'Audio 1: {Path(audio1).name}')

    chroma1 = librosa.feature.chroma_cqt(y=y1, sr=sr1)
    librosa.display.specshow(chroma1, y_axis='chroma', x_axis='time',
                              ax=axes[1, 0], cmap='coolwarm')
    axes[1, 0].set_title('Chromagram 1')

    # Second audio
    S2 = librosa.feature.melspectrogram(y=y2, sr=sr2, n_mels=128)
    S2_dB = librosa.power_to_db(S2, ref=np.max)

    librosa.display.specshow(S2_dB, x_axis='time', y_axis='mel',
                              sr=sr2, ax=axes[0, 1], cmap='magma')
    axes[0, 1].set_title(f'Audio 2: {Path(audio2).name}')

    chroma2 = librosa.feature.chroma_cqt(y=y2, sr=sr2)
    librosa.display.specshow(chroma2, y_axis='chroma', x_axis='time',
                              ax=axes[1, 1], cmap='coolwarm')
    axes[1, 1].set_title('Chromagram 2')

    plt.tight_layout()

    if output_path is None:
        output_path = "comparison.png"

    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Comparison saved to: {output_path}")
    plt.close()


def main():
    parser = argparse.ArgumentParser(description="Generate audio spectrograms")
    parser.add_argument("audio_file", help="Path to audio file")
    parser.add_argument("-o", "--output", help="Output image path")
    parser.add_argument("--compare", help="Second audio file for comparison")
    parser.add_argument("--show", action="store_true", help="Display plot")
    args = parser.parse_args()

    if not Path(args.audio_file).exists():
        print(f"Error: File not found: {args.audio_file}", file=sys.stderr)
        sys.exit(1)

    if args.compare:
        if not Path(args.compare).exists():
            print(f"Error: File not found: {args.compare}", file=sys.stderr)
            sys.exit(1)
        compare_spectrograms(args.audio_file, args.compare, args.output)
    else:
        generate_spectrogram(args.audio_file, args.output, args.show)


if __name__ == "__main__":
    main()
