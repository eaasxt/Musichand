/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import {
  getAudioContext as getSuperdoughContext,
  analysers,
} from 'superdough';

let initialized = false;
let audioContext = null;

// Analyzer ID used for all patterns
const ANALYZER_ID = 'musicman';

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

  // Get the audio context that superdough created
  audioContext = getSuperdoughContext();

  console.log('[Musicman] Strudel initialized');

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

  // Wrap the code to add .analyze() for visualization
  // This injects analyze at the end of the pattern chain
  const wrappedCode = wrapCodeWithAnalyze(code, ANALYZER_ID);

  // Evaluate the wrapped Strudel code
  await evaluate(wrappedCode); // nolint - caller handles errors

  console.log('[Musicman] Pattern started with analyzer:', ANALYZER_ID);
}

/**
 * Wrap Strudel code to add .analyze() for visualization
 * @param {string} code - Original Strudel code
 * @param {string} analyzerId - The analyzer ID to use
 * @returns {string} - Modified code with .analyze() added
 */
function wrapCodeWithAnalyze(code, analyzerId) {
  // Strategy: Find the last closing paren/bracket of the main pattern
  // and insert .analyze() before any trailing content

  // First, check if the code already has .analyze()
  if (code.includes('.analyze(')) {
    return code;
  }

  // Find the main pattern - usually ends with a closing paren
  // We need to find the last ) that's part of the pattern, not a comment
  const lines = code.split('\n');
  const codeLines = [];
  const trailingLines = [];

  let foundEnd = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments at the end
    if (!foundEnd && (trimmed === '' || trimmed.startsWith('//'))) {
      trailingLines.unshift(line);
      continue;
    }

    foundEnd = true;
    codeLines.unshift(line);
  }

  // Join code lines and add .analyze() at the end
  let codeBlock = codeLines.join('\n');

  // Find the last ) and add .analyze() after it
  const lastParen = codeBlock.lastIndexOf(')');
  if (lastParen !== -1) {
    codeBlock = codeBlock.slice(0, lastParen + 1) +
                `.analyze("${analyzerId}").fft(6)` +
                codeBlock.slice(lastParen + 1);
  }

  return codeBlock + '\n' + trailingLines.join('\n');
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the analyser for visualizations
 * Uses superdough's built-in analyzer system
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
  // Get the analyser from superdough's analysers map
  const analyser = analysers[ANALYZER_ID];

  // Debug: periodically check if we're getting data
  if (analyser && Math.random() < 0.005) {
    const testData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(testData);
    const hasSignal = testData.some(v => Math.abs(v) > 0.001);
    console.log('[Musicman] Analyzer check - has signal:', hasSignal, 'bins:', analyser.frequencyBinCount);
  }

  return analyser;
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
