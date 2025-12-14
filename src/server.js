// src/server.js
// version 1.6 Gemini 2.0 Flash
// Changes:
// - Added 'GET /api/admin/users' handler to handleAdminRoutes.
// - Performs Admin role check using better-auth.
// - returns list of users from SQLite db.

import { auth } from './auth.js'
import { db } from './db-setup.js' // Imports the DB and triggers table creation
import { handleApiRoutes } from './routes/api.js'

import { hashPassword } from 'better-auth/crypto'

// Re-export db so existing models referencing 'server.js' don't break
export { db }

// Define Port explicitly
const PORT = process.env.PORT || 3000

// Bundle the client components on server start.
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
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
    // Intercepts /api/auth/* requests (signin, signup, session, admin plugin routes etc.)
    if (path.startsWith('/api/auth')) {
      return auth.handler(req)
    }

    // 2. Admin API Routes (Custom)
    // Handles custom server-side admin logic (like initial seeding)
    // This is separate from the Better-Auth Admin Plugin routes (which are under /api/auth/admin)
    if (path.startsWith('/api/admin/')) {
      return handleAdminRoutes(req, path)
    }

    // 3. API Routes (General)
    if (path.startsWith('/api/')) {
      return handleApiRoutes(req, path)
    }

    // 4. Serve Bundled Components (Cached)
    if (path === '/components/client-components.js') {
      console.log('Serving bundled components (cached)')
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: {
          'Content-Type': 'text/javascript',
        },
      })
    }

    // 5. Static Assets (CSS, JS, Images)
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

    // 6. HTML Pages (Routing)
    if (path === '/') {
      return serveHtmlPage('./public/index.html')
    }

    // Default: Try to find a matching HTML file in /public/views
    return serveHtmlPage('./public/views' + path)
  },
})

// --- Helper Functions ---

// Handles Custom Admin Routes (e.g. Seeding, User Lists)
async function handleAdminRoutes(req, path) {
  // --- ROUTE: GET /api/admin/users ---
  // Usage: Lists all users for the Admin dashboard
  if (path === '/api/admin/users' && req.method === 'GET') {
    try {
      // 1. Check Session & Role
      const session = await auth.api.getSession({ headers: req.headers })

      if (!session || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // 2. Query Database
      // Note: 'requiresPasswordChange' implies a custom schema extension.
      // If this column doesn't exist, this query will fail. Ensure schema matches.
      const users = db
        .prepare(
          `
        SELECT
        id,
          name,
          email,
          createdAt,
          updatedAt,
          role,
          requiresPasswordChange
        FROM user
        ORDER BY name ASC
      `,
        )
        .all()

      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Fetch Users Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // --- ROUTE: POST /api/admin/reset-password ---
  // Usage: Admin resets a user's password and sets the force-change flag
  // Inside handleAdminRoutes function in src/server.js

  if (path === '/api/admin/reset-password' && req.method === 'POST') {
    try {
      // 1. Check Session & Role
      const session = await auth.api.getSession({ headers: req.headers })

      if (!session || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const body = await req.json()
      const { userId, newPassword } = body

      if (!userId || !newPassword) {
        return new Response(JSON.stringify({ error: 'Missing userId or newPassword' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // 2. Hash Password (Use Bun's native password hashing)
      // FIX: Hash the variable 'newPassword', not the string literal 'newPassword'
      const hashedPassword = await hashPassword(newPassword)

      // 3. Update 'account' table directly
      // FIX: Use db.prepare().run() (Bun syntax) instead of db.run()
      // NOTE: This SQL assumes the user already has a 'credential' entry.
      // If they strictly use OAuth (Google/GitHub), this UPDATE will affect 0 rows.
      const accountUpdate = db
        .prepare(`UPDATE account SET password = ? WHERE userId = ? AND providerId = 'credential'`)
        .run(hashedPassword, userId)

      // Optional: Handle case where user had no password credential before (e.g. Google login only)
      if (accountUpdate.changes === 0) {
        // Insert a new credential row if update failed
        const now = new Date().toISOString()
        db.prepare(
          `
           INSERT INTO account (id, userId, accountId, providerId, password, createdAt, updatedAt)
           VALUES (?, ?, ?, 'credential', ?, ?, ?)
         `,
        ).run(crypto.randomUUID(), userId, userId, hashedPassword, now, now)
      }

      // 4. Update 'user' table flag
      db.prepare('UPDATE user SET requiresPasswordChange = 1 WHERE id = ?').run(userId)

      return new Response(JSON.stringify({ success: true, message: 'Password reset successful' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Reset Password Error:', error)
      return new Response(JSON.stringify({ error: error.message || 'Failed to reset password' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // --- ROUTE: POST /api/admin/seed ---
  // Usage: Creates the initial Admin user if one does not exist.
  if (path === '/api/admin/seed' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name } = body

      // Basic validation
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'Missing email, password, or name' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Check if ANY user exists (Safety check to ensure this is only used for first user)
      const users = await auth.api.listUsers({
        query: { limit: 1 },
      })

      if (users && users.length > 0) {
        return new Response(JSON.stringify({ error: 'Setup already complete. Users exist.' }), {
          status: 403, // Forbidden
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Create the Admin User
      const newUser = await auth.api.signUp({
        body: {
          email,
          password,
          name,
          role: 'admin', // Explicitly set role to admin
        },
      })

      return new Response(JSON.stringify({ success: true, user: newUser }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Admin Seed Error:', error)
      return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Admin route not found', { status: 404 })
}

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
