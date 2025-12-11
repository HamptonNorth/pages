// src/auth.js
// version 3.2 Gemini 2.5 Pro
// Fixed: Passed 'db' directly to 'database' config to fix "selectFrom is not a function" error.
// The library will now correctly auto-detect this as a bun:sqlite instance and wrap it.

import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'

import { authOptions } from './auth-options.js'

import { db } from './db-setup.js'

// Plugin to handle password reset logic
// This keeps the hook logic isolated and safe from config merging bugs
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
  // FIX: Pass the raw db instance directly.
  // Do not wrap it in an object { db: db } or Better-Auth assumes it's already a Kysely instance.
  database: db,
  ...authOptions,
  // ---------------------------------------------------------
  // ADDED: Register the local plugin and merge with existing ones
  // ---------------------------------------------------------
  //

  plugins: [
    passwordResetPlugin,
    ...(authOptions.plugins || []), // Preserves plugins from authOptions if they exist
  ],
})
