// version 17.1 Claude Opus 4.5
// =============================================================================
// CHANGES from v17.1:
// - FIX: Spellcheck API now uses spellCheckDocument + createTextDocument
//        (spellCheckText never existed in cspell-lib)
// - FIX: Added missing 'marked' import for markdown parsing
// - FIX: Moved spellcheck routes BEFORE /api/ catch-all (routes were unreachable)
//
// CHANGES from v17.0:
// - NEW: Full-text search across all markdown pages using SQLite FTS5
// - NEW: POST /api/pages/reindex - Rebuild search index (admin only)
// - NEW: GET /api/pages/search?q=query - Search pages with weighted scoring
// - NEW: GET /api/pages/search-meta - Get index metadata (admin only)
// - NEW: Weighted search scoring (title=10, h1=6, body=1, etc.)
// - NEW: Prefix matching (left-to-right, word-start, case-insensitive)
// - NEW: Access control in search (unpublished for admin, private by email)
//
// CHANGES from v16.2:
// - Added md-tailwind.css for print-specific styling (tighter vertical spacing)
// - Tailwind style now loads CSS file for print optimization
//
// CHANGES from v16.1:
// - Added mcss-georgia-tight style (12pt base, compact typography)
//
// CHANGES from v16.0:
// - NEW: PAGE_CONFIG env variable replaces PAGES for category configuration
// - NEW: JSON format for category->style->sidebar mapping
// - NEW: Extensible style system via style-registry.js
// - NEW: Style config exposed via /api/pages-config and /api/styles-config
// - NEW: Dynamic style class application in SSR
// - DEPRECATED: Old PAGES env format (still supported for backwards compat)
//
// PAGE_CONFIG Format:
// PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia"}'
// Format: {"category":"style[:sidebar]", ...}
//
// CHANGES from v15.0:
// - Added POST /api/pages/upload/:category - Upload markdown files (admin only)
// - Added POST /api/media/upload/:category - Upload image files (admin only)
// - Auto-adds default front matter to uploaded .md files without front matter
// - Always sets published: n on uploaded .md files to force review
//
// CHANGES from v14.5:
// - Added GET /api/pages/raw/:category/:slug - Returns raw markdown content (admin only)
// - Added PUT /api/pages/raw/:category/:slug - Saves markdown content (admin only)
// - Refactored route handling for clarity
//
import { auth } from './auth.js'
import { db } from './db-setup.js'
import { handleApiRoutes } from './routes/api.js'
import { readdir, watch } from 'node:fs/promises'
import { marked } from 'marked'

// =============================================================================
// SEARCH SERVICE IMPORT
// =============================================================================
import {
  initSearchIndex,
  reindexAllPages,
  searchPages,
  getSearchMeta,
} from './services/pages-search.js'

// =============================================================================
// Spellcheck
// =============================================================================
import * as cspell from 'cspell-lib'

// Destructure the correct functions from cspell-lib
// Note: spellCheckText doesn't exist - use spellCheckDocument with createTextDocument
const { spellCheckDocument, createTextDocument, readSettings, mergeSettings } = cspell

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export { db }

// Initialize Custom Dictionary Table
db.run(`
  CREATE TABLE IF NOT EXISTS custom_dictionary (
    word TEXT PRIMARY KEY,
    added_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const PORT = process.env.PORT || 3000

// =============================================================================
// INITIALIZE SEARCH INDEX
// =============================================================================
// Creates FTS5 tables if they don't exist
initSearchIndex(db)

// =============================================================================
// STYLE REGISTRY - Extensible markdown style configuration
// =============================================================================
// To add a new style:
// 1. Create CSS file in /public/styles/md-styles/
// 2. Add entry to STYLE_REGISTRY
// 3. Use style name in PAGE_CONFIG or front matter
// =============================================================================

const STYLE_REGISTRY = {
  // Default: Tailwind Typography (prose) with print optimizations
  tailwind: {
    name: 'tailwind',
    label: 'Tailwind Prose',
    cssFile: 'md-tailwind.css', // Print-only styles, screen uses Tailwind prose
    wrapperClass: 'prose prose-slate max-w-none',
    removeProse: false,
    description: 'Clean, modern styling using Tailwind Typography',
  },

  // GitHub-flavored Markdown styling
  github: {
    name: 'github',
    label: 'GitHub Style',
    cssFile: 'md-github.css',
    wrapperClass: 'md-github',
    removeProse: true,
    description: 'GitHub README-style markdown rendering',
  },

  // MCSS Georgia: Elegant serif typography
  'mcss-georgia': {
    name: 'mcss-georgia',
    label: 'MCSS Georgia',
    cssFile: 'md-mcss-georgia.css',
    wrapperClass: 'md-mcss md-mcss-georgia',
    removeProse: true,
    description: 'Elegant serif typography for long-form reading',
  },

  // MCSS Verdana: Modern sans-serif typography
  'mcss-verdana': {
    name: 'mcss-verdana',
    label: 'MCSS Verdana',
    cssFile: 'md-mcss-verdana.css',
    wrapperClass: 'md-mcss md-mcss-verdana',
    removeProse: true,
    description: 'Modern sans-serif style for technical documentation',
  },

  // MCSS Georgia Tight: Compact serif typography (12pt base)
  'mcss-georgia-tight': {
    name: 'mcss-georgia-tight',
    label: 'MCSS Georgia Tight',
    cssFile: 'md-mcss-georgia-tight.css',
    wrapperClass: 'md-mcss md-mcss-georgia-tight',
    removeProse: true,
    description: 'Compact serif typography with 12pt base for denser content',
  },
}

/**
 * Get style configuration by name
 * Falls back to 'tailwind' if style not found
 */
function getStyleConfig(styleName) {
  const normalizedName = (styleName || 'tailwind').toLowerCase().trim()
  return STYLE_REGISTRY[normalizedName] || STYLE_REGISTRY['tailwind']
}

/**
 * Get all registered style names
 */
function getAvailableStyles() {
  return Object.keys(STYLE_REGISTRY)
}

// --- BUILD STEP (Client Components Only) ---
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.TEMP_PASSWORD_LAPSE_HOURS': JSON.stringify(
      process.env.TEMP_PASSWORD_LAPSE_HOURS || '48',
    ),
    APP_VERSION: JSON.stringify(process.env.VERSION || '0.0.0'),
  },
})
if (!buildResult.success) console.error('Build failed:', buildResult.logs)

// --- HOT RELOAD WATCHER ---
const clients = new Set()
const pagesWatcher = watch('./public/pages', { recursive: true })
;(async () => {
  try {
    for await (const event of pagesWatcher) {
      const filename = event.filename
      if (!filename) continue
      for (const controller of clients) controller.enqueue(`data: reload\n\n`)
    }
  } catch (e) {}
})()

// --- SERVER ---
//

const server = Bun.serve({
  port: PORT,
  idleTimeout: 255,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // UPDATED: Pass both /api/auth and /api/admin to the better-auth handler
    // This allows the admin plugin to handle the list-users request
    if (path.startsWith('/api/auth') || path.startsWith('/api/admin')) return auth.handler(req)

    if (path === '/api/hot-reload') {
      return new Response(
        new ReadableStream({
          start(c) {
            clients.add(c)
          },
          cancel(c) {
            clients.delete(c)
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        },
      )
    }

    // =========================================================================
    // CONFIGURATION API ENDPOINTS
    // =========================================================================

    if (path === '/api/pages-config') {
      return Response.json(getPagesConfig())
    }

    if (path === '/api/styles-config') {
      return Response.json({
        styles: STYLE_REGISTRY,
        available: getAvailableStyles(),
      })
    }

    // =========================================================================
    // SEARCH API ENDPOINTS
    // GET /api/pages/search?q=query - Search across all pages
    // POST /api/pages/reindex - Rebuild search index (admin only)
    // GET /api/pages/search-meta - Get index metadata (admin only)
    // =========================================================================

    if (path === '/api/pages/search' && req.method === 'GET') {
      return handlePagesSearch(req, url)
    }

    if (path === '/api/pages/reindex' && req.method === 'POST') {
      return handlePagesReindex(req)
    }

    if (path === '/api/pages/search-meta' && req.method === 'GET') {
      return handleSearchMeta(req)
    }

    // =========================================================================
    // RAW MARKDOWN API ENDPOINTS (for editor)
    // GET /api/pages/raw/:category/:slug - Get raw markdown content
    // PUT /api/pages/raw/:category/:slug - Save markdown content
    // =========================================================================
    if (path.startsWith('/api/pages/raw/')) {
      if (req.method === 'GET') {
        return handleGetRawMarkdown(req, path)
      }
      if (req.method === 'PUT') {
        return handleSaveRawMarkdown(req, path)
      }
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // =========================================================================
    // FILE UPLOAD ENDPOINTS
    // POST /api/pages/upload/:category - Upload markdown file
    // POST /api/media/upload/:category - Upload image file
    // =========================================================================
    if (path.startsWith('/api/pages/upload/') && req.method === 'POST') {
      return handleMarkdownUpload(req, path)
    }
    if (path.startsWith('/api/media/upload/') && req.method === 'POST') {
      return handleMediaUpload(req, path)
    }

    if (path.startsWith('/api/pages/list/')) return handlePagesList(req, path)
    if (path.startsWith('/api/pages/content/')) return handlePageContent(req, path)

    // =========================================================================
    // SPELLCHECK API ENDPOINTS (must be before /api/ catch-all)
    // =========================================================================
    if (path === '/api/spellcheck' && req.method === 'POST') {
      return handleSpellCheck(req)
    }
    if (path === '/api/dictionary/add' && req.method === 'POST') {
      return handleAddtoDictionary(req)
    }

    // Catch-all for other /api/ routes
    if (path.startsWith('/api/')) return handleApiRoutes(req, path)

    if (path === '/components/client-components.js')
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: { 'Content-Type': 'text/javascript' },
      })

    if (
      path.startsWith('/styles/') ||
      path.startsWith('/scripts/') ||
      path.startsWith('/media/') ||
      path.startsWith('/docs/')
    )
      return serveStatic(path)

    if (path === '/favicon.ico')
      return new Response(Bun.file('./favicon.ico'), {
        headers: { 'Content-Type': 'image/x-icon' },
      })

    if (path === '/') return serveHtmlPage('./public/index.html')

    // --- PAGE VIEWS with SSR ---
    if (path.startsWith('/pages/')) {
      const parts = path.split('/').filter((p) => p.length > 0)
      if (parts.length === 2) return serveHtmlPage('./public/views/pages-list.html')
      if (parts.length === 3) return servePageDetailSSR(req, parts[1], parts[2])
    }

    return serveHtmlPage('./public/views' + path)
  },
})

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Parse PAGE_CONFIG environment variable
 *
 * Supports two formats:
 *
 * NEW FORMAT (recommended):
 * PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia"}'
 *
 * LEGACY FORMAT (backwards compatible):
 * PAGES="start,technical:sidebar,rants"
 *
 * Returns array of: { name, style, sidebar }
 */
function getPagesConfig() {
  // Try new JSON format first
  const pageConfig = process.env.PAGE_CONFIG
  if (pageConfig) {
    try {
      const config = JSON.parse(pageConfig)
      return Object.entries(config).map(([name, value]) => {
        // Value can be "style" or "style:sidebar"
        const parts = value.split(':')
        const style = parts[0].trim()
        const sidebar = parts.length > 1 && parts[1].trim() === 'sidebar'

        // Get full style config
        const styleConfig = getStyleConfig(style)

        return {
          name: name.trim(),
          style: styleConfig.name,
          styleConfig: styleConfig,
          sidebar: sidebar,
        }
      })
    } catch (e) {
      console.error('Error parsing PAGE_CONFIG:', e.message)
      // Fall through to legacy format
    }
  }

  // Legacy format: PAGES="start,technical:sidebar,rants"
  const pagesEnv = process.env.PAGES || ''
  return pagesEnv
    .split(',')
    .map((c) => {
      const t = c.trim()
      if (!t) return null
      const p = t.split(':')
      const name = p[0].trim()
      const sidebar = p.length > 1 && p[1].trim() === 'sidebar'

      // Legacy format defaults to 'tailwind' style
      const styleConfig = getStyleConfig('tailwind')

      return {
        name: name,
        style: styleConfig.name,
        styleConfig: styleConfig,
        sidebar: sidebar,
      }
    })
    .filter((c) => c !== null)
}

/**
 * Get the style for a specific category
 * Checks PAGE_CONFIG first, then falls back to default
 */
function getCategoryStyle(category) {
  const config = getPagesConfig()
  const categoryConfig = config.find((c) => c.name === category)
  return categoryConfig ? categoryConfig.styleConfig : getStyleConfig('tailwind')
}

function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { attributes: {}, body: text }
  const attributes = {}
  const yamlLines = match[1].split('\n')
  yamlLines.forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      attributes[key] = value
    }
  })
  const body = text.replace(match[0], '').trim()
  return { attributes, body }
}

/**
 * POST /api/spellcheck
 * Runs CSpell against provided text using .cspell.json + SQLite words
 */
// version 18.3 Gemini 2.0 Flash
// version 18.3 Gemini 3 Flash
// version 18.4 Gemini 3 Flash
// [Add imports for path/url at the top]

// version 18.4 Gemini 3 Flash
// =============================================================================
// Spellcheck Handler with Absolute Pathing and Isolation Logging
// =============================================================================
async function handleSpellCheck(req) {
  // Wrap everything in try-catch including auth
  try {
    console.log('[Spellcheck] Handler called')

    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { text } = await req.json()
    console.log('[Spellcheck] Input received, length:', text?.length)

    // Verify imports are valid
    if (typeof createTextDocument !== 'function') {
      throw new Error('createTextDocument is not a function - cspell-lib import failed')
    }
    if (typeof spellCheckDocument !== 'function') {
      throw new Error('spellCheckDocument is not a function - cspell-lib import failed')
    }

    // Use process.cwd() to ensure we find .cspell.json regardless of entry point
    const configPath = join(process.cwd(), '.cspell.json')
    console.log('[Spellcheck] Loading config from:', configPath)

    const baseConfig = await readSettings(configPath)
    console.log('[Spellcheck] Settings loaded successfully')

    const sqliteWords = db
      .query('SELECT word FROM custom_dictionary')
      .all()
      .map((r) => r.word)
    console.log('[Spellcheck] Custom words retrieved from SQLite:', sqliteWords.length)

    const finalConfig = mergeSettings(baseConfig, {
      words: sqliteWords,
    })

    console.log('[Spellcheck] Starting engine...')

    // Create a text document for spellCheckDocument (spellCheckText doesn't exist)
    const doc = createTextDocument({ uri: 'editor.md', content: text })
    console.log('[Spellcheck] Document created')

    const result = await spellCheckDocument(doc, {}, finalConfig)
    console.log('[Spellcheck] Engine finished. Issues found:', result.issues.length)

    const errors = result.issues.map((issue) => ({
      word: issue.text,
      offset: issue.offset,
      length: issue.text.length,
    }))

    return Response.json({ errors })
  } catch (err) {
    // Log the full stack trace to the terminal for debugging
    console.error('--- SPELLCHECK CRITICAL ERROR ---')
    console.error('Message:', err.message)
    console.error('Stack:', err.stack)
    console.error('---------------------------------')

    // Return JSON error to client to prevent the 404.html ENOENT loop
    return Response.json(
      {
        error: 'Spellcheck internal failure',
        message: err.message,
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/dictionary/add
 * Persists a word to the global SQLite dictionary
 */
async function handleAddtoDictionary(req) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { word } = await req.json()
    db.run('INSERT OR IGNORE INTO custom_dictionary (word, added_by) VALUES (?, ?)', [
      word,
      session.user.email,
    ])
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// =============================================================================
// SSR PAGE DETAIL - Updated for extensible styles
// =============================================================================

async function servePageDetailSSR(req, category, slug) {
  const filepath = './public/views/page-detail.html'
  const file = Bun.file(filepath)
  if (!(await file.exists())) return serve404()

  let html = await file.text()

  const mdPath = `./public/pages/${category}/${slug}.md`
  const mdFile = Bun.file(mdPath)

  let meta = { title: 'The markdown content was not found' }
  let contentHtml = `<div class="p-8 text-lg text-center text-error1">At: </div>`
  contentHtml += `<div class="p-4 font-mono text-center text-error1">${mdPath} </div>`

  let found = false

  if (await mdFile.exists()) {
    const text = await mdFile.text()
    const parsed = parseFrontMatter(text)
    meta = parsed.attributes
    contentHtml = marked.parse(parsed.body)
    found = true
  }

  const session = await auth.api.getSession({ headers: req.headers })
  const isAdmin = session?.user?.role === 'admin'
  const userEmail = session?.user?.email

  if (found) {
    if (meta.published === 'n' && !isAdmin) {
      contentHtml = `<div class="bg-red-50 p-4 text-red-700 rounded">Access Denied: Unpublished content.</div>`
      meta.title = 'Access Denied'
    } else if (meta.lapse && new Date() > new Date(meta.lapse)) {
      contentHtml = `<div class="bg-amber-50 p-4 text-amber-700 rounded">This content has expired.</div>`
      meta.title = 'Expired Content'
    } else if (meta.private && (!userEmail || userEmail !== meta.private)) {
      contentHtml = `<div class="bg-red-50 p-4 text-red-700 rounded">Access Denied: Private content.</div>`
      meta.title = 'Private Content'
    }
  }

  const config = getPagesConfig()
  const pageTitle = meta.title || 'Untitled'

  const escapedTitle = pageTitle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  let dateHtml = ''
  if (meta.created) {
    const d = new Date(meta.created)
    if (!isNaN(d)) {
      dateHtml = d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // =========================================================================
  // STYLE DETERMINATION - Priority: Front matter > Category default > Tailwind
  // =========================================================================
  const categoryConfig = config.find((c) => c.name === category)
  const categoryDefaultStyle = categoryConfig ? categoryConfig.style : 'tailwind'

  // Front matter 'style' key takes priority over category default
  const effectiveStyleName = meta.style || categoryDefaultStyle
  const styleConfig = getStyleConfig(effectiveStyleName)

  // =========================================================================
  // INJECT CONFIGURATION SCRIPTS
  // =========================================================================
  const configScript = `<script>
window.SERVER_PAGES_CONFIG = ${JSON.stringify(config)};
window.SSR_DATA = ${JSON.stringify(meta)};
window.STYLE_REGISTRY = ${JSON.stringify(STYLE_REGISTRY)};
window.EFFECTIVE_STYLE = ${JSON.stringify(styleConfig)};
</script>`
  html = html.replace('</head>', `${configScript}</head>`)

  // =========================================================================
  // INJECT STYLE CSS FILE (if needed)
  // =========================================================================
  if (styleConfig.cssFile) {
    const cssLink = `<link rel="stylesheet" href="/styles/md-styles/${styleConfig.cssFile}" />`
    html = html.replace('</head>', `${cssLink}</head>`)
  }

  // =========================================================================
  // APPLY STYLE CLASSES TO MARKDOWN CONTAINER
  // =========================================================================
  // The HTML has: id="markdown-content" class="prose prose-slate ..."
  // We need to:
  // 1. If removeProse is true, remove the prose classes
  // 2. Add the style's wrapper class

  if (styleConfig.removeProse) {
    // Remove prose classes and add style wrapper class
    html = html.replace(
      /id="markdown-content"\s+class="[^"]*prose[^"]*"/,
      `id="markdown-content" class="${styleConfig.wrapperClass}"`,
    )
  } else {
    // Keep prose classes and add additional wrapper class
    html = html.replace(
      /id="markdown-content"\s+class="([^"]*)"/,
      `id="markdown-content" class="$1 ${styleConfig.wrapperClass}"`,
    )
  }

  html = html.replace('{{PAGE_TITLE_ATTR}}', escapedTitle)
  html = html.replace('{{PAGE_TITLE_TEXT}}', escapedTitle)
  html = html.replace('{{PAGE_DATE}}', dateHtml)
  html = html.replace('<!--MARKDOWN_CONTENT-->', contentHtml)

  if (meta.private) {
    html = html.replace('id="private-badge" class="hidden', 'id="private-badge" class="')
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// =============================================================================
// SEARCH API HANDLERS
// =============================================================================

/**
 * GET /api/pages/search?q=query
 * Search across all indexed pages
 * Access control: filters unpublished (admin only) and private (email match)
 */
async function handlePagesSearch(req, url) {
  try {
    const query = url.searchParams.get('q') || ''
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : undefined

    // Get session for access control
    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email || null

    // Perform search with access control
    const results = searchPages(db, query, {
      isAdmin,
      userEmail,
      limit,
    })

    return Response.json(results)
  } catch (err) {
    console.error('[Search] API error:', err)
    return Response.json({ error: 'Search failed', details: err.message }, { status: 500 })
  }
}

/**
 * POST /api/pages/reindex
 * Rebuild the search index from all markdown files
 * Requires admin role
 */
async function handlePagesReindex(req) {
  try {
    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    console.log(`[Search] Reindex triggered by ${session.user.email}`)

    // Perform reindex
    const result = await reindexAllPages(db, getPagesConfig)

    if (result.success) {
      return Response.json(result)
    } else {
      return Response.json(result, { status: 500 })
    }
  } catch (err) {
    console.error('[Search] Reindex API error:', err)
    return Response.json({ error: 'Reindex failed', details: err.message }, { status: 500 })
  }
}

/**
 * GET /api/pages/search-meta
 * Get search index metadata (last indexed time, document count)
 * Requires admin role
 */
async function handleSearchMeta(req) {
  try {
    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const meta = getSearchMeta(db)
    return Response.json(meta)
  } catch (err) {
    console.error('[Search] Meta API error:', err)
    return Response.json({ error: 'Failed to get metadata', details: err.message }, { status: 500 })
  }
}

// =============================================================================
// RAW MARKDOWN API HANDLERS
// =============================================================================

/**
 * GET /api/pages/raw/:category/:slug
 * Returns the raw markdown content for editing
 * Requires admin role
 */
async function handleGetRawMarkdown(req, path) {
  try {
    // Parse category and slug from path
    // Path format: /api/pages/raw/:category/:slug
    const parts = path.split('/').filter((p) => p.length > 0)
    // parts = ['api', 'pages', 'raw', 'category', 'slug']
    const category = parts[3]
    const slug = parts[4]

    // Validate inputs
    if (!category || !slug) {
      return Response.json({ error: 'Missing category or slug' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..') || slug.includes('..')) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Build file path
    const mdPath = `./public/pages/${category}/${slug}.md`
    const mdFile = Bun.file(mdPath)

    // Check if file exists
    if (!(await mdFile.exists())) {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    // Read the raw content
    const content = await mdFile.text()

    // Parse front matter to return metadata separately
    const { attributes: meta } = parseFrontMatter(content)

    return Response.json({
      content: content,
      meta: meta,
      path: `${category}/${slug}.md`,
    })
  } catch (err) {
    console.error('Error reading raw markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * PUT /api/pages/raw/:category/:slug
 * Saves the raw markdown content
 * Requires admin role
 */
async function handleSaveRawMarkdown(req, path) {
  try {
    // Parse category and slug from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]
    const slug = parts[4]

    // Validate inputs
    if (!category || !slug) {
      return Response.json({ error: 'Missing category or slug' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..') || slug.includes('..')) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Validate content
    if (typeof body.content !== 'string') {
      return Response.json({ error: 'Missing content field' }, { status: 400 })
    }

    // Build file path
    const mdPath = `./public/pages/${category}/${slug}.md`
    const mdFile = Bun.file(mdPath)

    // Check if file exists (we only allow editing existing files, not creating new ones)
    if (!(await mdFile.exists())) {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    // Write the content
    await Bun.write(mdPath, body.content)

    // Parse the new front matter to return updated metadata
    const { attributes: meta } = parseFrontMatter(body.content)

    console.log(`[Admin] Markdown file saved: ${mdPath} by ${session.user.email}`)

    return Response.json({
      success: true,
      message: 'File saved successfully',
      path: `${category}/${slug}.md`,
      meta: meta,
    })
  } catch (err) {
    console.error('Error saving raw markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// =============================================================================
// FILE UPLOAD HANDLERS
// =============================================================================

// Allowed file extensions
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
const ALLOWED_MD_EXTENSIONS = ['.md']

/**
 * Get file extension in lowercase
 */
function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Sanitize filename - remove special characters, keep extension
 */
function sanitizeFilename(filename) {
  const ext = getFileExtension(filename)
  const baseName = filename.slice(0, filename.lastIndexOf('.'))
  // Replace spaces with hyphens, remove non-alphanumeric except hyphens and underscores
  const sanitized = baseName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return sanitized + ext
}

/**
 * Generate default front matter for markdown files
 * Now includes style field
 */
function generateDefaultFrontMatter(category) {
  const now = new Date()
  const isoDate = now.toISOString().split('T')[0] // YYYY-MM-DD format

  // Get the default style for this category
  const categoryConfig = getPagesConfig().find((c) => c.name === category)
  const defaultStyle = categoryConfig ? categoryConfig.style : 'github'

  return `---
title: Title (needs editing)
summary: Summary (needs editing)
created: ${isoDate}
published: n
file-type: markdown
style: ${defaultStyle}
sticky: false
---

`
}

/**
 * Check if content has front matter
 */
function hasFrontMatter(content) {
  return content.trim().startsWith('---')
}

/**
 * Ensure front matter has published: n for uploaded files
 * If front matter exists, set published to n
 * If no front matter, add default front matter
 */
function ensureUnpublishedFrontMatter(content, category) {
  if (!hasFrontMatter(content)) {
    // No front matter - add default
    return generateDefaultFrontMatter(category) + content
  }

  // Has front matter - ensure published: n
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    return generateDefaultFrontMatter(category) + content
  }

  const frontMatter = fmMatch[1]
  const afterFrontMatter = content.slice(fmMatch[0].length)

  // Check if published line exists
  if (/^published\s*:/m.test(frontMatter)) {
    // Replace existing published line with n
    const updatedFm = frontMatter.replace(/^published\s*:.*$/m, 'published: n')
    return '---\n' + updatedFm + '\n---' + afterFrontMatter
  } else {
    // Add published: n line to front matter
    return '---\n' + frontMatter + '\npublished: n\n---' + afterFrontMatter
  }
}

/**
 * POST /api/pages/upload/:category
 * Upload a markdown file
 * Requires admin role
 */
async function handleMarkdownUpload(req, path) {
  try {
    // Parse category from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]

    // Validate category
    if (!category) {
      return Response.json({ error: 'Missing category' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..')) {
      return Response.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file extension
    const ext = getFileExtension(file.name)
    if (!ALLOWED_MD_EXTENSIONS.includes(ext)) {
      return Response.json({ error: 'Invalid file type. Only .md files allowed.' }, { status: 400 })
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName || sanitizedName === ext) {
      return Response.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Build target path
    const targetDir = `./public/pages/${category}`
    const targetPath = `${targetDir}/${sanitizedName}`

    // Ensure directory exists
    const { mkdir } = await import('node:fs/promises')
    await mkdir(targetDir, { recursive: true })

    // Check if file already exists
    const targetFile = Bun.file(targetPath)
    if (await targetFile.exists()) {
      return Response.json(
        {
          error: `File "${sanitizedName}" already exists in ${category}`,
        },
        { status: 409 },
      )
    }

    // Read file content
    let content = await file.text()

    // Ensure front matter with published: n (pass category for default style)
    content = ensureUnpublishedFrontMatter(content, category)

    // Write the file
    await Bun.write(targetPath, content)

    console.log(`[Admin] Markdown file uploaded: ${targetPath} by ${session.user.email}`)

    return Response.json({
      success: true,
      message: `Markdown file "${sanitizedName}" uploaded successfully`,
      path: `pages/${category}/${sanitizedName}`,
      filename: sanitizedName,
    })
  } catch (err) {
    console.error('Error uploading markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/media/upload/:category
 * Upload an image file
 * Requires admin role
 */
async function handleMediaUpload(req, path) {
  try {
    // Parse category from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]

    // Validate category
    if (!category) {
      return Response.json({ error: 'Missing category' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..')) {
      return Response.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file extension
    const ext = getFileExtension(file.name)
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return Response.json(
        {
          error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName || sanitizedName === ext) {
      return Response.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Build target path
    const targetDir = `./public/media/${category}`
    const targetPath = `${targetDir}/${sanitizedName}`

    // Ensure directory exists
    const { mkdir } = await import('node:fs/promises')
    await mkdir(targetDir, { recursive: true })

    // Check if file already exists
    const targetFile = Bun.file(targetPath)
    if (await targetFile.exists()) {
      return Response.json(
        {
          error: `File "${sanitizedName}" already exists in ${category}`,
        },
        { status: 409 },
      )
    }

    // Get file buffer and write
    const buffer = await file.arrayBuffer()
    await Bun.write(targetPath, buffer)

    console.log(`[Admin] Media file uploaded: ${targetPath} by ${session.user.email}`)

    // Return the path that can be used in markdown
    const markdownPath = `/media/${category}/${sanitizedName}`

    return Response.json({
      success: true,
      message: `Image "${sanitizedName}" uploaded successfully`,
      path: `media/${category}/${sanitizedName}`,
      filename: sanitizedName,
      markdownUsage: `![${sanitizedName}](${markdownPath})`,
    })
  } catch (err) {
    console.error('Error uploading media:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// --- API HANDLERS ---

async function handlePagesList(req, path) {
  try {
    const parts = path.split('/')
    const category = parts[parts.length - 1]
    if (category.includes('..'))
      return Response.json({ error: 'Invalid category' }, { status: 400 })

    const dirPath = `./public/pages/${category}`
    try {
      await readdir(dirPath)
    } catch (e) {
      return Response.json({ pages: [], category }, { status: 200 })
    }

    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email

    const files = await readdir(dirPath)
    const pages = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const content = await Bun.file(join(dirPath, file)).text()
      const { attributes: meta } = parseFrontMatter(content)

      if (!meta.title) continue
      meta.filename = file
      meta.slug = file.replace('.md', '')

      if (meta.published === 'n' && !isAdmin) continue
      if (meta.lapse && new Date() > new Date(meta.lapse)) continue
      if (meta.private && (!userEmail || userEmail !== meta.private)) continue

      pages.push(meta)
    }

    pages.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
    return Response.json({ pages, category })
  } catch (e) {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}

async function handlePageContent(req, path) {
  try {
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]
    const slug = parts[4]

    const mdPath = `./public/pages/${category}/${slug}.md`
    const mdFile = Bun.file(mdPath)

    let meta = {}
    let htmlContent = ''

    if (await mdFile.exists()) {
      const text = await mdFile.text()
      const parsed = parseFrontMatter(text)
      meta = parsed.attributes
      htmlContent = marked.parse(parsed.body)
    } else {
      return Response.json({ error: 'The markdon file requested was not found.' }, { status: 404 })
    }

    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email

    if (meta.published === 'n' && !isAdmin)
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if (meta.lapse && new Date() > new Date(meta.lapse))
      return Response.json({ error: 'Expired' }, { status: 410 })
    if (meta.private && (!userEmail || userEmail !== meta.private))
      return Response.json({ error: 'Unauthorized' }, { status: 403 })

    // Include style information in response
    const config = getPagesConfig()
    const categoryConfig = config.find((c) => c.name === category)
    const categoryDefaultStyle = categoryConfig ? categoryConfig.style : 'tailwind'
    const effectiveStyleName = meta.style || categoryDefaultStyle
    const styleConfig = getStyleConfig(effectiveStyleName)

    return Response.json({
      meta,
      html: htmlContent,
      style: styleConfig,
    })
  } catch (e) {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}

async function serveStatic(path) {
  const file = Bun.file(`./public${path}`)
  if (!(await file.exists())) return serve404()
  return new Response(file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
}

async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath)
  if (!(await pageFile.exists())) return serve404()
  return new Response(pageFile, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function serve404() {
  const notFoundFile = Bun.file(join(__dirname, '../public/views/404.html')) // Use absolute join
  if (await notFoundFile.exists())
    return new Response(notFoundFile, { status: 404, headers: { 'Content-Type': 'text/html' } })
  return new Response('Not Found', { status: 404 })
}

console.log(`\nServer running at http://localhost:${PORT}`)
