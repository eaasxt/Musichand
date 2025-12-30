# Strudel Composer + ML Training - Project Kickoff

You are initializing a new project on a fresh Ubuntu 22.04 VM with an NVIDIA L40S GPU (48GB VRAM). This project has two main components:

1. **Strudel Composer** - AI music generation using Strudel (browser-based live coding)
2. **Music ML Pipeline** - Audio analysis, source separation, and eventually a fine-tuned model for music→Strudel translation

## Project Context

This is a "dogfood" project for testing Farmhand (multi-agent AI coding infrastructure). The goal is to:
- Get Claude agents composing music via Strudel
- Build a feedback loop where agents can "hear" their output via spectrogram analysis
- Eventually train a local model that specializes in music understanding → Strudel code generation

## Existing Artifacts

The following files have been dropped into this VM and contain the base setup:

```
~/strudel-composer/
├── CLAUDE.md                    # Agent instructions for Strudel composition
├── TASKS.md                     # Initial task backlog
├── setup.sh                     # Dependency installer
├── requirements.txt             # Python deps (librosa, matplotlib, numpy)
├── compositions/
│   └── current.js              # Hot-reloaded by web app
├── scripts/
│   ├── analyze_audio.py        # BPM/key/frequency extraction from mp3
│   └── generate_spectrogram.py # Visual feedback generation
├── web/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/main.js             # Hot-reload Strudel player
└── docs/
    └── patterns.md             # Strudel pattern reference
```

Review these files to understand the existing setup before proceeding.

---

## Your Mission

### Phase 1: Environment Setup (Do First)

1. **Run the setup script** to install base dependencies
2. **Verify GPU access**: `nvidia-smi` should show L40S
3. **Install ML dependencies** not in the base setup:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   pip install demucs basic-pitch madmom transformers accelerate bitsandbytes
   pip install unsloth  # For efficient fine-tuning later
   ```
4. **Test the web app**: `cd web && npm install && npm run dev`
5. **Set up cloudflared tunnel** for remote listening access

### Phase 2: Build the Music Analysis Pipeline

Create a new script `scripts/extract_music.py` that does full music disaggregation:

```
Input: Any MP3/WAV file
Output: Structured JSON with everything needed to reconstruct in Strudel

Pipeline:
1. Source Separation (Demucs)
   - Split into: drums, bass, vocals, other
   - Save stems to output directory

2. Drum Analysis (from drums.wav)
   - Detect kick, snare, hi-hat hits
   - Quantize to grid (8th notes, 16ths)
   - Output as mini-notation pattern: "bd*4, ~ sd ~ sd, hh*8"

3. Bass Analysis (from bass.wav)  
   - Pitch detection with basic-pitch
   - Quantize notes to scale degrees
   - Detect the key/scale
   - Output as: n("0 0 3 5").scale("X:minor")

4. Chord/Harmony Analysis (from other.wav)
   - Chord detection
   - Output progression: "<Am F C G>"

5. Global Features
   - BPM (use madmom for accuracy)
   - Overall key
   - Song structure/sections
```

**Output format** (`analysis.json`):
```json
{
  "file": "track.mp3",
  "bpm": 128,
  "key": "A",
  "mode": "minor",
  "duration_seconds": 180,
  "drums": {
    "pattern": "bd*4, ~ sd ~ sd, hh*8",
    "kick_times": [0, 0.5, 1.0, 1.5],
    "snare_times": [0.5, 1.5],
    "hihat_density": 8
  },
  "bass": {
    "pattern": "n(\"0 0 3 5\").scale(\"A2:minor\")",
    "notes": ["A1", "A1", "C2", "E2"],
    "scale_degrees": [0, 0, 3, 7]
  },
  "chords": {
    "progression": ["Am", "F", "C", "G"],
    "strudel": "chord(\"<Am F C G>\").voicing()"
  },
  "suggested_strudel": "// Full suggested code here",
  "stems_dir": "output/track_stems/"
}
```

### Phase 3: Integration with Strudel Composer

Update the workflow so agents can:

1. **Analyze a reference track**:
   ```bash
   python scripts/extract_music.py references/song.mp3
   ```

2. **Read the JSON output** and understand the musical structure

3. **Generate Strudel code** that approximates the reference

4. **Compare output** via spectrogram analysis

5. **Iterate** based on visual feedback

### Phase 4: Training Data Collection (Future)

Build a dataset for fine-tuning:

1. **Scrape Strudel examples** from:
   - strudel.cc (public patterns)
   - GitHub repos
   - Tidal Cycles patterns (translate to Strudel)

2. **For each example**, generate the reverse mapping:
   - Parse the Strudel code
   - Extract what it "describes" (tempo, instruments, patterns)
   - Create (description → code) pairs

3. **Synthetic augmentation**:
   - Generate variations of existing patterns
   - Create analysis JSON → code pairs programmatically

Target: **5-10k examples** for initial fine-tuning

### Phase 5: Fine-Tuning (Future)

Using Unsloth + QLoRA on the L40S:

```python
from unsloth import FastLanguageModel

# Load base model
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="mistralai/Mistral-7B-v0.3",
    max_seq_length=4096,
    load_in_4bit=True,
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# Training config for music→Strudel task
```

---

## Immediate First Tasks

Start with these concrete tasks:

### Task 1: Verify Environment
```bash
# GPU check
nvidia-smi

# Python check
python3 --version

# Create venv for ML work
python3 -m venv ~/.venv/strudel-ml
source ~/.venv/strudel-ml/bin/activate

# Install everything
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install demucs basic-pitch madmom librosa matplotlib numpy
```

### Task 2: Test Demucs
```bash
# Download a test track (use any CC-licensed music)
# Or create a simple test with the web app first

# Run separation
demucs test.mp3 --out output/stems/
```

### Task 3: Create extract_music.py
Build the full pipeline script. Start with just Demucs + BPM detection, then add drum analysis, then bass, then chords.

### Task 4: Test End-to-End
1. Take a simple reference track
2. Run through extract_music.py
3. Read the JSON
4. Write Strudel code that matches
5. Compare via spectrogram

---

## File Structure Goal

```
~/strudel-composer/
├── CLAUDE.md
├── PROJECT_KICKOFF.md          # This file
├── setup.sh
├── requirements.txt
├── requirements-ml.txt         # NEW: ML-specific deps
│
├── compositions/
│   └── current.js
│
├── scripts/
│   ├── analyze_audio.py        # Basic analysis (existing)
│   ├── generate_spectrogram.py # Visual feedback (existing)
│   ├── extract_music.py        # NEW: Full disaggregation pipeline
│   ├── scrape_strudel.py       # NEW: Training data collection
│   └── train_model.py          # NEW: Fine-tuning script
│
├── web/
│   └── (existing web app)
│
├── data/
│   ├── raw/                    # Scraped Strudel examples
│   ├── processed/              # Cleaned training pairs
│   └── dataset.jsonl           # Final training data
│
├── models/
│   └── strudel-7b/            # Fine-tuned model output
│
├── references/                 # Input MP3s to analyze
│   └── *.mp3
│
└── output/
    ├── stems/                  # Demucs output
    ├── analysis/               # JSON analysis files
    └── spectrograms/           # Visual feedback images
```

---

## Success Criteria

**Phase 1 Complete When**:
- [ ] GPU accessible, all deps installed
- [ ] Web app running with cloudflared tunnel
- [ ] Can play Strudel compositions remotely

**Phase 2 Complete When**:
- [ ] extract_music.py produces valid JSON from any MP3
- [ ] Drum pattern extraction works (even if imperfect)
- [ ] Bass note detection works
- [ ] Can generate "approximate" Strudel from analysis

**Phase 3 Complete When**:
- [ ] Full workflow tested: reference → analysis → composition → comparison
- [ ] Agent can iterate based on spectrogram feedback
- [ ] At least 3 different reference tracks successfully approximated

**Phase 4+ (Future)**:
- [ ] 5k+ training examples collected
- [ ] Fine-tuned model produces valid Strudel
- [ ] Model integrated into Farmhand workflow

---

## Notes

- The L40S has 48GB VRAM - plenty for Demucs inference + 7B model fine-tuning with QLoRA
- Start simple: get Demucs working, then add analysis piece by piece
- Don't over-engineer the JSON format - iterate based on what's actually useful
- The web app hot-reloads, so composition iteration should be fast
- Use `bd ready` and `bd update` if Beads/Farmhand is installed for task tracking

Begin by reading the existing files (especially CLAUDE.md and the scripts/), then start on Task 1.
