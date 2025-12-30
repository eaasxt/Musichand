/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush } from '@strudel/web';
import {
  getAudioContext as getSuperdoughContext,
  analysers,
  getAnalyserById,
} from 'superdough';

let initialized = false;

// Analyser IDs used by our visualizations
const SPECTRUM_ANALYSER_ID = 1;
const WAVEFORM_ANALYSER_ID = 2;

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // Initialize Strudel (this also initializes superdough's AudioContext)
  await initStrudel();

  // Pre-create analysers with appropriate settings
  // Spectrum analyser: higher FFT for frequency resolution
  getAnalyserById(SPECTRUM_ANALYSER_ID, 2048, 0.8);
  // Waveform analyser: lower FFT for time resolution
  getAnalyserById(WAVEFORM_ANALYSER_ID, 512, 0.5);

  initialized = true;
}

/**
 * Wrap pattern code to include analyse for visualization
 * @param {string} code - Original Strudel code
 * @returns {string} - Modified code with analyse calls
 */
function wrapWithAnalyse(code) {
  // Check if code already has analyze calls
  if (code.includes('.analyze(') || code.includes('.scope(') || code.includes('.fscope(')) {
    return code;
  }

  // Wrap the pattern with analyze by appending to the last pattern expression
  const trimmed = code.trimEnd();

  // If code ends with a pattern (closing paren, bracket, or quote), add analyze
  if (/[)\]"'`\d]$/.test(trimmed)) {
    // Add both spectrum and waveform analysis
    return `${trimmed}.analyze(${SPECTRUM_ANALYSER_ID}).analyze(${WAVEFORM_ANALYSER_ID})`;
  }

  return code;
}

/**
 * Play Strudel code
 * @param {string} code - Strudel pattern code to evaluate
 */
export async function play(code) {
  await init();

  const ctx = getSuperdoughContext();

  // Resume audio context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // Wrap code with analyze calls for visualization
  const wrappedCode = wrapWithAnalyse(code);

  // Evaluate the Strudel code
  await evaluate(wrappedCode);
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the frequency spectrum analyser (connected after first play)
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
  return analysers[SPECTRUM_ANALYSER_ID] || null;
}

/**
 * Get the waveform analyser (connected after first play)
 * @returns {AnalyserNode|null}
 */
export function getWaveformAnalyser() {
  return analysers[WAVEFORM_ANALYSER_ID] || null;
}

/**
 * Get all analysers object (for direct access)
 * @returns {Object}
 */
export function getAnalysers() {
  return analysers;
}

/**
 * Get the audio context (from superdough)
 * @returns {AudioContext}
 */
export function getAudioContext() {
  return getSuperdoughContext();
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
