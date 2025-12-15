// src/server.js
// version 1.8 Gemini 2.0 Flash
// Changes:
// - Added 'process.env.TEMP_PASSWORD_LAPSE_HOURS' to Bun.build defines.

import { auth } from './auth.js'
import { db } from './db-setup.js'
import { handleApiRoutes } from './routes/api.js'
import { hashPassword } from 'better-auth/crypto'

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
    // Expose the config to the client bundle
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

    if (path.startsWith('/api/auth')) {
      return auth.handler(req)
    }
    if (path.startsWith('/api/admin/')) {
      return handleAdminRoutes(req, path)
    }
    if (path.startsWith('/api/')) {
      return handleApiRoutes(req, path)
    }
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
    if (path === '/') {
      return serveHtmlPage('./public/index.html')
    }
    return serveHtmlPage('./public/views' + path)
  },
})

async function handleAdminRoutes(req, path) {
  // --- ROUTE: GET /api/admin/users ---
  if (path === '/api/admin/users' && req.method === 'GET') {
    try {
      const session = await auth.api.getSession({ headers: req.headers })

      if (!session || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

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
          requiresPasswordChange,
          tempPasswordExpiresAt
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
  if (path === '/api/admin/reset-password' && req.method === 'POST') {
    try {
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

      const hashedPassword = await hashPassword(newPassword)

      // 1. Update Credential
      const accountUpdate = db
        .prepare(`UPDATE account SET password = ? WHERE userId = ? AND providerId = 'credential'`)
        .run(hashedPassword, userId)

      if (accountUpdate.changes === 0) {
        const now = new Date().toISOString()
        db.prepare(
          `
           INSERT INTO account (id, userId, accountId, providerId, password, createdAt, updatedAt)
           VALUES (?, ?, ?, 'credential', ?, ?, ?)
         `,
        ).run(crypto.randomUUID(), userId, userId, hashedPassword, now, now)
      }

      // 2. Update User Flags
      // Use the env var here as well for consistency, or default to 48
      const hours = parseInt(process.env.TEMP_PASSWORD_LAPSE_HOURS || '48')
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

      db.prepare(
        'UPDATE user SET requiresPasswordChange = 1, tempPasswordExpiresAt = ? WHERE id = ?',
      ).run(expiresAt, userId)

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

  // --- DELETE USER ---
  if (path === '/api/admin/delete-user' && req.method === 'POST') {
    try {
      const session = await auth.api.getSession({ headers: req.headers })
      if (!session || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const body = await req.json()
      const { userId } = body

      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing userId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Security Check: Last Admin
      const targetUser = db.prepare('SELECT role FROM user WHERE id = ?').get(userId)

      if (targetUser && targetUser.role === 'admin') {
        const result = db.prepare('SELECT COUNT(*) as count FROM user WHERE role = ?').get('admin')
        if (result.count <= 1) {
          return new Response(
            JSON.stringify({
              error: 'Security Restriction: You cannot delete the last Administrator.',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      }

      const result = await auth.api.removeUser({
        body: { userId },
        headers: req.headers,
      })

      if (result.error) throw new Error(result.error.message)

      return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Delete User Error:', error)
      return new Response(JSON.stringify({ error: error.message || 'Failed to delete user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // --- SEED ADMIN ---
  if (path === '/api/admin/seed' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name } = body

      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'Missing email, password, or name' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const users = await auth.api.listUsers({
        query: { limit: 1 },
      })

      if (users && users.length > 0) {
        return new Response(JSON.stringify({ error: 'Setup already complete. Users exist.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const newUser = await auth.api.signUp({
        body: {
          email,
          password,
          name,
          role: 'admin',
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

async function serveStatic(path) {
  const file = Bun.file(`./public${path}`)
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
