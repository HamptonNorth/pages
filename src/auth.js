// version 1.3 Gemini 2.5 Pro
// src/auth.js
import { betterAuth } from 'better-auth'
import { authOptions } from './auth-options.js'
import { db } from './db-setup.js' // ✅ Safe: This is Bun-only

// 🟢 Define the Bun-specific plugin here
// bun-password-reset-plugin.js (Updated)

// src/auth.js (Snippet)

// src/auth.js (Updated Plugin)

const bunPasswordResetPlugin = {
  id: 'password-reset-plugin',
  hooks: {
    after: [
      {
        matcher: (context) => context.path.includes('/change-password'),
        handler: async (ctx) => {
          console.log('🪝 [PasswordResetPlugin] Hook Triggered')

          // 1. LOCATE THE SESSION
          // The logs showed 'session' isn't at the top level, but 'context' is.
          // We check both locations to be safe.
          const session = ctx.session || ctx.context?.session
          const userEmail = session?.user?.email

          // DEBUG: Verify we found the session this time
          if (!session) {
            console.log('🔍 Inspecting ctx.context:', Object.keys(ctx.context || {}))
          }

          if (userEmail) {
            console.log(`[PasswordResetPlugin] Targeting user email: ${userEmail}`)
            try {
              // 2. UPDATE DB
              const query = db.query(
                'UPDATE "user" SET "requiresPasswordChange" = 0 WHERE "email" = $email',
              )
              const result = query.run({ $email: userEmail })

              if (result.changes > 0) {
                console.log(`✅ [PasswordResetPlugin] Flag cleared for ${userEmail}`)
              } else {
                console.warn(`⚠️ [PasswordResetPlugin] No user found to update.`)
              }
            } catch (err) {
              console.error('❌ [PasswordResetPlugin] DB Error:', err)
            }
          } else {
            console.error(
              '❌ [PasswordResetPlugin] Still could not find email. Session is missing.',
            )
          }

          // 3. PREVENT CRASH
          // Ensure we return a valid response object even if the original was undefined
          return (
            ctx.response || {
              headers: new Headers(),
              body: { success: true },
              status: 200,
            }
          )
        },
      },
    ],
  },
}

export const auth = betterAuth({
  database: db,
  ...authOptions,
  plugins: [...(authOptions.plugins || []), bunPasswordResetPlugin],
})
