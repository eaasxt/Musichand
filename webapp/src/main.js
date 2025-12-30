/**
 * Strudel Composer - Hot-reload player
 *
 * This loads and plays Strudel patterns from compositions/current.js
 * with hot-reload support for iterative composition.
 */

import { repl, controls } from '@strudel/core';
import { mini } from '@strudel/mini';
import { webaudioOutput, initAudioOnFirstClick, registerSynthSounds, samples, getAudioContext } from '@strudel/webaudio';
import '@strudel/tonal';
import '@strudel/soundfonts';

// DOM elements
const codeDisplay = document.getElementById('code');
const statusEl = document.getElementById('status');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const errorContainer = document.getElementById('error-container');

// State
let scheduler = null;
let isPlaying = false;
let currentCode = '';

// Initialize audio
initAudioOnFirstClick();

async function initStrudel() {
  try {
    // Initialize REPL with mini-notation transpiler
    const { evaluate } = await repl({
      defaultOutput: webaudioOutput,
      transpiler: mini,
      onSchedulerError: (err) => showError(err),
      onEvalError: (err) => showError(err),
      getTime: () => getAudioContext().currentTime,
    });

    // Register built-in synth sounds
    await registerSynthSounds();

    // Load basic drum samples
    await samples({
      bd: 'bd/BT0A0D0.wav',
      sd: 'sd/ST0T0S3.wav',
      hh: 'hh/000_hh3closedhh.wav',
      oh: 'oh/000_oh3openhh.wav',
      cp: 'cp/HANDCLP0.wav',
    }, 'https://strudel.cc/samples/');

    updateStatus('Ready', false);
    return evaluate;
  } catch (err) {
    showError(err);
    return null;
  }
}

async function loadComposition() {
  try {
    // Fetch composition with cache-busting
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

  const evaluate = await initStrudel();
  if (!evaluate) return;

  const code = await loadComposition();
  if (!code) return;

  try {
    await evaluate(code);
    isPlaying = true;
    updateStatus('Playing', true);
    playBtn.classList.add('active');
  } catch (err) {
    showError(err);
  }
}

function stop() {
  if (controls.scheduler) {
    controls.scheduler.stop();
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

// Hot Module Replacement (HMR) support
if (import.meta.hot) {
  import.meta.hot.accept();

  // Watch for composition changes
  const ws = new WebSocket(`ws://${location.host}`);
  ws.onmessage = (event) => {
    if (event.data.includes('current.js')) {
      console.log('Composition changed, reloading...');
      reload();
    }
  };
}

console.log('Strudel Composer initialized');
console.log('Press Space to play/stop, Ctrl+R to reload');
