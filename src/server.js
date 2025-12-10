// src/server.js
// version 1.4 Gemini 2.0 Flash
// Changes:
// - Added 'const PORT' to ensure port is defined for logging.
// - Fixed 'server.port is undefined' error by using the constant.
// - Kept Admin Seeding paused for Step 1 (DB Connectivity Test).

import { auth } from './auth.js'
import { db } from './db-setup.js' // Imports the DB and triggers table creation
import { handleApiRoutes } from './routes/api.js'

// Re-export db so existing models referencing 'server.js' don't break
export { db }

// Define Port explicitly
const PORT = process.env.PORT || 3000

// Bundle the client components on server start.
// for dev mode:
// minify: false,
// define: {
//     "process.env.NODE_ENV": JSON.stringify("development"), // Tells libraries like Lit to use development build
//   }, set to minify: false
//
// for production mode:
// minify: true,
// define: {
//     "process.env.NODE_ENV": JSON.stringify("development"), // Tells libraries like Lit to use development build
//   }, set to minify: false
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'), // Tells libraries like Lit to use dev build
  },
})

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs)
} else {
  console.log('Build successful. ./public/components/client-components.js created.')
}

// Server Configuration
const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // 1. Auth Routes (Better-Auth)
    // Intercepts /api/auth/* requests (signin, signup, session, etc.)
    if (path.startsWith('/api/auth')) {
      return auth.handler(req)
    }

    // 2. API Routes
    if (path.startsWith('/api/')) {
      return handleApiRoutes(req, path)
    }

    // 3. Serve Bundled Components (Cached)
    if (path === '/components/client-components.js') {
      console.log('Serving bundled components (cached)')
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: {
          'Content-Type': 'text/javascript',
          // Disable cache for development
          // 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          // Pragma: 'no-cache',
          // Expires: '0',
        },
      })
    }

    // 4. Static Assets (CSS, JS, Images)
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

    // 5. HTML Pages (Routing)
    if (path === '/') {
      return serveHtmlPage('./public/index.html')
    }

    // Default: Try to find a matching HTML file in /public/views
    return serveHtmlPage('./public/views' + path)
  },
})

// --- Helper Functions ---

// Serves a static file from the public directory.
async function serveStatic(path) {
  const file = Bun.file(`./public${path}`)

  // Check if file exists to avoid serving empty bodies with wrong headers
  if (!(await file.exists())) {
    return serve404()
  }

  return new Response(file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

// Serves an HTML file, returning 404 if missing.
async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath)

  if (!(await pageFile.exists())) {
    return serve404()
  }

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
