/**
 * P5.js Visualization Module
 * Creates instance-mode sketches for audio visualization
 */

import p5 from 'p5';

/**
 * Create a waveform (oscilloscope) visualization
 * @param {string} containerId - DOM element ID to mount the canvas
 * @param {AnalyserNode} analyser - Web Audio AnalyserNode
 * @returns {p5} - The p5 instance
 */
export function createWaveformViz(containerId, analyser) {
  return new p5((p) => {
    const bufferLength = analyser ? analyser.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);

    p.setup = () => {
      const container = document.getElementById(containerId);
      const canvas = p.createCanvas(container.offsetWidth, 80);
      canvas.parent(containerId);
      p.noFill();
    };

    p.draw = () => {
      p.background(20, 20, 30);

      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
      }

      // Draw center line
      p.stroke(60, 60, 80);
      p.strokeWeight(1);
      p.line(0, p.height / 2, p.width, p.height / 2);

      // Draw waveform
      p.stroke(233, 69, 96); // #e94560
      p.strokeWeight(2);
      p.beginShape();
      for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * p.width;
        // Convert 0-255 to centered waveform
        const y = ((dataArray[i] - 128) / 128) * (p.height / 2) + p.height / 2;
        p.vertex(x, y);
      }
      p.endShape();

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
 * @param {AnalyserNode} analyser - Web Audio AnalyserNode
 * @returns {p5} - The p5 instance
 */
export function createSpectrumViz(containerId, analyser) {
  return new p5((p) => {
    const bufferLength = analyser ? analyser.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);
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

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      // Reduce to fewer bars for cleaner visualization
      const barCount = 64;
      const barWidth = p.width / barCount;
      const binSize = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        // Average the frequency bins for this bar
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j];
        }
        const avg = sum / binSize;

        // Smooth the values
        smoothedData[i] = avg * (1 - smoothing) + smoothedData[i] * smoothing;

        const barHeight = (smoothedData[i] / 255) * p.height * 0.9;

        // Color gradient: blue (low) -> red (high)
        const hue = p.map(i, 0, barCount, 200, 0);
        p.fill(hue, 80, 90);
        p.noStroke();
        p.rect(i * barWidth, p.height - barHeight, barWidth - 1, barHeight);
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

      const msPerBeat = 60000 / currentBPM;
      const elapsed = p.millis() - startTime;
      const beatPosition = (elapsed % msPerBeat) / msPerBeat;
      const cyclePosition = (elapsed % (msPerBeat * 4)) / (msPerBeat * 4);

      // Draw 16 step markers
      const steps = 16;
      const stepWidth = p.width / steps;

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

  return sketch;
}

/**
 * Create all visualizations
 * @param {Object} config - Configuration object
 * @param {string} config.waveformId - Container ID for waveform
 * @param {string} config.spectrumId - Container ID for spectrum
 * @param {string} config.beatId - Container ID for beat indicator
 * @param {AnalyserNode} config.analyser - Web Audio AnalyserNode
 * @param {number} config.bpm - Initial BPM
 * @returns {Object} - Object with all visualization instances
 */
export function createAllVisualizations(config) {
  const { waveformId, spectrumId, beatId, analyser, bpm = 120 } = config;

  return {
    waveform: waveformId ? createWaveformViz(waveformId, analyser) : null,
    spectrum: spectrumId ? createSpectrumViz(spectrumId, analyser) : null,
    beat: beatId ? createBeatIndicator(beatId, bpm) : null,
  };
}
