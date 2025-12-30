/**
 * Musicman Generator - AI-powered music generation
 *
 * Uses Strudel for live audio playback with AI generation API.
 * Supports multitrack composition and pattern library.
 */

import { repl, controls } from '@strudel/core';
import { mini } from '@strudel/mini';
import { webaudioOutput, initAudioOnFirstClick } from '@strudel/webaudio';
import { registerSynthSounds, registerZZFXSounds } from '@strudel/webaudio';

// Configuration - API URL based on environment
const API_URL = (() => {
  const host = window.location.hostname;
  // Local development
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  // Local network access (VM IP)
  if (host.startsWith('172.') || host.startsWith('192.168.') || host.startsWith('10.')) {
    return `http://${host}:8080`;
  }
  // Production (Vercel/Cloudflare) - use viernes.cc tunnel
  return 'https://musicman-api.viernes.cc';
})();

console.log('API URL:', API_URL);

// Pattern library (subset for quick access)
const PATTERNS = {
  drums: [
    { name: "4x4 Kick", code: 's("bd*4")' },
    { name: "House", code: 's("bd*4, ~ sd ~ sd, hh*8")' },
    { name: "Techno", code: 's("bd*4, ~ sd:2 ~ sd:2, hh(5,8)")' },
    { name: "Breakbeat", code: 's("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ ~ sd")' },
    { name: "Trap", code: 's("bd ~ ~ ~ bd ~ ~ bd, ~ ~ ~ ~ sd ~ ~ ~, hh*16")' },
    { name: "Minimal", code: 's("bd*4, hh(3,8)")' },
  ],
  bass: [
    { name: "Sub", code: 'n("0*4").scale("C:minor").s("sine").lpf(200)' },
    { name: "Pulsing", code: 'n("0 0 0 12").scale("C:minor").s("sawtooth").lpf(400)' },
    { name: "Walking", code: 'n("0 3 5 7").scale("C:minor").s("triangle").lpf(300)' },
    { name: "Acid", code: 'n("0 0 7 0 5 0 3 0").scale("C:minor").s("sawtooth").lpf(sine.range(200,2000).fast(4))' },
  ],
  chords: [
    { name: "Minor Pad", code: 'chord("<Cm Fm>").voicing().s("triangle").lpf(800)' },
    { name: "Jazz ii-V-I", code: 'chord("<Dm7 G7 Cmaj7 Cmaj7>").voicing().s("triangle").lpf(1200)' },
    { name: "Ambient", code: 'chord("<Am Em Dm Am>").voicing().s("triangle").room(0.5).lpf(600)' },
    { name: "House Stabs", code: 'chord("<Cm7 Fm7 Gm7 Cm7>").voicing().s("sawtooth").lpf(600).gain(0.5)' },
  ],
  leads: [
    { name: "Minor Scale", code: 'n("0 2 3 5 7 5 3 2").scale("C:minor").s("triangle").lpf(1500)' },
    { name: "Arp", code: 'n("0 3 5 7 10 7 5 3").scale("C:minor").s("sawtooth").lpf(2000).fast(2)' },
    { name: "Floating", code: 'n("0 ~ 4 ~ 7 ~ 4 ~").scale("C:minor").s("sine").room(0.4).slow(2)' },
  ],
};

// DOM elements
const codeDisplay = document.getElementById('code');
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const errorContainer = document.getElementById('error-container');

const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const generateStatus = document.getElementById('generate-status');
const quickPrompts = document.querySelectorAll('.quick-prompt');

const genreSelect = document.getElementById('genreSelect');
const keySelect = document.getElementById('keySelect');
const modeSelect = document.getElementById('modeSelect');
const multitrackToggle = document.getElementById('multitrackToggle');
const llmToggle = document.getElementById('llmToggle');

const patternTabs = document.querySelectorAll('.pattern-tab');
const patternList = document.getElementById('pattern-list');

// State
let evaluate = null;
let isPlaying = false;
let currentCode = '';
let useMultitrack = true;
let useLLM = false;
let currentPatternCategory = 'drums';

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

    await registerSynthSounds();

    return evaluate;
  } catch (err) {
    showError(err);
    return null;
  }
}

// ========== Pattern Library ==========

function renderPatterns(category) {
  const patterns = PATTERNS[category] || [];
  patternList.innerHTML = patterns.map(p => 
    `<div class="pattern-item" data-code="${encodeURIComponent(p.code)}">${p.name}</div>`
  ).join('');
  
  // Add click handlers
  patternList.querySelectorAll('.pattern-item').forEach(item => {
    item.addEventListener('click', () => {
      const code = decodeURIComponent(item.dataset.code);
      insertPattern(code);
    });
  });
}

function insertPattern(code) {
  // If we have existing code, add as new layer
  if (currentCode && currentCode.includes('stack(')) {
    // Insert before the closing paren of stack
    currentCode = currentCode.replace(/\)(\s*)$/, ',\n  ' + code + '\n)$1');
  } else if (currentCode && currentCode.trim()) {
    // Wrap in stack
    currentCode = 'stack(\n  ' + currentCode.trim() + ',\n  ' + code + '\n)';
  } else {
    currentCode = code;
  }
  codeDisplay.textContent = currentCode;
  generateStatus.innerHTML = '<div class="success-msg">Pattern added! Click Play to hear it.</div>';
}

// ========== AI Generation ==========

function buildPrompt() {
  let prompt = promptInput.value.trim();
  
  // Add genre if selected
  const genre = genreSelect.value;
  if (genre && !prompt.toLowerCase().includes(genre)) {
    prompt = genre + ' ' + prompt;
  }
  
  // Add key if selected
  const key = keySelect.value;
  if (key && !prompt.toLowerCase().includes(key.toLowerCase())) {
    prompt += ' in ' + key;
  }
  
  // Add mode if selected
  const mode = modeSelect.value;
  if (mode && !prompt.toLowerCase().includes(mode)) {
    prompt += ' ' + mode;
  }
  
  return prompt;
}

async function generateCode() {
  const prompt = buildPrompt();
  if (!prompt) {
    generateStatus.innerHTML = '<div class="error-msg">Please enter a description</div>';
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  generateBtn.classList.add('loading');
  generateStatus.innerHTML = '';

  try {
    // Choose endpoint based on toggle
    const endpoint = useMultitrack ? '/multitrack' : '/generate';
    const params = new URLSearchParams({ q: prompt });
    if (useLLM && useMultitrack) {
      params.append('llm', 'true');
    }
    
    const url = API_URL + endpoint + '?' + params;
    console.log('Fetching:', url);
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

    // Show success with method info
    const method = data.method ? ' (' + data.method + ')' : '';
    generateStatus.innerHTML = '<div class="success-msg">Generated' + method + '! Click Play to hear it.</div>';
    clearError();

    return data.output;

  } catch (err) {
    console.error('Generation error:', err);
    generateStatus.innerHTML = '<div class="error-msg">Generation failed: ' + err.message + '</div>';
    return null;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
    generateBtn.classList.remove('loading');
  }
}

async function generateAndPlay() {
  const code = await generateCode();
  if (code) {
    await playCode(code);
  }
}

// ========== Playback ==========

async function playCode(code) {
  const eval_ = await initStrudel();
  if (!eval_) return;

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
generateBtn.addEventListener('click', generateCode);

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.ctrlKey) {
    e.preventDefault();
    generateCode();
  }
});

// Toggles
multitrackToggle.addEventListener('click', () => {
  useMultitrack = !useMultitrack;
  multitrackToggle.classList.toggle('active', useMultitrack);
});

llmToggle.addEventListener('click', () => {
  useLLM = !useLLM;
  llmToggle.classList.toggle('active', useLLM);
});

// Quick prompts
quickPrompts.forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    promptInput.value = prompt;
    generateCode();
  });
});

// Pattern tabs
patternTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    patternTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentPatternCategory = tab.dataset.category;
    renderPatterns(currentPatternCategory);
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space to play/stop (but not when typing in input)
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
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    generateAndPlay();
  }
});

// ========== Initialization ==========

// Render initial patterns
renderPatterns('drums');

// Try to load existing composition
loadComposition();

// Check API health
fetch(API_URL + '/health')
  .then(r => r.json())
  .then(data => {
    console.log('API connected:', data);
    const features = data.features ? data.features.join(', ') : 'generate';
    generateStatus.innerHTML = '<div class="success-msg">API connected (' + data.model + ')</div>';
    setTimeout(() => { generateStatus.innerHTML = ''; }, 3000);
  })
  .catch(err => {
    console.warn('API not available:', err);
    generateStatus.innerHTML = '<div class="error-msg">API offline - check server</div>';
  });

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}

console.log('Musicman Generator initialized');
console.log('Shortcuts: Space=play/stop, Ctrl+Enter=generate+play, Enter=generate');
