// scripts/node-auth-config.js
import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import { authOptions } from '../../src/auth-options.js'

// This file is used ONLY by the CLI tool via Node
const db = new Database('data/app3.db')
// Plugin to handle password reset logic
// This keeps the hook logic isolated and safe from config merging bugs
// Plugin to handle password reset logic
const passwordResetPlugin = {
  id: 'password-reset-plugin',
  hooks: {
    after: [
      {
        matcher: (context) => context.path.includes('/change-password'),
        handler: async (ctx) => {
          const session = ctx.session || ctx.context?.session
          const response = ctx.response

          if (response && (response.status === 200 || response.status === 201) && session) {
            try {
              console.log(
                `Password changed successfully for ${session.user.email}. Clearing flag...`,
              )
              // Note: ensure 'auth' is available/hoisted or accessible here
              await auth.api.updateUser({
                body: { requiresPasswordChange: false },
                headers: ctx.request.headers,
              })
              console.log(`Flag cleared.`)
            } catch (err) {
              console.error('Failed to clear password reset flag:', err)
            }
          }
        },
      },
    ],
  },
}
export const auth = betterAuth({
  database: db,
  ...authOptions,
  plugins: [passwordResetPlugin],
})
