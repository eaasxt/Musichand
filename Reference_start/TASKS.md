# Strudel Composer - Initial Tasks

These tasks can be imported into Beads to set up the project backlog.

## Task 1: Basic Beat Composition
- **Type**: task
- **Status**: ready
- **Title**: Create a basic 4-bar beat pattern
- **Description**: 
  Compose a simple drum pattern with kick, snare, and hi-hat.
  Use euclidean rhythms for interest. Target: 120 BPM, 4/4 time.
  Success: Pattern plays without errors and has clear rhythm.

## Task 2: Add Bass Line
- **Type**: task  
- **Status**: blocked
- **Depends**: Task 1
- **Title**: Add complementary bass line
- **Description**:
  Add a bass line that complements the drum pattern.
  Stay in a single key (suggest C minor or A minor).
  Use .lpf() to keep the bass warm and not harsh.
  Success: Bass and drums work together rhythmically.

## Task 3: Add Lead/Melody
- **Type**: task
- **Status**: blocked
- **Depends**: Task 2  
- **Title**: Add lead melody or arpeggio
- **Description**:
  Add a melodic element on top of drums and bass.
  Use .room() and .delay() for space.
  Keep it simple - 4-8 notes max per pattern.
  Success: All three elements (drums, bass, lead) sound cohesive.

## Task 4: Analyze Reference Track
- **Type**: task
- **Status**: ready
- **Title**: Analyze a reference mp3 and extract features
- **Description**:
  Take a reference track, run it through analyze_audio.py.
  Review the output: BPM, key, frequency balance.
  Document findings in output/ directory.
  Success: Have concrete parameters to guide composition.

## Task 5: Match Reference Style
- **Type**: task
- **Status**: blocked
- **Depends**: Task 4
- **Title**: Create composition matching reference characteristics
- **Description**:
  Using the analysis from Task 4, create a composition that:
  - Matches the BPM
  - Uses the same key/scale
  - Has similar frequency balance
  - Follows similar structural patterns
  Success: New composition "feels like" the reference.

## Task 6: Visual Feedback Loop
- **Type**: task
- **Status**: ready
- **Title**: Record output and analyze spectrogram
- **Description**:
  1. Play a composition through the web app
  2. Record the output (or use system audio recording)
  3. Generate spectrogram with generate_spectrogram.py
  4. Analyze the visual feedback
  5. Make improvements based on what you see
  Success: Can articulate what the spectrogram shows and make targeted improvements.

## Epic: Multi-Agent Composition
- **Type**: epic
- **Status**: future
- **Title**: Enable multi-agent parallel composition
- **Description**:
  Set up the project for multiple agents working on different tracks:
  - Agent A: drums.js
  - Agent B: bass.js  
  - Agent C: lead.js
  - main current.js imports and stacks all three
  
  Requires:
  - File reservation patterns that work per-file
  - Message passing for coordination ("drums done, bass can start")
  - Spectrogram analysis for each agent's output
