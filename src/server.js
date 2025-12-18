// version 5.0 Gemini 2.0 Flash
// server.js
import { auth } from './auth.js'
import { db } from './db-setup.js'
import { handleApiRoutes } from './routes/api.js'
import { hashPassword } from 'better-auth/crypto'
import { readdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { marked } from 'marked'

export { db }

const PORT = process.env.PORT || 3000

// --- BUILD STEP ---
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

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs)
} else {
  console.log('Build successful. ./public/components/client-components.js created.')
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // --- AUTH ---
    if (path.startsWith('/api/auth')) {
      return auth.handler(req)
    }

    // --- ADMIN ---
    if (path.startsWith('/api/admin/')) {
      return handleAdminRoutes(req, path)
    }

    // --- API: PAGES CONFIG ---
    if (path === '/api/pages-config') {
      const pagesEnv = process.env.PAGES || ''
      const categories = pagesEnv
        .split(',')
        .map((c) => {
          const trimmed = c.trim()
          if (!trimmed) return null
          const parts = trimmed.split(':')
          return {
            name: parts[0].trim(),
            sidebar: parts.length > 1 && parts[1].trim() === 'sidebar',
          }
        })
        .filter((c) => c !== null)
      return Response.json(categories)
    }

    // --- API: PAGES LIST ---
    if (path.startsWith('/api/pages/list/')) {
      return handlePagesList(req, path)
    }

    // --- API: PAGE CONTENT ---
    if (path.startsWith('/api/pages/content/')) {
      return handlePageContent(req, path)
    }

    // --- GENERIC API ---
    if (path.startsWith('/api/')) {
      return handleApiRoutes(req, path)
    }

    // --- STATIC & UI ---
    if (path === '/components/client-components.js') {
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: { 'Content-Type': 'text/javascript' },
      })
    }
    if (
      path.startsWith('/styles/') ||
      path.startsWith('/scripts/') ||
      path.startsWith('/media/') ||
      path.startsWith('/docs/')
    ) {
      return serveStatic(path)
    }
    if (path === '/favicon.ico') {
      return new Response(Bun.file('./favicon.ico'), {
        headers: { 'Content-Type': 'image/x-icon' },
      })
    }
    if (path === '/') return serveHtmlPage('./public/index.html')

    // View Handler for Pages
    if (path.startsWith('/pages/')) {
      const parts = path.split('/').filter((p) => p.length > 0)
      if (parts.length === 2) return serveHtmlPage('./public/views/pages-list.html')
      if (parts.length === 3) return serveHtmlPage('./public/views/page-detail.html')
    }

    return serveHtmlPage('./public/views' + path)
  },
})

// --- HELPERS ---

// 1. Parse Front Matter
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

// 2. Custom Quarkdown Renderer (Placeholder)
function renderQuarkdown(text) {
  // TODO: Replace this with your actual Quarkdown library or logic
  // For now, we wrap it to show it was processed differently
  const html = marked.parse(text)
  return `
    <div class="quarkdown-wrapper" style="border-left: 4px solid #7c3aed; padding-left: 1rem;">
      <p style="color: #7c3aed; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;">Rendered via Quarkdown</p>
      ${html}
    </div>
  `
}

// --- HANDLERS ---

async function handlePagesList(req, path) {
  try {
    const parts = path.split('/')
    const category = parts[parts.length - 1]

    if (category.includes('..') || category.includes('/') || category.includes('\\')) {
      return Response.json({ error: 'Invalid category' }, { status: 400 })
    }

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

    // Supported extensions
    const validExtensions = ['.md', '.quark', '.qd']

    for (const file of files) {
      const ext = extname(file)
      if (!validExtensions.includes(ext)) continue

      const content = await Bun.file(join(dirPath, file)).text()
      const { attributes: meta } = parseFrontMatter(content)

      if (!meta.title) continue

      meta.filename = file
      // Strip extension for slug
      meta.slug = file.replace(ext, '')

      // Permissions
      if (meta.published === 'n' && !isAdmin) continue
      if (meta.lapse) {
        const lapseDate = new Date(meta.lapse)
        if (!isNaN(lapseDate) && new Date() > lapseDate) continue
      }
      if (meta.private) {
        if (!userEmail || userEmail !== meta.private) continue
      }

      pages.push(meta)
    }

    pages.sort((a, b) => {
      const dateA = new Date(a.created || 0)
      const dateB = new Date(b.created || 0)
      return dateB - dateA
    })

    return Response.json({ pages, category })
  } catch (error) {
    console.error('List pages error:', error)
    return Response.json({ error: 'Failed to list pages' }, { status: 500 })
  }
}

async function handlePageContent(req, path) {
  try {
    const parts = path.split('/').filter((p) => p.length > 0)

    if (parts.length < 5) return Response.json({ error: 'Invalid path' }, { status: 400 })

    const category = parts[3]
    const slug = parts[4]

    if (category.includes('..') || slug.includes('..')) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Try finding the file with different extensions
    let fileHandle = null
    const extensions = ['.md', '.quark', '.qd']

    for (const ext of extensions) {
      const attempt = Bun.file(`./public/pages/${category}/${slug}${ext}`)
      if (await attempt.exists()) {
        fileHandle = attempt
        break
      }
    }

    if (!fileHandle) {
      return Response.json({ error: 'Page not found' }, { status: 404 })
    }

    const text = await fileHandle.text()
    const { attributes: meta, body } = parseFrontMatter(text)

    // Permissions
    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email

    if (meta.published === 'n' && !isAdmin)
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if (meta.lapse) {
      const lapseDate = new Date(meta.lapse)
      if (!isNaN(lapseDate) && new Date() > lapseDate)
        return Response.json({ error: 'Page has expired' }, { status: 410 })
    }
    if (meta.private) {
      if (!userEmail || userEmail !== meta.private)
        return Response.json({ error: 'Unauthorized: Private Document' }, { status: 403 })
    }

    // --- RENDER SWITCH ---
    let htmlContent = ''

    // Check for 'quarkdown' file type
    if (meta['file-type'] === 'quarkdown') {
      htmlContent = renderQuarkdown(body)
    } else {
      // Default to Markdown
      htmlContent = marked.parse(body)
    }

    return Response.json({ meta, html: htmlContent })
  } catch (error) {
    console.error('Get page content error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// --- ADMIN ROUTES ---
async function handleAdminRoutes(req, path) {
  // Placeholder - Paste full logic if needed
  if (path === '/api/admin/users' && req.method === 'GET') {
    try {
      const session = await auth.api.getSession({ headers: req.headers })
      if (!session || session.user.role !== 'admin')
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
      const users = db.prepare(`SELECT id, name, email, createdAt, role FROM user`).all()
      return Response.json(users)
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 })
    }
  }
  return new Response('Admin route not found', { status: 404 })
}

// --- STATIC FILE SERVERS ---
async function serveStatic(path) {
  const file = Bun.file(`./public${path}`)
  if (!(await file.exists())) return serve404()
  return new Response(file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath)
  if (!(await pageFile.exists())) return serve404()
  return new Response(pageFile, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

async function serve404() {
  const notFoundFile = Bun.file('./public/views/404.html')
  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
  return new Response('Not Found', { status: 404 })
}

console.log(`\nServer running at http://localhost:${PORT}`)
