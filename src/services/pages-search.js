// version 1.1 Claude Opus 4.5
// =============================================================================
// PAGES SEARCH SERVICE
// =============================================================================
// Provides full-text search across all markdown pages using SQLite FTS5.
// Features:
// - Weighted scoring (title, headings, bold text, body)
// - Prefix matching (left-to-right, word-start)
// - Safe query handling (escapes quotes, prevents FTS5 operator injection)
// - Access control (published, private, admin-only)
// - On-demand indexing via API
//
// Usage:
//   import { initSearchIndex, reindexAllPages, searchPages } from './services/pages-search.js'
//   await initSearchIndex(db)
//   await reindexAllPages(db, getPagesConfig)
//   const results = await searchPages(db, 'query', { isAdmin, userEmail })
// =============================================================================

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

// =============================================================================
// CONFIGURATION
// =============================================================================

// Maximum results returned from search
export const SEARCH_MAX_RESULTS = 20

// Minimum query length required
export const SEARCH_MIN_QUERY_LENGTH = 3

// Context characters around matches for snippets
export const SEARCH_CONTEXT_CHARS = 60

// Content weight configuration
// Higher weight = more important in search ranking
const WEIGHTS = {
  title: 10,
  description: 8,
  h1: 6,
  h2: 5,
  h3: 4,
  h4_h6: 2,
  bold: 2,
  link_text: 2,
  blockquote: 1.5,
  body: 1,
  code: 0.5,
}

// =============================================================================
// DATABASE SCHEMA SETUP
// =============================================================================

/**
 * Initialize the search index tables in the database
 * Creates FTS5 virtual table and metadata table if they don't exist
 *
 * @param {Object} db - Bun SQLite database instance
 */
export function initSearchIndex(db) {
  // Create FTS5 virtual table for full-text search
  // Using porter tokenizer for stemming + unicode61 for unicode support
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS pages_search USING fts5(
      -- Identifiers (not indexed, just stored for retrieval)
      category UNINDEXED,
      slug UNINDEXED,

      -- Access control fields (not indexed)
      published UNINDEXED,
      private_email UNINDEXED,

      -- Searchable content fields (in weight order for bm25)
      title,
      description,
      h1_content,
      h2_content,
      h3_content,
      h4_h6_content,
      bold_content,
      link_text,
      blockquote_content,
      body_text,
      code_content,

      -- Tokenizer configuration
      tokenize='porter unicode61'
    )
  `)

  // Create metadata table for tracking index state
  db.run(`
    CREATE TABLE IF NOT EXISTS pages_search_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)

  console.log('[Search] Index tables initialized')
}

// =============================================================================
// FRONT MATTER PARSING
// =============================================================================

/**
 * Parse YAML front matter from markdown content
 * Matches the pattern used in server.js
 *
 * @param {string} text - Raw markdown file content
 * @returns {Object} { attributes: {}, body: string }
 */
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

// =============================================================================
// MARKDOWN CONTENT EXTRACTION
// =============================================================================

/**
 * Extract weighted content regions from markdown body
 * Parses headings, bold text, links, blockquotes, code, and body text
 *
 * @param {string} markdown - Markdown body content (without front matter)
 * @returns {Object} Content regions by type
 */
function extractContentRegions(markdown) {
  const regions = {
    h1: [],
    h2: [],
    h3: [],
    h4_h6: [],
    bold: [],
    link_text: [],
    blockquote: [],
    code: [],
    body: [],
  }

  // Work with a copy we'll progressively strip
  let remaining = markdown

  // ==========================================================================
  // Extract code blocks first (to avoid parsing markdown inside them)
  // ==========================================================================

  // Fenced code blocks: ```lang\n...\n```
  remaining = remaining.replace(/```[\s\S]*?```/g, (match) => {
    // Extract just the code content (skip the fence lines)
    const lines = match.split('\n')
    const codeContent = lines.slice(1, -1).join(' ')
    if (codeContent.trim()) {
      regions.code.push(codeContent.trim())
    }
    return '' // Remove from further processing
  })

  // Inline code: `code`
  remaining = remaining.replace(/`([^`]+)`/g, (match, code) => {
    if (code.trim()) {
      regions.code.push(code.trim())
    }
    return '' // Remove from further processing
  })

  // ==========================================================================
  // Extract blockquotes
  // ==========================================================================
  remaining = remaining.replace(/^>\s*(.+)$/gm, (match, content) => {
    if (content.trim()) {
      regions.blockquote.push(content.trim())
    }
    return '' // Remove from further processing
  })

  // ==========================================================================
  // Extract headings (must be done line by line)
  // ==========================================================================

  // H1: # Heading
  remaining = remaining.replace(/^#\s+(.+)$/gm, (match, content) => {
    if (content.trim()) {
      regions.h1.push(content.trim())
    }
    return ''
  })

  // H2: ## Heading
  remaining = remaining.replace(/^##\s+(.+)$/gm, (match, content) => {
    if (content.trim()) {
      regions.h2.push(content.trim())
    }
    return ''
  })

  // H3: ### Heading
  remaining = remaining.replace(/^###\s+(.+)$/gm, (match, content) => {
    if (content.trim()) {
      regions.h3.push(content.trim())
    }
    return ''
  })

  // H4-H6: #### to ###### Heading
  remaining = remaining.replace(/^#{4,6}\s+(.+)$/gm, (match, content) => {
    if (content.trim()) {
      regions.h4_h6.push(content.trim())
    }
    return ''
  })

  // ==========================================================================
  // Extract bold text
  // ==========================================================================

  // **bold** or __bold__
  remaining = remaining.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
    if (content.trim()) {
      regions.bold.push(content.trim())
    }
    return content // Keep the text for body, just remove markers
  })

  remaining = remaining.replace(/__([^_]+)__/g, (match, content) => {
    if (content.trim()) {
      regions.bold.push(content.trim())
    }
    return content
  })

  // ==========================================================================
  // Extract link text
  // ==========================================================================

  // [link text](url) - extract the link text
  remaining = remaining.replace(/\[([^\]]+)\]\([^)]+\)/g, (match, text) => {
    if (text.trim()) {
      regions.link_text.push(text.trim())
    }
    return text // Keep text for body
  })

  // ==========================================================================
  // Remaining content is body text
  // ==========================================================================

  // Clean up remaining markdown artifacts
  remaining = remaining
    .replace(/\*([^*]+)\*/g, '$1') // Remove *italic* markers
    .replace(/_([^_]+)_/g, '$1') // Remove _italic_ markers
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^\s*---+\s*$/gm, '') // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim()

  if (remaining) {
    regions.body.push(remaining)
  }

  return regions
}

// =============================================================================
// INDEXING
// =============================================================================

/**
 * Index a single markdown file into the search database
 *
 * @param {Object} db - Database instance
 * @param {string} category - Category name
 * @param {string} slug - File slug (filename without .md)
 * @param {string} content - Raw file content
 */
function indexPage(db, category, slug, content) {
  const { attributes: meta, body } = parseFrontMatter(content)

  // Skip files without titles (not valid pages)
  if (!meta.title) {
    return false
  }

  // Extract content regions from markdown body
  const regions = extractContentRegions(body)

  // Prepare values for insert
  const insertStmt = db.prepare(`
    INSERT INTO pages_search (
      category, slug, published, private_email,
      title, description,
      h1_content, h2_content, h3_content, h4_h6_content,
      bold_content, link_text, blockquote_content,
      body_text, code_content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertStmt.run(
    category,
    slug,
    meta.published || 'y', // Default to published
    meta.private || null, // Private email if set
    meta.title || '',
    meta.summary || meta.description || '',
    regions.h1.join(' '),
    regions.h2.join(' '),
    regions.h3.join(' '),
    regions.h4_h6.join(' '),
    regions.bold.join(' '),
    regions.link_text.join(' '),
    regions.blockquote.join(' '),
    regions.body.join(' '),
    regions.code.join(' '),
  )

  return true
}

/**
 * Reindex all markdown pages across all categories
 * Clears existing index and rebuilds from scratch
 *
 * @param {Object} db - Database instance
 * @param {Function} getPagesConfig - Function that returns page categories config
 * @returns {Object} { success, indexed, categories, duration }
 */
export async function reindexAllPages(db, getPagesConfig) {
  const startTime = Date.now()
  let indexedCount = 0
  let categoriesProcessed = 0

  try {
    // Get all configured categories
    const config = getPagesConfig()

    if (!config || config.length === 0) {
      return {
        success: false,
        error: 'No page categories configured',
        indexed: 0,
        categories: 0,
        duration: '0ms',
      }
    }

    // Clear existing index
    db.run('DELETE FROM pages_search')

    // Process each category
    for (const categoryConfig of config) {
      const category = categoryConfig.name
      const dirPath = `./public/pages/${category}`

      try {
        const files = await readdir(dirPath)
        categoriesProcessed++

        for (const file of files) {
          if (!file.endsWith('.md')) continue

          try {
            const filePath = join(dirPath, file)
            const content = await Bun.file(filePath).text()
            const slug = file.replace('.md', '')

            const indexed = indexPage(db, category, slug, content)
            if (indexed) {
              indexedCount++
            }
          } catch (fileErr) {
            console.error(`[Search] Error indexing ${category}/${file}:`, fileErr.message)
          }
        }
      } catch (dirErr) {
        // Directory doesn't exist - skip silently
        console.log(`[Search] Category directory not found: ${category}`)
      }
    }

    // Update metadata
    const now = new Date().toISOString()
    db.run(
      `
      INSERT OR REPLACE INTO pages_search_meta (key, value)
      VALUES ('last_indexed', ?)
    `,
      [now],
    )

    const duration = Date.now() - startTime

    console.log(
      `[Search] Indexed ${indexedCount} pages from ${categoriesProcessed} categories in ${duration}ms`,
    )

    return {
      success: true,
      indexed: indexedCount,
      categories: categoriesProcessed,
      duration: `${duration}ms`,
    }
  } catch (err) {
    console.error('[Search] Reindex failed:', err)
    return {
      success: false,
      error: err.message,
      indexed: indexedCount,
      categories: categoriesProcessed,
      duration: `${Date.now() - startTime}ms`,
    }
  }
}

// =============================================================================
// SEARCHING
// =============================================================================

/**
 * Generate a text snippet with highlighted match
 *
 * @param {string} text - Full text to search within
 * @param {string} query - Search query
 * @param {number} contextChars - Characters of context on each side
 * @returns {string|null} Snippet with <mark> tags, or null if no match
 */
function generateSnippet(text, query, contextChars = SEARCH_CONTEXT_CHARS) {
  if (!text || !query) return null

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  // Find the first word that starts with the query (prefix match)
  const wordBoundaryRegex = new RegExp(`(^|\\s)(${escapeRegex(lowerQuery)}\\w*)`, 'i')
  const match = text.match(wordBoundaryRegex)

  if (!match) return null

  const matchIndex = match.index + (match[1] ? 1 : 0) // Adjust for leading space
  const matchedWord = match[2]

  // Calculate snippet boundaries
  const start = Math.max(0, matchIndex - contextChars)
  const end = Math.min(text.length, matchIndex + matchedWord.length + contextChars)

  // Extract snippet
  let snippet = text.slice(start, end)

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  // Highlight the matched portion
  const highlightRegex = new RegExp(`(^|\\s)(${escapeRegex(lowerQuery)})(\\w*)`, 'gi')
  snippet = snippet.replace(highlightRegex, '$1<mark>$2</mark>$3')

  return snippet
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Search indexed pages with weighted ranking
 *
 * @param {Object} db - Database instance
 * @param {string} query - Search query (minimum 3 characters)
 * @param {Object} options - Search options
 * @param {boolean} options.isAdmin - Whether user is admin (sees unpublished)
 * @param {string|null} options.userEmail - User's email (for private page access)
 * @param {number} options.limit - Maximum results (default SEARCH_MAX_RESULTS)
 * @returns {Object} { query, results, total, duration }
 */
export function searchPages(db, query, options = {}) {
  const startTime = Date.now()
  const { isAdmin = false, userEmail = null, limit = SEARCH_MAX_RESULTS } = options

  // Validate query length
  if (!query || query.trim().length < SEARCH_MIN_QUERY_LENGTH) {
    return {
      query: query || '',
      results: [],
      total: 0,
      duration: '0ms',
      error: `Query must be at least ${SEARCH_MIN_QUERY_LENGTH} characters`,
    }
  }

  const cleanQuery = query.trim()

  try {
    // Build FTS5 query with prefix matching
    // Escape embedded double quotes and wrap each term in quotes for safety
    // This prevents FTS5 syntax errors from special characters like hyphens
    // and prevents query injection via FTS5 operators
    const ftsQuery = cleanQuery
      .split(/\s+/)
      .map((term) => {
        // Escape any double quotes by doubling them (FTS5 escape mechanism)
        const escaped = term.replace(/"/g, '""')
        // Wrap in quotes and add * for prefix matching
        return `"${escaped}"*`
      })
      .join(' ')

    // BM25 weights in column order:
    // category(0), slug(0), published(0), private_email(0),
    // title(10), description(8), h1(6), h2(5), h3(4), h4_h6(2),
    // bold(2), link_text(2), blockquote(1.5), body(1), code(0.5)
    const bm25Weights = `0, 0, 0, 0, ${WEIGHTS.title}, ${WEIGHTS.description}, ${WEIGHTS.h1}, ${WEIGHTS.h2}, ${WEIGHTS.h3}, ${WEIGHTS.h4_h6}, ${WEIGHTS.bold}, ${WEIGHTS.link_text}, ${WEIGHTS.blockquote}, ${WEIGHTS.body}, ${WEIGHTS.code}`

    // Build the search query with access control
    const searchSql = `
      SELECT
        category,
        slug,
        title,
        description,
        published,
        private_email,
        h1_content,
        h2_content,
        body_text,
        bm25(pages_search, ${bm25Weights}) as score
      FROM pages_search
      WHERE pages_search MATCH ?
      ORDER BY score
      LIMIT ?
    `

    const rawResults = db.query(searchSql).all(ftsQuery, limit * 2) // Fetch extra for filtering

    // Filter results based on access control
    const filteredResults = rawResults.filter((row) => {
      // Unpublished pages: admin only
      if (row.published === 'n' && !isAdmin) {
        return false
      }

      // Private pages: must match email
      if (row.private_email) {
        if (!userEmail || userEmail !== row.private_email) {
          return false
        }
      }

      return true
    })

    // Take only the limit after filtering
    const limitedResults = filteredResults.slice(0, limit)

    // Format results with snippets
    const results = limitedResults.map((row) => {
      // Generate match snippets from different content regions
      const matches = []

      // Check title match
      const titleSnippet = generateSnippet(row.title, cleanQuery)
      if (titleSnippet) {
        matches.push({ region: 'title', fragment: titleSnippet })
      }

      // Check description match
      const descSnippet = generateSnippet(row.description, cleanQuery)
      if (descSnippet) {
        matches.push({ region: 'description', fragment: descSnippet })
      }

      // Check h1 match
      const h1Snippet = generateSnippet(row.h1_content, cleanQuery)
      if (h1Snippet) {
        matches.push({ region: 'heading', fragment: h1Snippet })
      }

      // Check h2 match
      const h2Snippet = generateSnippet(row.h2_content, cleanQuery)
      if (h2Snippet) {
        matches.push({ region: 'heading', fragment: h2Snippet })
      }

      // Check body match
      const bodySnippet = generateSnippet(row.body_text, cleanQuery)
      if (bodySnippet) {
        matches.push({ region: 'body', fragment: bodySnippet })
      }

      // If no specific matches found, just show the description
      if (matches.length === 0 && row.description) {
        matches.push({
          region: 'description',
          fragment:
            row.description.length > 60 ? row.description.slice(0, 60) + '...' : row.description,
        })
      }

      return {
        category: row.category,
        slug: row.slug,
        title: row.title,
        description: row.description || '',
        score: Math.abs(row.score), // BM25 returns negative scores
        isPrivate: !!row.private_email,
        isUnpublished: row.published === 'n',
        matches: matches.slice(0, 2), // Limit to 2 match snippets
      }
    })

    const duration = Date.now() - startTime

    return {
      query: cleanQuery,
      results,
      total: results.length,
      duration: `${duration}ms`,
    }
  } catch (err) {
    console.error('[Search] Search failed:', err)
    return {
      query: cleanQuery,
      results: [],
      total: 0,
      duration: `${Date.now() - startTime}ms`,
      error: err.message,
    }
  }
}

/**
 * Get search index metadata (last indexed time, etc.)
 *
 * @param {Object} db - Database instance
 * @returns {Object} Metadata object
 */
export function getSearchMeta(db) {
  try {
    const lastIndexed = db
      .query("SELECT value FROM pages_search_meta WHERE key = 'last_indexed'")
      .get()

    const countResult = db.query('SELECT COUNT(*) as count FROM pages_search').get()

    return {
      lastIndexed: lastIndexed?.value || null,
      documentCount: countResult?.count || 0,
    }
  } catch (err) {
    return {
      lastIndexed: null,
      documentCount: 0,
      error: err.message,
    }
  }
}
