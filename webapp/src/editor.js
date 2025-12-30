/**
 * CodeMirror Editor Module
 * Provides a syntax-highlighted code editor for Strudel patterns
 */

import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

/**
 * Create a CodeMirror editor instance
 * @param {string} containerId - DOM element ID to mount the editor
 * @param {Object} options - Configuration options
 * @param {Function} options.onEvaluate - Callback when Ctrl+Enter is pressed
 * @param {Function} options.onChange - Callback when content changes
 * @param {string} options.initialCode - Initial code to display
 * @returns {Object} - Editor API with getCode, setCode methods
 */
export function createEditor(containerId, options = {}) {
  const { onEvaluate, onChange, initialCode = '' } = options;
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Container element '${containerId}' not found`);
  }

  // Custom keymap for Ctrl+Enter evaluation
  const evalKeymap = keymap.of([
    {
      key: 'Ctrl-Enter',
      mac: 'Cmd-Enter',
      run: () => {
        if (onEvaluate) {
          onEvaluate();
        }
        return true;
      },
    },
    {
      key: 'Ctrl-.',
      mac: 'Cmd-.',
      run: () => {
        // Stop playback shortcut
        if (options.onStop) {
          options.onStop();
        }
        return true;
      },
    },
  ]);

  // Update listener for onChange callback
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && onChange) {
      onChange(update.state.doc.toString());
    }
  });

  // Custom theme adjustments to match Musicman dark theme
  const customTheme = EditorView.theme({
    '&': {
      height: '300px',
      fontSize: '14px',
      backgroundColor: '#1a1a2e',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    '.cm-content': {
      padding: '10px 0',
    },
    '.cm-gutters': {
      backgroundColor: '#16213e',
      borderRight: '1px solid #2a2a4a',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1a1a2e',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    '&.cm-focused': {
      outline: '2px solid #e94560',
    },
  });

  // Create the editor
  const view = new EditorView({
    state: EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        customTheme,
        evalKeymap,
        updateListener,
        EditorView.lineWrapping,
      ],
    }),
    parent: container,
  });

  // Return the editor API
  return {
    /**
     * Get the current code content
     * @returns {string}
     */
    getCode() {
      return view.state.doc.toString();
    },

    /**
     * Set the code content
     * @param {string} code - New code to display
     */
    setCode(code) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: code,
        },
      });
    },

    /**
     * Focus the editor
     */
    focus() {
      view.focus();
    },

    /**
     * Get the underlying EditorView instance
     * @returns {EditorView}
     */
    getView() {
      return view;
    },

    /**
     * Destroy the editor
     */
    destroy() {
      view.destroy();
    },
  };
}

/**
 * Default code shown when no composition is loaded
 */
export const DEFAULT_CODE = `// Welcome to Musicman Composer!
// Press Ctrl+Enter (or Cmd+Enter on Mac) to play
// Press Ctrl+. (or Cmd+.) to stop

setcpm(120)

stack(
  // Drums
  s("bd*4, ~ sd ~ sd, hh*8")
    .bank("RolandTR909")
    .gain(0.8),

  // Bass
  n("0 0 3 5")
    .scale("C2:minor")
    .s("sawtooth")
    .lpf(400)
    .gain(0.6),

  // Chords
  chord("<Cm7 Fm7 Gm7 Cm7>")
    .voicing()
    .s("gm_epiano1")
    .room(0.4)
    .gain(0.5)
    .slow(2)
)
`;
