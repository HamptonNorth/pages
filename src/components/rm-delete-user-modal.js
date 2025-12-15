// public/components/rm-delete-user-modal.js
// version 1.0 Gemini 2.0 Flash
// Description: Modal for confirming user deletion.
// Features: Displays user details, secondary confirmation prompt, calls delete API.

import { LitElement, html, css } from 'lit'
import './rm-button.js'

export class RmDeleteUserModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    user: { type: Object },
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true },
  }

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .text-red-600 {
      color: #dc2626;
    }
  `

  constructor() {
    super()
    this.isOpen = false
    this.user = null
    this._isLoading = false
    this._errorMessage = ''
    this._successMessage = ''
  }

  updated(changedProperties) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._errorMessage = ''
      this._successMessage = ''
    }
  }

  _close() {
    if (this._isLoading) return
    this.isOpen = false
    this.dispatchEvent(new Event('close'))
  }

  async _handleDelete() {
    if (!this.user || !this.user.id) {
      this._errorMessage = 'User ID is missing'
      return
    }

    const confirmed = window.confirm(
      `Are you strictly sure you want to delete ${this.user.name}? This cannot be undone.`,
    )
    if (!confirmed) return

    this._isLoading = true
    this._errorMessage = ''

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Deletion failed')
      }

      this._successMessage = 'User deleted successfully.'

      // Notify parent/header to refresh lists if needed
      this.dispatchEvent(new Event('user-deleted', { bubbles: true, composed: true }))

      setTimeout(() => {
        this._close()
        // Reload page to reflect changes
        window.location.reload()
      }, 1000)
    } catch (err) {
      this._errorMessage = err.message || 'Failed to delete user.'
    } finally {
      this._isLoading = false
    }
  }

  render() {
    const overlayState = this.isOpen
      ? 'opacity-100 pointer-events-auto visible'
      : 'opacity-0 pointer-events-none invisible'

    const userData = this.user || { name: '', email: '', role: '' }

    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <div
        class="${overlayState} fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-200"
        @click="${(e) => {
          if (e.target === e.currentTarget) this._close()
        }}"
      >
        <div
          class="relative mx-4 w-full max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-xl"
        >
          <button
            @click="${this._close}"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 class="mb-2 text-2xl font-bold text-red-700">Delete User</h2>
          <p class="mb-6 text-sm text-gray-500">
            This action is permanent and cannot be undone. The user will lose access immediately.
          </p>

          ${this._errorMessage
            ? html`
                <div class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  ${this._errorMessage}
                </div>
              `
            : ''}
          ${this._successMessage
            ? html`
                <div
                  class="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-600"
                >
                  ${this._successMessage}
                </div>
              `
            : ''}

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-gray-600">User Name</label>
            <input
              type="text"
              .value="${userData.name}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500"
            />
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              .value="${userData.email}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500"
            />
          </div>

          <div class="mb-6">
            <label class="mb-1 block text-sm font-medium text-gray-600">Role</label>
            <input
              type="text"
              .value="${userData.role}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500 capitalize"
            />
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <rm-button variant="outline" @click="${this._close}" ?disabled="${this._isLoading}">
              Cancel
            </rm-button>
            <rm-button
              variant="danger"
              @click="${this._handleDelete}"
              ?loading="${this._isLoading}"
              loading-text="Deleting..."
            >
              Delete User
            </rm-button>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('rm-delete-user-modal', RmDeleteUserModal)
