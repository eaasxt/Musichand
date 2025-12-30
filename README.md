# Musicman

AI-powered music composition and analysis using Strudel live coding.

## Overview

Musicman is a multi-agent AI project that combines:

1. **Strudel Composer** - AI music generation using [Strudel](https://strudel.cc/), a browser-based live coding environment for algorithmic music
2. **Music ML Pipeline** - Audio analysis, source separation, and eventually a fine-tuned model for music-to-Strudel code translation

This is a "dogfood" project for testing [Farmhand](https://github.com/your-org/farmhand) multi-agent AI coding infrastructure.

## Goals

- Get Claude agents composing music via Strudel
- Build a feedback loop where agents can "hear" their output via spectrogram analysis
- Eventually train a local model that specializes in music understanding to Strudel code generation

## Project Structure

```
Musicman/                    # This repo - coordination and docs
├── README.md               # This file
├── AGENTS.md               # Multi-agent coordination
├── .beads/                 # Task tracking (beads)
└── Reference_start/        # Reference materials and specs
    ├── PROJECT_KICKOFF.md  # Full project specification
    ├── CLAUDE.md           # Agent instructions for Strudel
    ├── TASKS.md            # Initial task backlog
    ├── analyze_audio.py    # Reference audio analysis script
    ├── patterns.md         # Strudel pattern reference
    └── ...

~/strudel-composer/          # Main application directory
├── compositions/           # Strudel code (hot-reloaded)
│   └── current.js
├── scripts/                # Audio analysis tools
│   ├── analyze_audio.py
│   ├── extract_music.py    # Full disaggregation pipeline
│   └── generate_spectrogram.py
├── web/                    # Vite + @strudel/web app
├── references/             # Input MP3s to analyze
├── output/                 # Analysis outputs
│   ├── stems/              # Demucs source separation
│   ├── analysis/           # JSON analysis files
│   └── spectrograms/       # Visual feedback
├── data/                   # Training data (future)
└── models/                 # Fine-tuned models (future)
```

## Phases

### Phase 1: Environment Setup
- GPU verification (NVIDIA L40S, 48GB VRAM)
- Install ML dependencies (PyTorch, Demucs, basic-pitch, madmom)
- Set up web app with Strudel
- Configure cloudflared tunnel for remote access

### Phase 2: Music Analysis Pipeline
Build `extract_music.py` for full music disaggregation:
- Source separation with Demucs (drums, bass, vocals, other)
- Drum pattern detection (kick, snare, hi-hat)
- Bass note/pitch detection with basic-pitch
- Chord/harmony analysis
- BPM and key detection

### Phase 3: Strudel Integration
- Analyze reference tracks
- Generate Strudel code from analysis JSON
- Compare output via spectrogram analysis
- Iterate based on visual feedback

### Phase 4+ (Future)
- Training data collection (5-10k examples)
- Fine-tuning with Unsloth + QLoRA on L40S

## Quick Start

```bash
# Check available tasks
bd ready

# See project health
bd stats

# Claim a task
bd update <id> --status=in_progress
```

## Requirements

- Ubuntu 22.04+
- NVIDIA GPU (L40S recommended, 48GB VRAM)
- Python 3.10+
- Node.js 18+
- Farmhand multi-agent infrastructure

## Key Dependencies

```bash
# ML/Audio
torch torchvision torchaudio
demucs basic-pitch madmom
librosa matplotlib numpy

# Web
@strudel/web vite
```

## Documentation

- [PROJECT_KICKOFF.md](Reference_start/PROJECT_KICKOFF.md) - Full project specification
- [CLAUDE.md](Reference_start/CLAUDE.md) - Agent instructions for Strudel composition
- [patterns.md](Reference_start/patterns.md) - Strudel pattern reference
- [AGENTS.md](AGENTS.md) - Multi-agent coordination

## License

TBD
