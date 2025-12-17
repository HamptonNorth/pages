// Changes:
// - Added 'tempPasswordExpiresAt' to user.additionalFields.

import { admin } from 'better-auth/plugins'
import { APIError } from 'better-auth/api'
import { validatePassword } from './auth-validation.js'

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
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      // NEW: Store when the temporary password expires
      tempPasswordExpiresAt: {
        type: 'date',
        required: false,
      },
    },
  },
  plugins: [admin(), passwordValidationPlugin],
}
