// - Implemented custom right-click context menu logic
// - Handles 'Reset Password' and 'Delete User' via global events
// - Hides menu on document click

document.addEventListener('DOMContentLoaded', async () => {
  const usersContainer = document.getElementById('usersResult')
  const loadingMessage = document.getElementById('loadingMessage')
  const errorMessage = document.getElementById('errorMessage')

  // Context Menu Elements
  const contextMenu = document.getElementById('userContextMenu')
  const ctxResetBtn = document.getElementById('ctxResetPassword')
  const ctxDeleteBtn = document.getElementById('ctxDeleteUser')

  let currentTargetUser = null

  // Helper to safely escape JSON for insertion into data attribute
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // --- Context Menu Functions ---

  const hideContextMenu = () => {
    if (contextMenu) {
      contextMenu.classList.add('hidden')
    }
    currentTargetUser = null
  }

  const showContextMenu = (e, userData) => {
    if (!contextMenu) return

    currentTargetUser = userData

    // Position menu at mouse coordinates
    contextMenu.style.top = `${e.clientY}px`
    contextMenu.style.left = `${e.clientX}px`

    contextMenu.classList.remove('hidden')
  }

  // Global click listener to close menu when clicking elsewhere
  document.addEventListener('click', hideContextMenu)

  // Prevent context menu from closing if clicking inside it
  if (contextMenu) {
    contextMenu.addEventListener('click', (e) => e.stopPropagation())
  }

  // Button Handlers
  if (ctxResetBtn) {
    ctxResetBtn.addEventListener('click', () => {
      if (currentTargetUser) {
        window.dispatchEvent(
          new CustomEvent('request-password-reset', {
            detail: currentTargetUser,
            bubbles: true,
            composed: true,
          }),
        )
      }
      hideContextMenu()
    })
  }

  if (ctxDeleteBtn) {
    ctxDeleteBtn.addEventListener('click', () => {
      if (currentTargetUser) {
        window.dispatchEvent(
          new CustomEvent('request-delete-user', {
            detail: currentTargetUser,
            bubbles: true,
            composed: true,
          }),
        )
      }
      hideContextMenu()
    })
  }

  // --- Fetch Users ---

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
          title="Right-click for options"
        >
          <td class="whitespace-nowrap py-4 pl-2 pr-3 text-xs font-medium text-gray-900 sm:pl-6">${name}</td>
          <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">${email}</td>
          <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500 capitalize">${role}</td>
          <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">${created}</td>
          <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">${updated}</td>
          <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500 text-center">${pwChange}</td>
        </tr>
      `
      })
      .join('')

    usersContainer.innerHTML = htmlRows

    // Attach Right Click Event Listeners to Rows
    const rows = document.querySelectorAll('.user-row')
    rows.forEach((row) => {
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault() // Prevent default browser context menu

        try {
          // Parse user data from the row
          const userData = JSON.parse(row.getAttribute('data-user'))

          showContextMenu(e, userData)
        } catch (err) {
          console.error('Error parsing user data for menu:', err)
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
