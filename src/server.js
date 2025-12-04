import { auth } from './auth.js'
import { db, isNewDatabase } from './db-setup.js' // Imports the DB and triggers table creation
import { handleApiRoutes } from './routes/api.js'

// Re-export db so existing models referencing 'server.js' don't break
export { db }

// Database Seeding (If New) ---
// We do this here because 'auth' is fully initialized now.
if (isNewDatabase) {
  console.log('Seeding initial admin user...')

  // Security Check: Ensure environment variables are present
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error(
      'Error: ADMIN_EMAIL or ADMIN_PASSWORD missing from .env file. Skipping admin creation.',
    )
  } else {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: 'rcollins@redmug.co.uk',
          password: 'borland1511',
          name: 'rcollins',
          requiresPasswordChange: false,
        },
      })
      console.log(`Admin user created: ${res.user ? res.user.email : 'Success'}`)
      console.log('--- New app2.db database created and populated successfully ---\n')
    } catch (seedError) {
      console.error('Error seeding admin user:', seedError.message)
    }
  }
}

// Bundle the client components on server start.
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
})

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs)
} else {
  console.log('Build successful. ./public/components/client-components.js created.')
}

// Server Configuration
const server = Bun.serve({
  port: 3000,

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
          'Cache-Control': 'public, max-age=3600',
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
      'Cache-Control': 'public, max-age=3600',
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

console.log(`\nServer running at http://localhost:${server.port}`)
