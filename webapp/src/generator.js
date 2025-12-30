/**
 * Musicman Generator - AI-powered music generation
 *
 * Uses Strudel for live audio playback with AI generation API.
 */

import { repl, controls } from '@strudel/core';
import { mini } from '@strudel/mini';
import { webaudioOutput, initAudioOnFirstClick } from '@strudel/webaudio';
import { registerSynthSounds, registerZZFXSounds } from '@strudel/webaudio';

// Configuration
const API_URL = 'http://localhost:8080';

// DOM elements
const codeDisplay = document.getElementById('code');
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const errorContainer = document.getElementById('error-container');

// AI Generation elements
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const generateStatus = document.getElementById('generate-status');
const quickPrompts = document.querySelectorAll('.quick-prompt');

// State
let evaluate = null;
let isPlaying = false;
let currentCode = '';

// Initialize audio
initAudioOnFirstClick();

async function initStrudel() {
  if (evaluate) return evaluate;

  try {
    const result = await repl({
      defaultOutput: webaudioOutput,
      onSchedulerError: (err) => showError(err),
      onEvalError: (err) => showError(err),
    });
    evaluate = result.evaluate;

    // Register built-in sounds
    await registerSynthSounds();

    return evaluate;
  } catch (err) {
    showError(err);
    return null;
  }
}

// ========== AI Generation ==========

async function generateCode(prompt) {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  generateBtn.classList.add('loading');
  generateStatus.innerHTML = '';

  try {
    const url = API_URL + '/generate?q=' + encodeURIComponent(prompt);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Update code display
    currentCode = data.output;
    codeDisplay.textContent = currentCode;

    // Show success
    generateStatus.innerHTML = '<div class="success-msg">Generated! Click Play to hear it.</div>';
    clearError();

    return data.output;

  } catch (err) {
    console.error('Generation error:', err);
    generateStatus.innerHTML = '<div class="error-msg">Generation failed: ' + err.message + '. Is the API running?</div>';
    return null;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
    generateBtn.classList.remove('loading');
  }
}

async function generateAndPlay(prompt) {
  const code = await generateCode(prompt);
  if (code) {
    await playCode(code);
  }
}

// ========== Playback ==========

async function playCode(code) {
  const eval_ = await initStrudel();
  if (!eval_) return;

  // Stop existing playback
  if (isPlaying) {
    stop();
    await new Promise(r => setTimeout(r, 100));
  }

  try {
    await eval_(code);
    isPlaying = true;
    updateStatus('Playing', true);
    playBtn.classList.add('active');
    clearError();
  } catch (err) {
    showError(err);
  }
}

async function play() {
  if (!currentCode) {
    generateStatus.innerHTML = '<div class="error-msg">No code to play. Generate something first!</div>';
    return;
  }
  await playCode(currentCode);
}

function stop() {
  if (controls.scheduler) {
    controls.scheduler.stop();
  }
  isPlaying = false;
  updateStatus('Stopped', false);
  playBtn.classList.remove('active');
}

async function loadComposition() {
  try {
    const response = await fetch('/compositions/current.js?t=' + Date.now());
    if (!response.ok) throw new Error('Failed to load composition');
    const code = await response.text();
    currentCode = code;
    codeDisplay.textContent = code;
    clearError();
    return code;
  } catch (err) {
    // Silent fail - composition file is optional now
    console.log('No composition file, using AI generation');
    return null;
  }
}

async function reload() {
  const wasPlaying = isPlaying;
  if (wasPlaying) stop();
  await loadComposition();
  if (wasPlaying && currentCode) {
    setTimeout(play, 100);
  }
}

// ========== UI Helpers ==========

function updateStatus(text, playing) {
  statusEl.textContent = text;
  statusEl.className = playing ? 'playing' : '';
}

function showError(err) {
  console.error('Strudel error:', err);
  errorContainer.innerHTML = '<div class="error-msg">' + (err.message || err) + '</div>';
  statusEl.className = 'error';
  statusEl.textContent = 'Error';
}

function clearError() {
  errorContainer.innerHTML = '';
}

// ========== Event Listeners ==========

// Playback controls
playBtn.addEventListener('click', play);
stopBtn.addEventListener('click', stop);
reloadBtn.addEventListener('click', reload);

// Generation
generateBtn.addEventListener('click', () => {
  const prompt = promptInput.value.trim();
  if (prompt) {
    generateCode(prompt);
  }
});

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const prompt = promptInput.value.trim();
    if (prompt) {
      generateCode(prompt);
    }
  }
});

// Quick prompts
quickPrompts.forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    promptInput.value = prompt;
    generateCode(prompt);
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space to play/stop (when not in input)
  if (e.key === ' ' && e.target !== promptInput) {
    e.preventDefault();
    isPlaying ? stop() : play();
  }
  // Ctrl+R to reload
  if (e.key === 'r' && e.ctrlKey) {
    e.preventDefault();
    reload();
  }
  // Ctrl+Enter to generate and play
  if (e.key === 'Enter' && e.ctrlKey && promptInput.value.trim()) {
    e.preventDefault();
    generateAndPlay(promptInput.value.trim());
  }
});

// ========== Initialization ==========

// Try to load existing composition
loadComposition();

// Check API health
fetch(API_URL + '/health')
  .then(r => r.json())
  .then(data => {
    console.log('API connected:', data);
    generateStatus.innerHTML = '<div class="success-msg">API connected (' + data.model + ')</div>';
    setTimeout(() => { generateStatus.innerHTML = ''; }, 3000);
  })
  .catch(() => {
    console.warn('API not available - start with: python3 ~/Musicman/scripts/api_server.py');
  });

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}

console.log('Musicman Generator initialized');
console.log('Shortcuts: Space=play/stop, Ctrl+Enter=generate+play');
