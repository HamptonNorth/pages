// version 1.1
// =============================================================================
// MARKDOWN STYLE REGISTRY
// =============================================================================
// Central registry for all markdown CSS styles. Adding a new style requires:
// 1. Creating a CSS file in /styles/md-styles/ (e.g., md-my-style.css)
// 2. Adding an entry to STYLE_REGISTRY below
// 3. Optionally adding to PAGE_CONFIG env for category defaults
//
// The system will automatically:
// - Load the correct CSS file
// - Apply the correct wrapper class
// - Use appropriate print styles
// =============================================================================

/**
 * STYLE_REGISTRY - Configuration for all available markdown styles
 *
 * Each style entry contains:
 * @property {string} name - The style identifier (matches front matter 'style:' value)
 * @property {string} label - Human-readable display name
 * @property {string} cssFile - Path to the CSS file (relative to /styles/md-styles/)
 * @property {string} wrapperClass - CSS class(es) to apply to the markdown container
 * @property {boolean} removeProse - Whether to remove Tailwind prose classes
 * @property {string} description - Brief description of the style
 */
export const STYLE_REGISTRY = {
  // -------------------------------------------------------------------------
  // DEFAULT: Tailwind Typography (prose) with print optimizations
  // Clean, minimal styling using Tailwind's prose plugin
  // -------------------------------------------------------------------------
  tailwind: {
    name: 'tailwind',
    label: 'Tailwind Prose',
    cssFile: 'md-tailwind.css', // Print-only styles, screen uses Tailwind prose
    wrapperClass: 'prose prose-slate max-w-none',
    removeProse: false,
    description: 'Clean, modern styling using Tailwind Typography',
  },

  // -------------------------------------------------------------------------
  // GITHUB: GitHub-flavored Markdown styling
  // Mimics the look of GitHub README files
  // -------------------------------------------------------------------------
  github: {
    name: 'github',
    label: 'GitHub Style',
    cssFile: 'md-github.css',
    wrapperClass: 'md-github',
    removeProse: true,
    description: 'GitHub README-style markdown rendering',
  },

  // -------------------------------------------------------------------------
  // MCSS GEORGIA: Elegant serif typography
  // Based on Mike Mai's MCSS - classic, readable typography
  // -------------------------------------------------------------------------
  'mcss-georgia': {
    name: 'mcss-georgia',
    label: 'MCSS Georgia',
    cssFile: 'md-mcss-georgia.css',
    wrapperClass: 'md-mcss md-mcss-georgia',
    removeProse: true,
    description: 'Elegant serif typography for long-form reading',
  },

  // -------------------------------------------------------------------------
  // MCSS GEORGIA TIGHT: Compact serif typography (12pt base)
  // Based on MCSS Georgia - denser layout for documentation
  // -------------------------------------------------------------------------
  'mcss-georgia-tight': {
    name: 'mcss-georgia-tight',
    label: 'MCSS Georgia Tight',
    cssFile: 'md-mcss-georgia-tight.css',
    wrapperClass: 'md-mcss md-mcss-georgia-tight',
    removeProse: true,
    description: 'Compact serif typography with 12pt base for denser content',
  },

  // -------------------------------------------------------------------------
  // MCSS VERDANA: Modern sans-serif typography
  // Based on Mike Mai's MCSS - clean, technical documentation style
  // -------------------------------------------------------------------------
  'mcss-verdana': {
    name: 'mcss-verdana',
    label: 'MCSS Verdana',
    cssFile: 'md-mcss-verdana.css',
    wrapperClass: 'md-mcss md-mcss-verdana',
    removeProse: true,
    description: 'Modern sans-serif style for technical documentation',
  },
}

// -------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------

/**
 * Get style configuration by name
 * Falls back to 'tailwind' if style not found
 * @param {string} styleName - The style identifier
 * @returns {Object} Style configuration object
 */
export function getStyleConfig(styleName) {
  const normalizedName = (styleName || 'tailwind').toLowerCase().trim()
  return STYLE_REGISTRY[normalizedName] || STYLE_REGISTRY['tailwind']
}

/**
 * Get all registered style names
 * @returns {string[]} Array of style names
 */
export function getAvailableStyles() {
  return Object.keys(STYLE_REGISTRY)
}

/**
 * Check if a style exists in the registry
 * @param {string} styleName - The style identifier
 * @returns {boolean} True if style exists
 */
export function isValidStyle(styleName) {
  return styleName && STYLE_REGISTRY.hasOwnProperty(styleName.toLowerCase().trim())
}

/**
 * Get the CSS file path for a style
 * @param {string} styleName - The style identifier
 * @returns {string|null} Full path to CSS file, or null for built-in styles
 */
export function getStyleCssPath(styleName) {
  const config = getStyleConfig(styleName)
  return config.cssFile ? `/styles/md-styles/${config.cssFile}` : null
}

/**
 * Build the class list for a markdown container
 * @param {string} styleName - The style identifier
 * @param {string[]} additionalClasses - Any extra classes to include
 * @returns {string} Space-separated class string
 */
export function buildContainerClasses(styleName, additionalClasses = []) {
  const config = getStyleConfig(styleName)
  const classes = [config.wrapperClass, ...additionalClasses]
  return classes.filter((c) => c).join(' ')
}

// -------------------------------------------------------------------------
// DEFAULT EXPORT
// -------------------------------------------------------------------------

export default {
  STYLE_REGISTRY,
  getStyleConfig,
  getAvailableStyles,
  isValidStyle,
  getStyleCssPath,
  buildContainerClasses,
}
