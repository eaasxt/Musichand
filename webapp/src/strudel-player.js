/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import { getAudioContext as getSuperdoughContext } from 'superdough';

let initialized = false;
let audioContext = null;
let masterAnalyser = null;

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // FIRST: Get/create audio context and install analyser BEFORE initStrudel
  // This ensures our patch catches all audio connections including superdough's internal routing
  audioContext = getSuperdoughContext();

  // Create master analyser that sits between all audio and the speakers
  masterAnalyser = audioContext.createAnalyser();
  masterAnalyser.fftSize = 2048;
  masterAnalyser.smoothingTimeConstant = 0.8;

  // Create intercept node that routes through our analyser
  const interceptGain = audioContext.createGain();
  interceptGain.connect(masterAnalyser);
  masterAnalyser.connect(audioContext.destination);

  // Store reference to our destination for comparison
  const ourDestination = audioContext.destination;

  // Patch AudioNode.prototype.connect to redirect destination connections
  // ONLY for nodes belonging to the SAME audio context (avoid cross-context errors)
  const originalConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(dest, ...args) {
    // Only intercept if destination is our audio context's destination
    // and source node belongs to the same context
    if (dest === ourDestination && this.context === audioContext) {
      return originalConnect.call(this, interceptGain, ...args);
    }
    return originalConnect.call(this, dest, ...args);
  };

  // NOW initialize Strudel - all its audio connections will go through our analyser
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
  // Our master analyser intercepts all audio automatically
  await evaluate(code); // nolint - caller handles errors

  console.log('[Musicman] Pattern started');
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the master analyser for visualizations
 * This analyser captures ALL audio output for waveform/spectrum display
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
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
