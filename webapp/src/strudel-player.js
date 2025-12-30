/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush } from '@strudel/web';

let initialized = false;
let audioContext = null;
let analyser = null;
let waveformAnalyser = null;

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // Initialize Strudel
  await initStrudel();

  // Get or create audio context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create analyser for frequency spectrum
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;

  // Create analyser for waveform
  waveformAnalyser = audioContext.createAnalyser();
  waveformAnalyser.fftSize = 512;
  waveformAnalyser.smoothingTimeConstant = 0.5;

  initialized = true;
}

/**
 * Play Strudel code
 * @param {string} code - Strudel pattern code to evaluate
 */
export async function play(code) {
  await init();

  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // Evaluate the Strudel code
  await evaluate(code);
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the frequency spectrum analyser
 * @returns {AnalyserNode}
 */
export function getAnalyser() {
  return analyser;
}

/**
 * Get the waveform analyser
 * @returns {AnalyserNode}
 */
export function getWaveformAnalyser() {
  return waveformAnalyser;
}

/**
 * Get the audio context
 * @returns {AudioContext}
 */
export function getAudioContext() {
  return audioContext;
}

/**
 * Check if player is initialized
 * @returns {boolean}
 */
export function isInitialized() {
  return initialized;
}

/**
 * Extract BPM from Strudel code
 * @param {string} code - Strudel code
 * @returns {number|null} - BPM or null if not found
 */
export function extractBPM(code) {
  // Match setcpm(120) or setcps(2)
  const cpmMatch = code.match(/setcpm\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  if (cpmMatch) {
    return parseFloat(cpmMatch[1]);
  }

  const cpsMatch = code.match(/setcps\s*\(\s*([^)]+)\s*\)/i);
  if (cpsMatch) {
    // Try to evaluate simple expressions like 120/60/4
    try {
      // Use Function constructor instead of eval for safer execution
      const cps = new Function('return ' + cpsMatch[1])();
      // Convert CPS to BPM: BPM = CPS * 60 * 4 (assuming 4 beats per cycle)
      return cps * 60 * 4;
    } catch {
      return null;
    }
  }

  // Check for BPM comment
  const bpmComment = code.match(/BPM[:\s]+(\d+)/i);
  if (bpmComment) {
    return parseInt(bpmComment[1], 10);
  }

  return 120; // Default BPM
}

/**
 * Extract key from Strudel code
 * @param {string} code - Strudel code
 * @returns {string|null} - Key like "C minor" or null
 */
export function extractKey(code) {
  // Match .scale("C:minor") or .scale("A4:minor")
  const scaleMatch = code.match(/\.scale\s*\(\s*["']([A-G][#b]?\d?):?(\w+)?["']\s*\)/i);
  if (scaleMatch) {
    const root = scaleMatch[1].replace(/\d/, '');
    const mode = scaleMatch[2] || 'major';
    return `${root} ${mode}`;
  }

  // Check for Key comment
  const keyComment = code.match(/Key[:\s]+([A-G][#b]?\s*\w+)/i);
  if (keyComment) {
    return keyComment[1].trim();
  }

  return null;
}
