/**
 * Strudel Composer - Hot-reload player
 */

import { StrudelMirror } from '@strudel/repl';

// DOM elements
const codeDisplay = document.getElementById('code');
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const errorContainer = document.getElementById('error-container');

// State
let strudel = null;
let isPlaying = false;
let currentCode = '';

async function initStrudel() {
  if (strudel) return strudel;

  try {
    strudel = new StrudelMirror({
      defaultOutput: 'webaudio',
      onError: (err) => showError(err),
    });

    await strudel.init();
    updateStatus('Ready', false);
    return strudel;
  } catch (err) {
    showError(err);
    return null;
  }
}

async function loadComposition() {
  try {
    const response = await fetch(`/compositions/current.js?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to load composition');
    const code = await response.text();
    currentCode = code;
    codeDisplay.textContent = code;
    clearError();
    return code;
  } catch (err) {
    showError(err);
    return null;
  }
}

async function play() {
  if (isPlaying) return;

  const s = await initStrudel();
  if (!s) return;

  const code = await loadComposition();
  if (!code) return;

  try {
    await s.evaluate(code);
    s.start();
    isPlaying = true;
    updateStatus('Playing', true);
    playBtn.classList.add('active');
  } catch (err) {
    showError(err);
  }
}

function stop() {
  if (strudel) {
    strudel.stop();
  }
  isPlaying = false;
  updateStatus('Stopped', false);
  playBtn.classList.remove('active');
}

async function reload() {
  const wasPlaying = isPlaying;
  if (wasPlaying) stop();
  await loadComposition();
  if (wasPlaying) {
    setTimeout(play, 100);
  }
}

function updateStatus(text, playing) {
  statusEl.textContent = text;
  statusEl.className = playing ? 'playing' : '';
}

function showError(err) {
  console.error('Strudel error:', err);
  errorContainer.innerHTML = `<div class="error-msg">${err.message || err}</div>`;
  statusEl.className = 'error';
  statusEl.textContent = 'Error';
}

function clearError() {
  errorContainer.innerHTML = '';
}

// Event listeners
playBtn.addEventListener('click', play);
stopBtn.addEventListener('click', stop);
reloadBtn.addEventListener('click', reload);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target === document.body) {
    e.preventDefault();
    isPlaying ? stop() : play();
  }
  if (e.key === 'r' && e.ctrlKey) {
    e.preventDefault();
    reload();
  }
});

// Initial load
loadComposition();

console.log('Strudel Composer initialized');
console.log('Press Space to play/stop, Ctrl+R to reload');
