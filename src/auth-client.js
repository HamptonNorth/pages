import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [adminClient()],
  // Do not hardcode localhost.
  // By omitting baseURL, the client automatically uses the current
  // window.location.origin (e.g., https://bunstarter.redmug.dev or http://localhost:3000)
})
