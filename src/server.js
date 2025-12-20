// version 13.0 Gemini 2.0 Flash
// server.js
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
      // Notify clients on any change in pages directory
      for (const controller of clients) controller.enqueue(`data: reload\n\n`)
    }
  } catch (e) {}
})()

// --- SERVER ---
const server = Bun.serve({
  port: PORT,
  idleTimeout: 255, // Keep high for SSE
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    if (path.startsWith('/api/auth')) return auth.handler(req)
    if (path.startsWith('/api/admin/')) return handleAdminRoutes(req, path)

    // Hot Reload Stream
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
    if (path.startsWith('/api/pages/list/')) return handlePagesList(req, path)

    // API for fetching content (Client-side fallback)
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
    if (colonIndex !== -1)
      attributes[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim()
  })
  const body = text.replace(match[0], '').trim()
  return { attributes, body }
}

/**
 * Server-Side Render for Page Detail
 * Reads template, fetches MD content, and injects it.
 */
async function servePageDetailSSR(req, category, slug) {
  const filepath = './public/views/page-detail.html'
  const file = Bun.file(filepath)
  if (!(await file.exists())) return serve404()

  let html = await file.text()

  // 1. Fetch Content Logic (Markdown Only)
  const mdPath = `./public/pages/${category}/${slug}.md`
  const mdFile = Bun.file(mdPath)

  let meta = { title: 'Page Not Found' }
  let contentHtml = '<div class="p-8 text-center text-gray-500">Page content not found.</div>'
  let found = false

  if (await mdFile.exists()) {
    const text = await mdFile.text()
    const parsed = parseFrontMatter(text)
    meta = parsed.attributes
    contentHtml = marked.parse(parsed.body)
    found = true
  }

  // 2. Permission Check
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

  // 3. Inject Data
  const config = getPagesConfig()
  const configScript = `<script>window.SERVER_PAGES_CONFIG = ${JSON.stringify(config)}; window.SSR_DATA = ${JSON.stringify(meta)};</script>`

  html = html.replace('</head>', `${configScript}</head>`)
  html = html.replace('Loading...', meta.title || 'Untitled')
  html = html.replace('page-title="Loading..."', `page-title="${meta.title || 'Page'}"`)

  let dateHtml = ''
  if (meta.created) {
    const d = new Date(meta.created)
    if (!isNaN(d))
      dateHtml = d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
  }
  html = html.replace(
    '<span id="page-date" class="flex items-center gap-1 font-mono text-xs"></span>',
    `<span id="page-date" class="flex items-center gap-1 font-mono text-xs">${dateHtml}</span>`,
  )

  const skeletonRegex = /<div id="markdown-content"[^>]*>([\s\S]*?)<\/div>/
  html = html.replace(
    skeletonRegex,
    `<div id="markdown-content" class="markdown-body">${contentHtml}</div>`,
  )

  if (meta.private) {
    html = html.replace('id="private-badge" class="hidden', 'id="private-badge" class="')
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
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
      return Response.json({ error: 'Page not found' }, { status: 404 })
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

async function handleAdminRoutes(req, path) {
  return new Response('Admin route not found', { status: 404 })
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
