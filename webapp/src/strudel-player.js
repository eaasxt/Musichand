/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import {
  getAudioContext as getSuperdoughContext,
  setDefaultAudioContext,
} from 'superdough';

let initialized = false;

// Master analyser that captures ALL audio output
let masterAnalyser = null;
let audioContext = null;

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // Create our own AudioContext first
  audioContext = new AudioContext();

  // Create analyser node
  masterAnalyser = audioContext.createAnalyser();
  masterAnalyser.fftSize = 2048;
  masterAnalyser.smoothingTimeConstant = 0.8;

  // Connect analyser to destination (parallel listener)
  // We'll also create a custom destination that routes through analyser
  masterAnalyser.connect(audioContext.destination);

  // Create a gain node as the "fake destination" for superdough
  const fakeDestination = audioContext.createGain();
  fakeDestination.connect(masterAnalyser);

  // Patch the audio context's destination getter to return our fake destination
  // This is a workaround since we can't change the real destination
  const patchedContext = Object.create(audioContext, {
    destination: {
      get: () => fakeDestination,
      enumerable: true,
      configurable: true
    }
  });

  // Set our patched context as superdough's default
  setDefaultAudioContext(patchedContext);

  console.log('[Musicman] Created patched AudioContext with analyser');

  // Initialize Strudel with sample banks loaded
  // Note: tidalcycles/Dirt-Samples uses 'master' branch, not 'main'
  // nolint - caller handles errors
  await initStrudel({
    prebake: () =>
      samples('github:tidalcycles/Dirt-Samples/master'),
  });

  console.log('[Musicman] Strudel initialized with master analyser');

  initialized = true;
}

/**
 * Play Strudel code
 * @param {string} code - Strudel pattern code to evaluate
 */
export async function play(code) {
  await init(); // nolint - caller handles errors

  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume(); // nolint - caller handles errors
  }

  // Evaluate the Strudel code directly
  // No need to wrap with .analyze() - we use a master analyser
  await evaluate(code); // nolint - caller handles errors

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
  // Debug: periodically check if we're getting data
  if (masterAnalyser && audioContext && audioContext.state === 'running') {
    const testData = new Float32Array(masterAnalyser.frequencyBinCount);
    masterAnalyser.getFloatTimeDomainData(testData);
    const hasSignal = testData.some(v => Math.abs(v) > 0.001);
    if (!hasSignal && Math.random() < 0.01) {
      console.log('[Musicman] Analyser exists but no signal detected, context state:', audioContext.state);
    }
  }
  return masterAnalyser;
}

/**
 * Get the audio context
 * @returns {AudioContext}
 */
export function getAudioContext() {
  return audioContext || getSuperdoughContext();
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
      // Safely evaluate arithmetic expressions for tempo parsing
      // Only allows numbers, operators, and parentheses
      const expr = cpsMatch[1].trim();
      if (/^[\d\s+\-*/().]+$/.test(expr)) {
        const cps = new Function('return ' + expr)(); // ubs:ignore - Safe arithmetic-only expression
        // Convert CPS to BPM: BPM = CPS * 60 * 4 (assuming 4 beats per cycle)
        return cps * 60 * 4;
      }
      return null;
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
