/**
 * Strudel Composer - Hot-reloading player for AI composition
 * 
 * Watches compositions/current.js and hot-reloads when it changes.
 * Provides audio recording for feedback analysis.
 */

import { initStrudel, evaluate, hush } from '@strudel/web';

// DOM elements
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const recordBtn = document.getElementById('recordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const codeContent = document.getElementById('codeContent');
const lastUpdated = document.getElementById('lastUpdated');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const cycleCount = document.getElementById('cycleCount');
const voiceCount = document.getElementById('voiceCount');
const lastError = document.getElementById('lastError');
const logContainer = document.getElementById('log');
const canvas = document.getElementById('visualizer');
const recordingStatus = document.getElementById('recordingStatus');

// State
let currentCode = '';
let isPlaying = false;
let audioContext = null;
let analyser = null;
let mediaRecorder = null;
let recordedChunks = [];
let cycles = 0;

// Initialize Strudel
async function init() {
  log('Initializing Strudel...', 'info');
  
  try {
    await initStrudel({
      prebake: () => {
        // Load common sample banks
        return Promise.all([
          // Default samples are loaded automatically
        ]);
      }
    });
    
    log('Strudel initialized successfully', 'success');
    
    // Set up audio context for visualization
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    // Load initial code
    await loadCode();
    
    // Start file watcher (polling since we can't use actual file watching in browser)
    setInterval(checkForUpdates, 2000);
    
    // Start visualization
    visualize();
    
  } catch (error) {
    log(`Initialization error: ${error.message}`, 'error');
    setStatus('error', 'Init Failed');
  }
}

// Load code from compositions/current.js
async function loadCode() {
  try {
    // Add cache buster to force reload
    const response = await fetch(`../compositions/current.js?t=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const code = await response.text();
    
    if (code !== currentCode) {
      currentCode = code;
      codeContent.textContent = code;
      lastUpdated.textContent = new Date().toLocaleTimeString();
      log('Code loaded', 'info');
      
      // If playing, hot-reload
      if (isPlaying) {
        await play();
      }
    }
    
  } catch (error) {
    log(`Error loading code: ${error.message}`, 'error');
    
    // Create default file if it doesn't exist
    if (error.message.includes('404')) {
      codeContent.textContent = '// Create compositions/current.js to get started\n// Example:\nsetcpm(120)\ns("bd sd bd sd")';
    }
  }
}

// Check for code updates
async function checkForUpdates() {
  try {
    const response = await fetch(`../compositions/current.js?t=${Date.now()}`);
    if (response.ok) {
      const code = await response.text();
      if (code !== currentCode) {
        log('Code changed, reloading...', 'info');
        await loadCode();
      }
    }
  } catch (error) {
    // Silently ignore polling errors
  }
}

// Play the current code
async function play() {
  try {
    // Resume audio context if suspended
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Stop any existing playback
    hush();
    
    // Small delay to ensure clean start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Evaluate and play the code
    await evaluate(currentCode);
    
    isPlaying = true;
    setStatus('playing', 'Playing');
    log('Playback started', 'success');
    
    // Start cycle counter
    startCycleCounter();
    
  } catch (error) {
    log(`Playback error: ${error.message}`, 'error');
    lastError.textContent = error.message.slice(0, 50);
    setStatus('error', 'Error');
  }
}

// Stop playback
function stop() {
  hush();
  isPlaying = false;
  setStatus('ready', 'Stopped');
  log('Playback stopped', 'info');
}

// Start recording audio output
async function startRecording() {
  try {
    // Get audio stream from destination
    const dest = audioContext.createMediaStreamDestination();
    
    // We need to re-route audio through our destination
    // This is a limitation - for now, record system audio instead
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      saveRecording(blob);
    };
    
    mediaRecorder.start();
    
    recordBtn.disabled = true;
    stopRecordBtn.disabled = false;
    recordingStatus.innerHTML = '<span class="recording-indicator"></span>Recording...';
    document.getElementById('recordingPanel').classList.add('recording');
    
    log('Recording started (using microphone - play through speakers)', 'info');
    
  } catch (error) {
    log(`Recording error: ${error.message}`, 'error');
  }
}

// Stop recording and save
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    recordingStatus.textContent = 'Saving...';
    document.getElementById('recordingPanel').classList.remove('recording');
  }
}

// Save recording
function saveRecording(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `composition-${Date.now()}.webm`;
  a.click();
  
  recordingStatus.textContent = 'Saved!';
  log('Recording saved', 'success');
  
  setTimeout(() => {
    recordingStatus.textContent = '';
  }, 3000);
}

// Set status indicator
function setStatus(state, text) {
  statusDot.className = 'status-dot';
  if (state === 'playing') statusDot.classList.add('playing');
  if (state === 'error') statusDot.classList.add('error');
  statusText.textContent = text;
}

// Log message
function log(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContainer.insertBefore(entry, logContainer.firstChild);
  
  // Keep log manageable
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.lastChild);
  }
  
  console.log(`[Strudel Composer] ${message}`);
}

// Cycle counter (approximate)
function startCycleCounter() {
  // This is a rough approximation - Strudel doesn't expose cycle count directly
  const cpm = 120; // Default, could parse from code
  const msPerCycle = 60000 / cpm;
  
  const startTime = Date.now();
  
  const updateCycles = () => {
    if (isPlaying) {
      cycles = Math.floor((Date.now() - startTime) / msPerCycle);
      cycleCount.textContent = cycles;
      requestAnimationFrame(updateCycles);
    }
  };
  
  updateCycles();
}

// Simple frequency visualization
function visualize() {
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;
  
  // Simple gradient bars visualization
  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    if (isPlaying && analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      
      const barWidth = width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Gradient from green to cyan
        const hue = 120 + (i / bufferLength) * 60;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
        if (x > width) break;
      }
    } else {
      // Idle animation
      const time = Date.now() / 1000;
      for (let i = 0; i < 50; i++) {
        const x = (i / 50) * width;
        const y = height / 2 + Math.sin(time * 2 + i * 0.2) * 20;
        ctx.fillStyle = `rgba(0, 255, 136, ${0.3 + Math.sin(time + i) * 0.2})`;
        ctx.fillRect(x, y, width / 50 - 2, 2);
      }
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

// Event listeners
playBtn.addEventListener('click', play);
stopBtn.addEventListener('click', stop);
reloadBtn.addEventListener('click', loadCode);
recordBtn.addEventListener('click', startRecording);
stopRecordBtn.addEventListener('click', stopRecording);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    isPlaying ? stop() : play();
  }
  if (e.code === 'KeyR' && e.ctrlKey) {
    e.preventDefault();
    loadCode();
  }
});

// Initialize on load
init();
