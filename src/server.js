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
import { join } from 'node:path'
import { marked } from 'marked'

export { db }

const PORT = process.env.PORT || 3000

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

    if (path === '/api/pages-config') {
      return Response.json(getPagesConfig())
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

// --- HELPERS ---

function getPagesConfig() {
  const pagesEnv = process.env.PAGES || ''

  return pagesEnv
    .split(',')
    .map((c) => {
      const t = c.trim()
      if (!t) return null
      const p = t.split(':')
      return { name: p[0].trim(), sidebar: p.length > 1 && p[1].trim() === 'sidebar' }
    })
    .filter((c) => c !== null)
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

  const configScript = `<script>window.SERVER_PAGES_CONFIG = ${JSON.stringify(config)}; window.SSR_DATA = ${JSON.stringify(meta)};</script>`
  html = html.replace('</head>', `${configScript}</head>`)

  html = html.replace('{{PAGE_TITLE_ATTR}}', escapedTitle)
  html = html.replace('{{PAGE_TITLE_TEXT}}', escapedTitle)
  html = html.replace('{{PAGE_DATE}}', dateHtml)
  html = html.replace('<!--MARKDOWN_CONTENT-->', contentHtml)

  if (meta.style === 'github') {
    if (html.includes('id="markdown-content" class="')) {
      html = html.replace(
        'id="markdown-content" class="',
        'id="markdown-content" class="github-style ',
      )
    } else if (html.includes('class="') && html.includes('id="markdown-content"')) {
      html = html.replace(
        /(<div\s+)([^>]*)(id="markdown-content")([^>]*)(class=")([^"]*)/,
        '$1$2$3$4$5github-style $6',
      )
    }
  }

  if (meta.private) {
    html = html.replace('id="private-badge" class="hidden', 'id="private-badge" class="')
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
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
 */
function generateDefaultFrontMatter() {
  const now = new Date()
  const isoDate = now.toISOString().split('T')[0] // YYYY-MM-DD format

  return `---
title: Title (needs editing)
summary: Summary (needs editing)
created: ${isoDate}
published: n
file-type: markdown
style: github
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
function ensureUnpublishedFrontMatter(content) {
  if (!hasFrontMatter(content)) {
    // No front matter - add default
    return generateDefaultFrontMatter() + content
  }

  // Has front matter - ensure published: n
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    return generateDefaultFrontMatter() + content
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

    // Ensure front matter with published: n
    content = ensureUnpublishedFrontMatter(content)

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

    return Response.json({ meta, html: htmlContent })
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
  const notFoundFile = Bun.file('./public/views/404.html')
  if (await notFoundFile.exists())
    return new Response(notFoundFile, { status: 404, headers: { 'Content-Type': 'text/html' } })
  return new Response('Not Found', { status: 404 })
}

console.log(`\nServer running at http://localhost:${PORT}`)
