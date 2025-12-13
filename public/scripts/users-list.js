// public/scripts/users-list.js
// version 1.0 Gemini 2.0 Flash

document.addEventListener('DOMContentLoaded', async () => {
  const usersContainer = document.getElementById('usersResult')
  const loadingMessage = document.getElementById('loadingMessage')
  const errorMessage = document.getElementById('errorMessage')

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
        const created = user.createdAt
          ? new Date(user.createdAt).toLocaleString('en-GB', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '-'
        const updated = user.updatedAt
          ? new Date(user.updatedAt).toLocaleString('en-GB', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '-'
        const pwChange = user.requiresPasswordChange ? 'Yes' : 'No'
        const name = user.name || '-'
        const email = user.email || '-'
        const role = user.role || 'user'

        return `
        <tr
          class="hover:bg-primary-50 transition-colors cursor-pointer user-row"
          data-email="${email}"
        >
          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6">${name}</td>
          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500">${email}</td>
          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500 capitalize">${role}</td>
          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500">${created}</td>
          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500">${updated}</td>
          <td class="whitespace-nowrap text-center px-3 py-4 text-xs text-gray-500">${pwChange}</td>
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
        const email = row.getAttribute('data-email')
        console.log(`Row ${email} clicked`)
      })
    })
  } catch (error) {
    console.error('Failed to load users:', error)
    loadingMessage.classList.add('hidden')
    errorMessage.textContent = error.message || 'Failed to load user list.'
    errorMessage.classList.remove('hidden')
  }
})
