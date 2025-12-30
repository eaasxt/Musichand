/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import {
  getAudioContext as getSuperdoughContext,
  getDestination,
  setDestination,
} from 'superdough';

let initialized = false;

// Master analyser that captures ALL audio output
let masterAnalyser = null;

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

  // Set up master analyser in the audio chain
  // This intercepts ALL audio before it reaches the speakers
  const ctx = getSuperdoughContext();
  const realDestination = getDestination();

  // Create our analyser node
  masterAnalyser = ctx.createAnalyser();
  masterAnalyser.fftSize = 2048;
  masterAnalyser.smoothingTimeConstant = 0.8;

  // Create a passthrough gain node
  const passthrough = ctx.createGain();
  passthrough.gain.value = 1;

  // Chain: passthrough -> analyser -> real destination
  passthrough.connect(masterAnalyser);
  masterAnalyser.connect(realDestination);

  // Tell superdough to route all audio to our passthrough
  setDestination(passthrough);

  console.log('[Musicman] Master analyser installed in audio chain');

  initialized = true;
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

  // Evaluate the Strudel code directly
  // No need to wrap with .analyze() - we use a master analyser
  await evaluate(code);

  console.log('[Musicman] Pattern started, master analyser active');
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the master analyser (available after init)
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
  return masterAnalyser;
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
