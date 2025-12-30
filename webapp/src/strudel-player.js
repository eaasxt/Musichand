/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import {
  getAudioContext as getSuperdoughContext,
  analysers,
  getAnalyserById,
} from 'superdough';

let initialized = false;

// Single analyser ID for visualizations
// Note: .analyze() calls don't stack - only one ID can be used per pattern
// We use a single analyser with settings that work for both waveform and spectrum
export const ANALYSER_ID = 1;

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // Initialize Strudel with sample banks loaded
  // Note: tidalcycles/Dirt-Samples uses 'master' branch, not 'main'
  await initStrudel({
    prebake: () =>
      samples('github:tidalcycles/Dirt-Samples/master'),
  });

  // Pre-create analyser with settings good for both waveform and spectrum
  // FFT 2048 gives good frequency resolution, smoothing 0.8 for spectrum
  getAnalyserById(ANALYSER_ID, 2048, 0.8);

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
    // Add analysis with fft parameter
    // .fft(6) = 2^(6+5) = 2048 samples for good frequency resolution
    // .analyze(id) connects audio to the analyser
    return `${trimmed}.fft(6).analyze(${ANALYSER_ID})`;
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

  // Debug: log the wrapped code and analyser state
  console.log('[Musicman] Wrapped code:', wrappedCode.slice(-100));
  console.log('[Musicman] Analysers before eval:', Object.keys(analysers));

  // Evaluate the Strudel code
  await evaluate(wrappedCode);

  // Debug: check analyser state after eval
  setTimeout(() => {
    console.log('[Musicman] Analysers after eval:', Object.keys(analysers));
    console.log('[Musicman] Analyser 1:', analysers[ANALYSER_ID]);
    if (analysers[ANALYSER_ID]) {
      const data = new Float32Array(analysers[ANALYSER_ID].frequencyBinCount);
      analysers[ANALYSER_ID].getFloatTimeDomainData(data);
      console.log('[Musicman] Sample data:', data.slice(0, 10));
    }
  }, 1000);
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the analyser (connected after first play)
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
  return analysers[ANALYSER_ID] || null;
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
