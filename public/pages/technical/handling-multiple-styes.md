---
title: Handling multiple CSS styles for markdown
summary: Notes for handling multiple CSS styles for pages content written in markdown.
created: 2025-12-26
published: y
file-type: markdown
style: github
private: rcollins@redmug.co.uk
---
# Extensible Markdown Styles System

**Version 1.0** | Claude Opus 4.5

## Overview

This system provides an extensible architecture for applying different CSS styles to markdown content. Adding a new style requires only:

1. Creating a CSS file
2. Adding an entry to the style registry
3. (Optional) Setting it as the default for categories in your `.env`

## Quick Start

### 1. Configure Categories (`.env`)

```bash
# New JSON format - map categories to styles and sidebar settings
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia","docs":"mcss-verdana"}'
```

### 2. Override Style in Front Matter

Individual markdown files can override the category default:

```yaml
---
title: My Document
style: mcss-georgia
---
```

## Available Styles

| Style Name | Description | Best For |
|------------|-------------|----------|
| `tailwind` | Clean, modern Tailwind Typography | General content (default) |
| `github` | GitHub README-style rendering | Technical docs, READMEs |
| `mcss-georgia` | Elegant serif typography | Long-form reading, essays |
| `mcss-georgia-tight` | Compact serif (12pt base) | Dense content, documentation |
| `mcss-verdana` | Modern sans-serif | Technical documentation |

## Style Priority

Styles are determined in this order (highest priority first):

1. **Front matter `style:` key** - Set per-document
2. **Category default** - From `PAGE_CONFIG` in `.env`
3. **Tailwind** - Fallback default

## Adding a New Style

### Step 1: Create the CSS File

Create `/public/styles/md-styles/md-your-style.css`:

```css
/* version 1.0 Claude Opus 4.5 */
/* =============================================================================
 * YOUR STYLE NAME
 * ============================================================================= */

/* Screen styles */
.md-your-style {
  font-family: 'Your Font', sans-serif;
  /* ... your styles ... */
}

/* Print styles - A4 optimized */
@media print {
  .md-your-style {
    font-size: 11pt;
    /* ... print overrides ... */
  }
}

@page {
  size: A4;
  margin: 2cm 2.5cm;
}
```

### Step 2: Add to Style Registry

In `server.js`, add to `STYLE_REGISTRY`:

```javascript
const STYLE_REGISTRY = {
  // ... existing styles ...

  'your-style': {
    name: 'your-style',
    label: 'Your Style Name',
    cssFile: 'md-your-style.css',
    wrapperClass: 'md-your-style',
    removeProse: true, // Remove Tailwind prose classes?
    description: 'Description of your style',
  },
}
```

### Step 3: Use Your Style

**In `.env`:**
```bash
PAGE_CONFIG='{"my-category":"your-style"}'
```

**In front matter:**
```yaml
---
title: My Document
style: your-style
---
```

That's it! The system will automatically:
- Load the CSS file when needed
- Apply the correct wrapper classes
- Use the style's print layout

## File Structure

```
public/
├── styles/
│   └── md-styles/
│       ├── style-registry.js    # Style configuration (client-side)
│       ├── md-github.css        # GitHub markdown style
│       ├── md-mcss-base.css     # Shared MCSS base styles
│       ├── md-mcss-georgia.css  # MCSS Georgia variant
│       └── md-mcss-verdana.css  # MCSS Verdana variant
├── views/
│   └── page-detail.html         # Updated page template
└── ...

server.js                        # Contains STYLE_REGISTRY
```

## API Endpoints

### GET `/api/pages-config`

Returns category configuration including style information:

```json
[
  {
    "name": "start",
    "style": "github",
    "styleConfig": { ... },
    "sidebar": false
  },
  {
    "name": "technical",
    "style": "github",
    "styleConfig": { ... },
    "sidebar": true
  }
]
```

### GET `/api/styles-config`

Returns all available styles:

```json
{
  "styles": {
    "tailwind": { ... },
    "github": { ... },
    "mcss-georgia": { ... },
    "mcss-verdana": { ... }
  },
  "available": ["tailwind", "github", "mcss-georgia", "mcss-verdana"]
}
```

### GET `/api/pages/content/:category/:slug`

Response now includes style information:

```json
{
  "meta": { ... },
  "html": "...",
  "style": {
    "name": "github",
    "cssFile": "md-github.css",
    "wrapperClass": "md-github",
    "removeProse": true
  }
}
```

## Style Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique identifier (used in front matter/config) |
| `label` | string | Human-readable display name |
| `cssFile` | string\|null | CSS filename in `/styles/md-styles/` (null for built-in) |
| `wrapperClass` | string | CSS class(es) to apply to container |
| `removeProse` | boolean | Whether to remove Tailwind prose classes |
| `description` | string | Brief description of the style |

## Print Support

All styles include A4 print optimization with:

- Clean page margins (2-2.5cm)
- Hidden navigation/UI elements
- Optimized font sizes for print
- Page break control
- Link URL display
- Code block wrapping

To print, use the Print button or `Ctrl/Cmd + P`.

## Migration from Old Format

### Old Format (`.env`)
```bash
PAGES="start,technical:sidebar,rants"
```

### New Format (`.env`)
```bash
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia"}'
```

The old `PAGES` format is still supported for backwards compatibility but defaults all categories to `tailwind` style.

## MCSS Credits

The MCSS Georgia and Verdana styles are based on [Mike Mai's MCSS](https://github.com/mikemai2awesome/mcss) - a classless CSS framework for beautiful typography.

## Troubleshooting

### Style not applying?

1. Check the style name matches exactly (case-sensitive)
2. Verify the CSS file exists in `/public/styles/md-styles/`
3. Check browser console for CSS loading errors
4. Ensure `PAGE_CONFIG` is valid JSON

### Print layout issues?

1. Each style has its own `@media print` rules
2. Check browser print preview
3. Some browsers handle print differently - test in Chrome for best results

### Want to customize an existing style?

Create a copy with a new name rather than modifying the original:

```css
/* md-github-custom.css */
@import url('./md-github.css');

.md-github-custom {
  /* Your overrides */
}
```

Then add it to the registry as a new style.

### Example .env 

```text

# =============================================================================
# EXAMPLE .env FILE - Extensible Markdown Styles Configuration
# =============================================================================
# version 1.0 Claude Opus 4.5

# =============================================================================
# PAGE_CONFIG - Category to Style Mapping (NEW FORMAT - Recommended)
# =============================================================================
# 
# Format: JSON object where:
#   - Key: category name (folder name in /public/pages/)
#   - Value: "style" or "style:sidebar"
#
# Available styles:
#   - tailwind           : Clean Tailwind Typography (default)
#   - github             : GitHub README-style rendering
#   - mcss-georgia       : Elegant serif typography for reading
#   - mcss-georgia-tight : Compact serif (12pt base) for dense content
#   - mcss-verdana       : Modern sans-serif for technical docs
#
# Examples:
# ---------

# Basic usage - category with default style
# PAGE_CONFIG='{"blog":"tailwind"}'

# Category with sidebar enabled
# PAGE_CONFIG='{"docs":"github:sidebar"}'

# Multiple categories with different styles
# PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia","docs":"mcss-verdana"}'

# Full example with all style types:
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","blog":"mcss-georgia","documentation":"mcss-verdana","notes":"tailwind"}'

# =============================================================================
# LEGACY FORMAT (Still Supported - Backwards Compatible)
# =============================================================================
# 
# If you prefer the old format, it still works but defaults all styles to 'tailwind':
# PAGES="start,technical:sidebar,rants"
#
# Note: If both PAGE_CONFIG and PAGES are set, PAGE_CONFIG takes priority.

# =============================================================================
# OTHER SETTINGS
# =============================================================================

PORT=3000

# Database
DATABASE_URL="file:./data.db"

# Authentication
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Temporary password expiry (hours)
TEMP_PASSWORD_LAPSE_HOURS=48

# =============================================================================
# STYLE QUICK REFERENCE
# =============================================================================
#
# | Style              | Best For                          | Print Optimized |
# |--------------------|-----------------------------------|-----------------|
# | tailwind           | General content, modern look      | Yes (A4)        |
# | github             | READMEs, technical docs           | Yes (A4)        |
# | mcss-georgia       | Essays, long-form reading         | Yes (A4)        |
# | mcss-georgia-tight | Dense content, compact docs       | Yes (A4, 12pt)  |
# | mcss-verdana       | Technical docs, code-heavy        | Yes (A4)        |
#
# Individual pages can override the category style using front matter:
#
#   ---
#   title: My Special Document
#   style: mcss-georgia
#   ---
#
# Front matter 'style:' takes priority over PAGE_CONFIG defaults.

```
