// version 1.0 Gemini 2.5 Pro
// server/api/admin-routes.js (Add to your main server router)

import { auth } from '../auth' // Import your auth instance

export async function handleAddUser(req) {
  // 1. Security Check: Ensure requester is an Admin
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session || session.user.role !== 'admin') {
    return new Response('Unauthorized', { status: 403 })
  }

  const { name, email } = await req.json()

  // 2. Generate Secure Temporary Password (8 chars)
  const tempPassword = Math.random().toString(36).slice(-8)

  try {
    // 3. Create User using Better-Auth
    // We use signUpEmail but ignore the returned session headers so the admin doesn't get logged in as the new user
    const newUser = await auth.api.signUpEmail({
      body: {
        email,
        password: tempPassword,
        name,
        role: 'user',
        requiresPasswordChange: true, // Set the flag
      },
    })

    if (!newUser) throw new Error('Failed to create user')

    // 4. Return the temporary password to the Admin
    return Response.json({
      success: true,
      tempPassword: tempPassword,
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
