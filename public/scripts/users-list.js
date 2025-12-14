// public/scripts/users-list.js
// version 1.2 Gemini 2.0 Flash
// Changes:
// - Updated contextmenu handler to dispatch 'request-password-reset' to the window
// - Removed direct DOM manipulation of the modal

document.addEventListener('DOMContentLoaded', async () => {
  const usersContainer = document.getElementById('usersResult')
  const loadingMessage = document.getElementById('loadingMessage')
  const errorMessage = document.getElementById('errorMessage')

  // Helper to safely escape JSON for insertion into data attribute
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  try {
    const response = await fetch('/api/admin/users')

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Unauthorized. Admin access required.')
      }
      throw new Error(`Error fetching users: ${response.statusText}`)
    }

    const users = await response.json()

    loadingMessage.classList.add('hidden')

    if (users.length === 0) {
      usersContainer.innerHTML =
        '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No users found</td></tr>'
      return
    }

    const htmlRows = users
      .map((user) => {
        // Format dates safely
        const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'
        const updated = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '-'
        const pwChange = user.requiresPasswordChange ? 'Yes' : 'No'
        const name = user.name || '-'
        const email = user.email || '-'
        const role = user.role || 'user'

        // We store the specific fields we need for the modal in the data attribute
        const safeUserData = escapeHtml(
          JSON.stringify({
            id: user.id,
            name: name,
            email: email,
            role: role,
          }),
        )

        return `
        <tr
          class="hover:bg-primary-50 transition-colors cursor-pointer user-row"
          data-user="${safeUserData}"
          title="Right-click to reset password"
        >
          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">${name}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${email}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">${role}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${created}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${updated}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${pwChange}</td>
        </tr>
      `
      })
      .join('')

    usersContainer.innerHTML = htmlRows

    // Attach Right Click Event Listeners
    const rows = document.querySelectorAll('.user-row')
    rows.forEach((row) => {
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault() // Prevent default browser context menu

        try {
          // Parse user data from the row
          const userData = JSON.parse(row.getAttribute('data-user'))

          // Dispatch global event for the header to pick up
          window.dispatchEvent(
            new CustomEvent('request-password-reset', {
              detail: userData,
              bubbles: true,
              composed: true,
            }),
          )

          console.log(`Requested password reset for: ${userData.email}`)
        } catch (err) {
          console.error('Error parsing user data for modal:', err)
        }
      })
    })
  } catch (error) {
    console.error('Failed to load users:', error)
    loadingMessage.classList.add('hidden')
    errorMessage.textContent = error.message || 'Failed to load user list.'
    errorMessage.classList.remove('hidden')
  }
})
