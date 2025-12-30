# AGENTS.md

Project coordination file for Musicman multi-agent development.

> **This file lives in the project root.** Update it as agents join, leave, or change focus.

---

## Project Overview

**Musicman** - AI-powered music composition and analysis using Strudel live coding.

Combines:
- **Strudel Composer** - AI music generation via [Strudel](https://strudel.cc/)
- **Music ML Pipeline** - Audio analysis, source separation, music-to-code translation

**Status**: Phases 1-3 complete. Web app live, analysis pipeline working.

---

## Current Agents

| Agent Name | Program | Focus | Status |
|------------|---------|-------|--------|
| BlueBear | claude-code | Environment setup, ML pipeline | Completed Phase 1-3 |
| ChartreuseCreek | claude-code | Project initialization, docs | Completed setup |

---

## Active Work

### In Progress

| Bead ID | Title | Agent | Started |
|---------|-------|-------|---------|
| *None* | - | - | - |

### Completed (2025-12-30)

- Environment setup (Python venv, PyTorch+CUDA, Demucs, basic-pitch)
- Music analysis pipeline (`extract_music.py`)
- Web app with cloudflared tunnel
- Documentation (README, CLAUDE.md, patterns.md)

### Blocked

| Bead ID | Blocked By | Reason |
|---------|------------|--------|
| *None* | - | - |

---

## File Reservations

Current exclusive file reservations (auto-managed by Agent Mail):

```bash
# Check reservations:
mcp-query reservations
```

---

## Project Conventions

### Branching

```
main              # Production-ready code
├── feature/*     # New features
├── fix/*         # Bug fixes
└── agent/*       # Agent work branches (optional)
```

### Commit Messages

```
[bead-id] Short description

- What was done
- Why it was done

Co-Authored-By: AgentName <noreply@anthropic.com>
```

### Code Style

- Follow existing patterns in the codebase
- Run `ubs <files>` before committing

---

## Communication Protocol

### Message Subjects

| Subject Pattern | When |
|-----------------|------|
| `[CLAIMED] bd-XXX - Title` | After claiming a bead |
| `[CLOSED] bd-XXX - Title` | After closing a bead |
| `[BLOCKED] Agent - bd-XXX` | When stuck |
| `Agent Online` | When starting a session |

### Coordination Rules

1. **Check inbox** before starting work
2. **Announce claims** before editing files
3. **Reserve files** before editing
4. **Release reservations** when done
5. **Close beads** promptly after completing

---

## Tool Quick Reference

### Finding Work

```bash
bd ready                    # Available beads
bd ready --json             # Machine-readable
bv --robot-priority         # AI-recommended priorities
bv --robot-plan             # Execution order with parallel tracks
```

### Claiming Work

```bash
bd-claim <id> --paths "src/**/*.py"  # Atomic claim + reserve (preferred)
# OR manual:
bd update <id> --status=in_progress --assignee=YourName
```

### Completing Work

```bash
ubs $(git diff --name-only)  # Security scan (MANDATORY)
git add -A && git commit     # Commit changes
bd close <id> --reason="..." # Close bead
```

---

## Session Checklist

### Starting

- [ ] Read this file (AGENTS.md)
- [ ] Register with Agent Mail
- [ ] Check inbox for messages
- [ ] Run `bd ready` to find work
- [ ] Claim bead and reserve files
- [ ] Announce `[CLAIMED]`

### Ending

- [ ] Run `ubs` on changed files
- [ ] Commit and push changes
- [ ] Close completed beads
- [ ] Release file reservations
- [ ] Announce `[CLOSED]`
- [ ] Update this file if needed

---

## Project-Specific Notes

### Architecture

```
~/strudel-composer/          # Main application
├── scripts/extract_music.py # Full analysis pipeline (Demucs + basic-pitch + librosa)
├── compositions/current.js  # Hot-reloaded Strudel code
├── web/                     # Vite + @strudel/web app (port 5173)
└── output/                  # Stems, analysis JSON, spectrograms

Musicman/                    # This repo - coordination
├── Reference_start/         # Specs and reference docs
└── .beads/                  # Task tracking
```

### Dependencies

- **Python**: torch 2.5.1+cu121, demucs, basic-pitch, librosa, madmom
- **Web**: @strudel/web, @strudel/core, vite
- **System**: NVIDIA L40S (48GB VRAM), CUDA 12.7

### Known Issues

- basic-pitch has numpy 2.x compatibility issue (falls back gracefully)
- Cloudflared tunnel URL changes on restart

---

## History

| Date | Agent | Action |
|------|-------|--------|
| 2025-12-30 | ChartreuseCreek | Initialized project with bd, created AGENTS.md, README |
| 2025-12-30 | BlueBear | Built Phases 1-3: environment, ML pipeline, web app |
