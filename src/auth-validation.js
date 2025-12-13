export const PASSWORD_MIN_LENGTH = 8

// Rule: Min 8 chars, at least 1 uppercase, at least 1 number
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/

/**
 * Validates a password against the rules.
 * Returns an error string if invalid, or null if valid.
 * @param {string} password
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.'
  }

  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 number.'
  }

  return null
}
