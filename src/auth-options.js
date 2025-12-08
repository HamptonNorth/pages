// src/auth-options.js
export const authOptions = {
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
}
