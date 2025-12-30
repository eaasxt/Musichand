#!/usr/bin/env python3
"""
Audio Analysis Script for Strudel Composer
Extracts musical features from reference tracks to guide composition.

Usage:
    python analyze_audio.py <audio_file> [--output-dir OUTPUT_DIR]

Outputs:
    - JSON file with extracted features
    - Chromagram image (pitch class distribution over time)
    - Spectrogram image (frequency content over time)
"""

import argparse
import json
import os
import sys
from pathlib import Path

import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np


# Krumhansl-Schmuckler key profiles for key detection
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def detect_key(y, sr):
    """
    Detect the musical key using Krumhansl-Schmuckler algorithm.
    Returns: (key_name, mode, correlation_score)
    """
    # Separate harmonic component for cleaner pitch analysis
    y_harmonic = librosa.effects.harmonic(y)
    
    # Compute chromagram
    chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    
    # Normalize
    chroma_mean = chroma_mean / np.sum(chroma_mean)
    
    best_corr = -1
    best_key = 'C'
    best_mode = 'major'
    
    for i, pitch in enumerate(PITCH_CLASSES):
        # Rotate profiles to test each key
        major_rotated = np.roll(MAJOR_PROFILE, -i)
        minor_rotated = np.roll(MINOR_PROFILE, -i)
        
        # Normalize profiles
        major_norm = major_rotated / np.sum(major_rotated)
        minor_norm = minor_rotated / np.sum(minor_rotated)
        
        # Calculate correlation
        major_corr = np.corrcoef(chroma_mean, major_norm)[0, 1]
        minor_corr = np.corrcoef(chroma_mean, minor_norm)[0, 1]
        
        if major_corr > best_corr:
            best_corr = major_corr
            best_key = pitch
            best_mode = 'major'
        
        if minor_corr > best_corr:
            best_corr = minor_corr
            best_key = pitch
            best_mode = 'minor'
    
    return best_key, best_mode, best_corr


def analyze_rhythm(y, sr):
    """
    Analyze rhythmic characteristics.
    Returns dict with tempo, beat positions, rhythm density.
    """
    # Get tempo and beats
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Onset detection for rhythm density
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
    onset_times = librosa.frames_to_time(onsets, sr=sr)
    
    # Calculate rhythm density (onsets per beat)
    duration = librosa.get_duration(y=y, sr=sr)
    num_beats = len(beat_times)
    onsets_per_beat = len(onset_times) / max(num_beats, 1)
    
    return {
        'tempo_bpm': float(tempo) if np.isscalar(tempo) else float(tempo[0]),
        'num_beats': num_beats,
        'duration_seconds': duration,
        'onsets_per_beat': onsets_per_beat,
        'beat_regularity': np.std(np.diff(beat_times)) if len(beat_times) > 1 else 0
    }


def analyze_frequency_balance(y, sr):
    """
    Analyze frequency distribution across bands.
    Returns dict with energy in each frequency band.
    """
    # Compute spectrogram
    S = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    
    # Define frequency bands
    bands = {
        'sub_bass': (20, 60),
        'bass': (60, 250),
        'low_mids': (250, 500),
        'mids': (500, 2000),
        'high_mids': (2000, 4000),
        'highs': (4000, 20000)
    }
    
    total_energy = np.sum(S)
    band_energy = {}
    
    for band_name, (low, high) in bands.items():
        mask = (freqs >= low) & (freqs < high)
        energy = np.sum(S[mask, :])
        band_energy[band_name] = float(energy / total_energy * 100)  # percentage
    
    # Determine overall character
    if band_energy['bass'] + band_energy['sub_bass'] > 40:
        character = 'bass_heavy'
    elif band_energy['highs'] + band_energy['high_mids'] > 30:
        character = 'bright'
    else:
        character = 'balanced'
    
    return {
        'bands': band_energy,
        'character': character
    }


def detect_structure(y, sr):
    """
    Attempt to detect structural sections using novelty.
    Returns list of approximate section boundaries.
    """
    # Compute mel spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    
    # Compute spectral novelty (changes in spectrum)
    novelty = librosa.onset.onset_strength(S=librosa.power_to_db(S), sr=sr)
    
    # Find peaks in novelty (potential section changes)
    # Use a high threshold to only catch major changes
    peaks = librosa.util.peak_pick(novelty, pre_max=30, post_max=30, 
                                    pre_avg=30, post_avg=30, delta=0.1, wait=100)
    
    peak_times = librosa.frames_to_time(peaks, sr=sr)
    
    # Estimate section lengths
    duration = librosa.get_duration(y=y, sr=sr)
    sections = []
    prev_time = 0
    
    for t in peak_times:
        if t - prev_time > 8:  # Minimum 8 seconds between sections
            sections.append({
                'start': prev_time,
                'end': t,
                'duration': t - prev_time
            })
            prev_time = t
    
    # Add final section
    if duration - prev_time > 8:
        sections.append({
            'start': prev_time,
            'end': duration,
            'duration': duration - prev_time
        })
    
    return sections


def generate_chromagram(y, sr, output_path):
    """Generate and save chromagram visualization."""
    y_harmonic = librosa.effects.harmonic(y)
    chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
    
    plt.figure(figsize=(14, 4))
    librosa.display.specshow(chroma, sr=sr, x_axis='time', y_axis='chroma')
    plt.colorbar(label='Intensity')
    plt.title('Chromagram (Pitch Class Energy Over Time)')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def generate_spectrogram(y, sr, output_path):
    """Generate and save mel spectrogram visualization."""
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_db = librosa.power_to_db(S, ref=np.max)
    
    plt.figure(figsize=(14, 6))
    librosa.display.specshow(S_db, sr=sr, x_axis='time', y_axis='mel')
    plt.colorbar(format='%+2.0f dB', label='Intensity (dB)')
    plt.title('Mel Spectrogram')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def generate_strudel_suggestions(analysis):
    """
    Generate Strudel code suggestions based on analysis.
    """
    suggestions = []
    
    # Tempo
    tempo = int(round(analysis['rhythm']['tempo_bpm']))
    suggestions.append(f"setcpm({tempo})")
    
    # Key/Scale
    key = analysis['key']['key']
    mode = analysis['key']['mode']
    suggestions.append(f'.scale("{key}:{mode}")')
    
    # Rhythm density suggestions
    density = analysis['rhythm']['onsets_per_beat']
    if density < 2:
        suggestions.append("// Sparse rhythm - use longer notes, rests")
        suggestions.append('s("bd ~ sd ~")')
    elif density < 4:
        suggestions.append("// Medium density - standard patterns")
        suggestions.append('s("bd*4, ~ sd ~ sd, hh*8")')
    else:
        suggestions.append("// Dense rhythm - lots of activity")
        suggestions.append('s("bd*4, ~ sd ~ sd, hh*16")')
    
    # Frequency balance suggestions
    freq = analysis['frequency_balance']
    if freq['character'] == 'bass_heavy':
        suggestions.append("// Bass-heavy - emphasize low end")
        suggestions.append('.lpf(600)  // Keep things dark')
    elif freq['character'] == 'bright':
        suggestions.append("// Bright track - emphasize highs")
        suggestions.append('.hpf(200)  // Let highs through')
    
    return '\n'.join(suggestions)


def analyze_audio(audio_path, output_dir=None):
    """
    Main analysis function.
    Returns comprehensive analysis dict and saves visualizations.
    """
    audio_path = Path(audio_path)
    
    if output_dir is None:
        output_dir = audio_path.parent / 'analysis'
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading {audio_path}...")
    y, sr = librosa.load(audio_path, sr=22050)
    
    print("Analyzing rhythm...")
    rhythm = analyze_rhythm(y, sr)
    
    print("Detecting key...")
    key, mode, key_confidence = detect_key(y, sr)
    
    print("Analyzing frequency balance...")
    freq_balance = analyze_frequency_balance(y, sr)
    
    print("Detecting structure...")
    structure = detect_structure(y, sr)
    
    # Compile analysis
    analysis = {
        'file': str(audio_path),
        'rhythm': rhythm,
        'key': {
            'key': key,
            'mode': mode,
            'confidence': float(key_confidence)
        },
        'frequency_balance': freq_balance,
        'structure': structure,
        'strudel_scale': f"{key}:{mode}"
    }
    
    # Generate visualizations
    base_name = audio_path.stem
    
    print("Generating chromagram...")
    generate_chromagram(y, sr, output_dir / f"{base_name}_chromagram.png")
    
    print("Generating spectrogram...")
    generate_spectrogram(y, sr, output_dir / f"{base_name}_spectrogram.png")
    
    # Save JSON analysis
    json_path = output_dir / f"{base_name}_analysis.json"
    with open(json_path, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    # Generate suggestions
    suggestions = generate_strudel_suggestions(analysis)
    suggestions_path = output_dir / f"{base_name}_suggestions.js"
    with open(suggestions_path, 'w') as f:
        f.write(f"// Strudel suggestions for {audio_path.name}\n")
        f.write(f"// Generated from audio analysis\n\n")
        f.write(suggestions)
    
    return analysis, output_dir


def print_analysis(analysis):
    """Pretty print analysis results."""
    print("\n" + "="*60)
    print("AUDIO ANALYSIS RESULTS")
    print("="*60)
    
    print(f"\n📁 File: {analysis['file']}")
    
    print(f"\n🎵 KEY: {analysis['key']['key']} {analysis['key']['mode']}")
    print(f"   Confidence: {analysis['key']['confidence']:.2%}")
    print(f"   Strudel: .scale(\"{analysis['strudel_scale']}\")")
    
    print(f"\n🥁 RHYTHM:")
    print(f"   Tempo: {analysis['rhythm']['tempo_bpm']:.1f} BPM")
    print(f"   Duration: {analysis['rhythm']['duration_seconds']:.1f}s")
    print(f"   Density: {analysis['rhythm']['onsets_per_beat']:.1f} onsets/beat")
    
    print(f"\n📊 FREQUENCY BALANCE ({analysis['frequency_balance']['character']}):")
    for band, pct in analysis['frequency_balance']['bands'].items():
        bar = '█' * int(pct / 2)
        print(f"   {band:12s}: {bar} {pct:.1f}%")
    
    if analysis['structure']:
        print(f"\n📐 STRUCTURE ({len(analysis['structure'])} sections detected):")
        for i, section in enumerate(analysis['structure'][:5]):  # Show first 5
            print(f"   Section {i+1}: {section['start']:.1f}s - {section['end']:.1f}s ({section['duration']:.1f}s)")
    
    print("\n" + "="*60)


def main():
    parser = argparse.ArgumentParser(description='Analyze audio for Strudel composition')
    parser.add_argument('audio_file', help='Path to audio file (mp3, wav, etc.)')
    parser.add_argument('--output-dir', '-o', help='Output directory for analysis files')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.audio_file):
        print(f"Error: File not found: {args.audio_file}")
        sys.exit(1)
    
    try:
        analysis, output_dir = analyze_audio(args.audio_file, args.output_dir)
        print_analysis(analysis)
        print(f"\n✅ Analysis saved to: {output_dir}")
    except Exception as e:
        print(f"Error analyzing audio: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
