/**
 * Strudel Player Module
 * Wraps @strudel/web for embedded playback with audio analysis
 */

import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import { getAudioContext as getSuperdoughContext, getAnalyserById } from 'superdough';

let initialized = false;
let audioContext = null;

// Use superdough's native analyser system
const ANALYZER_ID = 'musicman';

/**
 * Initialize Strudel and audio analysis
 */
export async function init() {
  if (initialized) return;

  // Initialize Strudel with sample banks
  await initStrudel({
    prebake: () =>
      samples('github:tidalcycles/Dirt-Samples/master'),
  });

  // Get the audio context
  audioContext = getSuperdoughContext();
  console.log('[Musicman] Strudel initialized, audio context state:', audioContext.state);

  initialized = true;
}

/**
 * Wrap Strudel code to add .analyze() for visualization
 */
function wrapCodeWithAnalyze(code) {
  // Don't wrap if already has .analyze()
  if (code.includes('.analyze(')) {
    return code;
  }

  // Find the last ) of the main pattern and insert .analyze()
  const lines = code.split('\n');
  const codeLines = [];
  const trailingLines = [];

  let foundEnd = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!foundEnd && (trimmed === '' || trimmed.startsWith('//'))) {
      trailingLines.unshift(line);
      continue;
    }
    foundEnd = true;
    codeLines.unshift(line);
  }

  let codeBlock = codeLines.join('\n');
  const lastParen = codeBlock.lastIndexOf(')');
  if (lastParen !== -1) {
    codeBlock = codeBlock.slice(0, lastParen + 1) +
                `.analyze("${ANALYZER_ID}")` +
                codeBlock.slice(lastParen + 1);
  }

  return codeBlock + '\n' + trailingLines.join('\n');
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

  // Wrap code with .analyze() to enable visualization
  const wrappedCode = wrapCodeWithAnalyze(code);

  // Evaluate the Strudel code
  await evaluate(wrappedCode); // nolint - caller handles errors

  console.log('[Musicman] Pattern started with analyzer:', ANALYZER_ID);
}

/**
 * Stop all playing patterns
 */
export function stop() {
  hush();
}

/**
 * Get the analyser for visualizations
 * Uses superdough's native analyser created by .analyze() in patterns
 * @returns {AnalyserNode|null}
 */
export function getAnalyser() {
  try {
    // Get superdough's analyser - it's created when pattern events with .analyze() play
    const analyser = getAnalyserById(ANALYZER_ID, 2048, 0.8);

    // Debug: check if analyser has data
    if (analyser && Math.random() < 0.01) {
      const testData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatTimeDomainData(testData);
      const maxVal = Math.max(...testData.map(Math.abs));
      console.log('[Musicman] Analyser check - bins:', analyser.frequencyBinCount, 'maxVal:', maxVal.toFixed(4));
    }

    return analyser;
  } catch (e) {
    // Analyser not ready yet
    return null;
  }
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
