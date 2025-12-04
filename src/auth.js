// version 3.0 Gemini 2.5 Pro (Added Password Change Hook)
// lib/auth.js
import { betterAuth } from 'better-auth'
import { db } from './db-setup.js'

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      requiresPasswordChange: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  // Add server-side hooks to handle logic automatically
  hooks: {
    after: [
      {
        // 1. Listen for the "change-password" action
        matcher: (context) => context.path.startsWith('/change-password'),

        // 2. Run this function after the password change attempts
        handler: async (ctx) => {
          // If the password change was successful (status 200) and we have a session
          if (ctx.response.status === 200 && ctx.session) {
            try {
              // 3. Automatically set the flag to false
              // We use the internal API to update the user directly
              await auth.api.updateUser({
                body: { requiresPasswordChange: false },
                headers: ctx.request.headers, // Pass headers to ensure auth context is valid
              })
              console.log(`Password reset flag cleared for user: ${ctx.session.user.email}`)
            } catch (err) {
              console.error('Failed to clear password reset flag:', err)
            }
          }
        },
      },
    ],
  },
})
