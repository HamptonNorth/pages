// version 1.1 Gemini 2.5 Pro (Fix: Removed hardcoded localhost baseURL)
// src/auth-client.js

import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [adminClient()],
  // ERROR FIX: Do not hardcode localhost.
  // By omitting baseURL, the client automatically uses the current
  // window.location.origin (e.g., https://your-site.com or http://localhost:3000)
  // baseURL: "http://localhost:3000"
})
