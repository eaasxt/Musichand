/**
 * P5.js Visualization Module
 * Creates instance-mode sketches for audio visualization
 * Uses superdough's analyser system for real-time audio data
 */

import p5 from 'p5';
import { analysers, getAnalyzerData } from 'superdough';

// Analyser IDs matching strudel-player.js
const SPECTRUM_ANALYSER_ID = 1;
const WAVEFORM_ANALYSER_ID = 2;

/**
 * Create a waveform (oscilloscope) visualization
 * @param {string} containerId - DOM element ID to mount the canvas
 * @returns {p5} - The p5 instance
 */
export function createWaveformViz(containerId) {
  return new p5((p) => {
    p.setup = () => {
      const container = document.getElementById(containerId);
      const canvas = p.createCanvas(container.offsetWidth, 80);
      canvas.parent(containerId);
      p.noFill();
    };

    p.draw = () => {
      p.background(20, 20, 30);

      // Draw center line
      p.stroke(60, 60, 80);
      p.strokeWeight(1);
      p.line(0, p.height / 2, p.width, p.height / 2);

      // Get analyser dynamically (may not exist until audio plays)
      const analyser = analysers[WAVEFORM_ANALYSER_ID];

      if (analyser) {
        // Get Float32Array data from superdough (-1 to 1 range)
        const dataArray = getAnalyzerData('time', WAVEFORM_ANALYSER_ID);

        // Draw waveform
        p.stroke(233, 69, 96); // #e94560
        p.strokeWeight(2);
        p.beginShape();
        for (let i = 0; i < dataArray.length; i++) {
          const x = (i / dataArray.length) * p.width;
          // Float32Array values are -1 to 1, convert to screen coords
          const y = (1 - dataArray[i]) * (p.height / 2);
          p.vertex(x, y);
        }
        p.endShape();
      } else {
        // No audio playing - draw flat line
        p.stroke(233, 69, 96, 100);
        p.strokeWeight(2);
        p.line(0, p.height / 2, p.width, p.height / 2);
      }

      // Label
      p.fill(100);
      p.noStroke();
      p.textSize(10);
      p.text('WAVEFORM', 5, 12);
    };

    p.windowResized = () => {
      const container = document.getElementById(containerId);
      if (container) {
        p.resizeCanvas(container.offsetWidth, 80);
      }
    };
  }, containerId);
}

/**
 * Create a frequency spectrum visualization
 * @param {string} containerId - DOM element ID to mount the canvas
 * @returns {p5} - The p5 instance
 */
export function createSpectrumViz(containerId) {
  return new p5((p) => {
    let smoothedData = new Array(64).fill(0);
    const smoothing = 0.7;

    p.setup = () => {
      const container = document.getElementById(containerId);
      const canvas = p.createCanvas(container.offsetWidth, 100);
      canvas.parent(containerId);
      p.colorMode(p.HSB, 360, 100, 100);
    };

    p.draw = () => {
      p.background(20, 20, 30);

      // Get analyser dynamically (may not exist until audio plays)
      const analyser = analysers[SPECTRUM_ANALYSER_ID];

      const barCount = 64;
      const barWidth = p.width / barCount;

      if (analyser) {
        // Get Float32Array frequency data from superdough (dB values, typically -100 to 0)
        const dataArray = getAnalyzerData('frequency', SPECTRUM_ANALYSER_ID);
        const binSize = Math.floor(dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
          // Average the frequency bins for this bar
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            const idx = i * binSize + j;
            if (idx < dataArray.length) {
              // Convert dB to linear (0-1 range)
              // dB values typically range from -100 to 0
              const db = dataArray[idx];
              const normalized = Math.max(0, (db + 100) / 100);
              sum += normalized;
            }
          }
          const avg = sum / binSize;

          // Smooth the values
          smoothedData[i] = avg * (1 - smoothing) + smoothedData[i] * smoothing;

          const barHeight = smoothedData[i] * p.height * 0.9;

          // Color gradient: blue (low) -> red (high)
          const hue = p.map(i, 0, barCount, 200, 0);
          p.fill(hue, 80, 90);
          p.noStroke();
          p.rect(i * barWidth, p.height - barHeight, barWidth - 1, barHeight);
        }
      } else {
        // No audio - draw empty bars
        for (let i = 0; i < barCount; i++) {
          smoothedData[i] *= 0.95; // Fade out
          const barHeight = smoothedData[i] * p.height * 0.9;
          const hue = p.map(i, 0, barCount, 200, 0);
          p.fill(hue, 80, 90);
          p.noStroke();
          p.rect(i * barWidth, p.height - barHeight, barWidth - 1, barHeight);
        }
      }

      // Label
      p.fill(100);
      p.textSize(10);
      p.text('SPECTRUM', 5, 12);
    };

    p.windowResized = () => {
      const container = document.getElementById(containerId);
      if (container) {
        p.resizeCanvas(container.offsetWidth, 100);
      }
    };
  }, containerId);
}

/**
 * Create a beat indicator visualization
 * @param {string} containerId - DOM element ID to mount the canvas
 * @param {number} bpm - Beats per minute
 * @returns {p5} - The p5 instance with setBPM method
 */
export function createBeatIndicator(containerId, bpm = 120) {
  let currentBPM = bpm;
  let isPlaying = false;

  const sketch = new p5((p) => {
    let startTime = 0;

    p.setup = () => {
      const container = document.getElementById(containerId);
      const canvas = p.createCanvas(container.offsetWidth, 40);
      canvas.parent(containerId);
      startTime = p.millis();
    };

    p.draw = () => {
      p.background(20, 20, 30);

      // Check if audio is actually playing by looking for analyser
      const analyser = analysers[WAVEFORM_ANALYSER_ID];
      const hasAudio = analyser && isPlaying;

      const steps = 16;
      const stepWidth = p.width / steps;

      if (hasAudio) {
        const msPerBeat = 60000 / currentBPM;
        const elapsed = p.millis() - startTime;
        const cyclePosition = (elapsed % (msPerBeat * 4)) / (msPerBeat * 4);

        // Draw 16 step markers - animated when playing
        for (let i = 0; i < steps; i++) {
          const x = i * stepWidth + stepWidth / 2;
          const isDownbeat = i % 4 === 0;
          const isCurrentStep = Math.floor(cyclePosition * 16) === i;

          if (isCurrentStep) {
            // Active step - bright
            p.fill(233, 69, 96);
            p.circle(x, p.height / 2, isDownbeat ? 16 : 12);
          } else if (isDownbeat) {
            // Downbeat marker
            p.fill(80, 80, 100);
            p.circle(x, p.height / 2, 10);
          } else {
            // Regular step
            p.fill(50, 50, 60);
            p.circle(x, p.height / 2, 6);
          }
        }
      } else {
        // Not playing - draw static dim markers
        for (let i = 0; i < steps; i++) {
          const x = i * stepWidth + stepWidth / 2;
          const isDownbeat = i % 4 === 0;
          p.fill(isDownbeat ? 60 : 40, isDownbeat ? 60 : 40, isDownbeat ? 70 : 50);
          p.circle(x, p.height / 2, isDownbeat ? 8 : 5);
        }
      }

      // BPM display
      p.fill(150);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(`${Math.round(currentBPM)} BPM`, p.width - 10, p.height / 2);
      p.textAlign(p.LEFT, p.TOP);

      // Label
      p.fill(100);
      p.textSize(10);
      p.text('BEAT', 5, 5);
    };

    p.windowResized = () => {
      const container = document.getElementById(containerId);
      if (container) {
        p.resizeCanvas(container.offsetWidth, 40);
      }
    };
  }, containerId);

  // Add setBPM method to the sketch
  sketch.setBPM = (newBPM) => {
    currentBPM = newBPM;
  };

  // Add setPlaying method to control animation
  sketch.setPlaying = (playing) => {
    isPlaying = playing;
  };

  return sketch;
}

/**
 * Create all visualizations
 * Analysers are obtained dynamically from superdough after audio starts
 * @param {Object} config - Configuration object
 * @param {string} config.waveformId - Container ID for waveform
 * @param {string} config.spectrumId - Container ID for spectrum
 * @param {string} config.beatId - Container ID for beat indicator
 * @param {number} config.bpm - Initial BPM
 * @returns {Object} - Object with all visualization instances
 */
export function createAllVisualizations(config) {
  const { waveformId, spectrumId, beatId, bpm = 120 } = config;

  return {
    waveform: waveformId ? createWaveformViz(waveformId) : null,
    spectrum: spectrumId ? createSpectrumViz(spectrumId) : null,
    beat: beatId ? createBeatIndicator(beatId, bpm) : null,
  };
}
