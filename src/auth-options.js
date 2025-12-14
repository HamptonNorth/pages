// src/auth-options.js
import { admin } from 'better-auth/plugins'
import { APIError } from 'better-auth/api'
import { validatePassword } from './auth-validation.js'

// ❌ REMOVED: import { db } ...
// ❌ REMOVED: passwordResetPlugin (Moved to src/auth.js)

/**
 * Pure Logic Plugin: Strong Password Validation
 * Safe to share between Node and Bun because it has no DB dependencies.
 */
const passwordValidationPlugin = {
  id: 'password-validation-plugin',
  hooks: {
    before: [
      {
        matcher: (context) => {
          return (
            context.path.includes('/sign-up/email') || context.path.includes('/change-password')
          )
        },
        handler: async (ctx) => {
          const body = ctx.body
          const passwordToCheck = body.password || body.newPassword

          if (passwordToCheck) {
            const errorMsg = validatePassword(passwordToCheck)
            if (errorMsg) {
              throw new APIError('BAD_REQUEST', {
                message: errorMsg,
              })
            }
          }
        },
      },
    ],
  },
}

export const authOptions = {
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Optional: Add scope if you need more than email/profile
      // scope: ["profile", "email"],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      requiresPasswordChange: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  // Only include plugins that work EVERYWHERE
  plugins: [admin(), passwordValidationPlugin],
}
