// src/auth.js
// version 1.8 Gemini 2.5 Pro
// Changes:
// - FIXED: Added safety check for 'ctx.body' in 'before' hook to prevent crashes.
// - FIXED: Quoted table name "user" in SQL query for safety.
// - Added debug logs to trace login validation.

import { betterAuth } from 'better-auth'
import { authOptions } from './auth-options.js'
import { db } from './db-setup.js' // Bun:sqlite database instance
import { APIError } from 'better-auth/api'

// Plugin: Clear 'requiresPasswordChange' flag after successful password change
const bunPasswordResetPlugin = {
  id: 'password-reset-plugin',
  hooks: {
    after: [
      {
        matcher: (context) => context.path.includes('/change-password'),
        handler: async (ctx) => {
          const session = ctx.session || ctx.context?.session
          const userEmail = session?.user?.email

          if (userEmail) {
            try {
              db.run(
                'UPDATE "user" SET "requiresPasswordChange" = 0, "tempPasswordExpiresAt" = NULL WHERE "email" = $email',
                { $email: userEmail },
              )
            } catch (err) {
              console.error('❌ [PasswordResetPlugin] DB Error:', err)
            }
          }
          return ctx.response || { status: 200, headers: new Headers(), body: { success: true } }
        },
      },
    ],
  },
}

// Plugin: Enforce Temporary Password Expiration
const tempPasswordPlugin = {
  id: 'temp-password-plugin',
  hooks: {
    // 1. BLOCK LOGIN if password has lapsed
    before: [
      {
        matcher: (context) => context.path.includes('/sign-in/email'),
        handler: async (ctx) => {
          // Safety: Ensure body exists before destructuring
          if (!ctx.body) return

          const { email } = ctx.body
          if (!email) return

          try {
            // Fetch user flags safely
            const user = db
              .prepare(
                'SELECT "requiresPasswordChange", "tempPasswordExpiresAt" FROM "user" WHERE "email" = ?',
              )
              .get(email)

            // Logic: Only check expiration if BOTH flag is set AND expiry date exists
            if (user && user.requiresPasswordChange && user.tempPasswordExpiresAt) {
              const now = new Date()
              const expiresAt = new Date(user.tempPasswordExpiresAt)

              if (now > expiresAt) {
                console.warn(`⛔ Blocked login for ${email}: Temporary password expired.`)
                throw new APIError('FORBIDDEN', {
                  message:
                    'Temporary password has expired (48hr limit). Please contact your administrator.',
                })
              }
            }
          } catch (err) {
            // Re-throw APIErrors (like Forbidden), log others
            if (err instanceof APIError) throw err
            console.error('❌ [TempPasswordPlugin] Error checking expiry:', err)
            // We don't block login on DB error, but we log it
          }
        },
      },
    ],
    // 2. SET EXPIRATION automatically when a new user is created
    after: [
      {
        matcher: (context) => context.path.includes('/sign-up/email'),
        handler: async (ctx) => {
          const response = ctx.response
          if (!response) {
            return {
              status: 200,
              headers: new Headers(),
              body: { success: true },
            }
          }

          let body
          try {
            if (response instanceof Response) {
              body = await response.clone().json()
            } else {
              body = response.body
            }
          } catch (e) {
            return response
          }

          if (body && body.user && body.user.requiresPasswordChange) {
            const userId = body.user.id
            // Default 48h if not provided (though modal usually provides it now)
            const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

            try {
              // Only set if not already set (modal might have set it via `data` param)
              // But strictly updating here ensures consistency if `data` was missed
              db.run(
                'UPDATE "user" SET "tempPasswordExpiresAt" = COALESCE("tempPasswordExpiresAt", $date) WHERE "id" = $id',
                {
                  $date: expiresAt,
                  $id: userId,
                },
              )
              console.log(`🕒 Checked/Set password expiration for new user: ${body.user.email}`)
            } catch (err) {
              console.error('Failed to set expiration date:', err)
            }
          }
          return response
        },
      },
    ],
  },
}

export const auth = betterAuth({
  database: db,
  ...authOptions,
  plugins: [...(authOptions.plugins || []), bunPasswordResetPlugin, tempPasswordPlugin],
})
