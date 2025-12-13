// version 1.0 Gemini 2.5 Pro
// public/components/rm-add-user.js

import { LitElement, html, nothing } from 'lit'

export class RmAddUserModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    _isLoading: { state: true },
    _error: { state: true },
    _successPassword: { state: true }, // Stores the generated password on success
  }

  constructor() {
    super()
    this.isOpen = false
    this._isLoading = false
    this._error = null
    this._successPassword = null
  }

  createRenderRoot() {
    return this // Use light DOM for global Tailwind styles
  }

  close() {
    this.isOpen = false
    this._error = null
    this._successPassword = null
    this.dispatchEvent(new CustomEvent('close'))
  }

  async _handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    const email = formData.get('email')

    this._isLoading = true
    this._error = null
    this._successPassword = null

    try {
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user')
      }

      // Success: Show the password
      this._successPassword = data.tempPassword
      e.target.reset() // Clear the form
    } catch (err) {
      console.error(err)
      this._error = err.message
    } finally {
      this._isLoading = false
    }
  }

  copyPassword() {
    if (this._successPassword) {
      navigator.clipboard.writeText(this._successPassword)
      // Optional: Show a small "Copied!" toast here
    }
  }

  render() {
    if (!this.isOpen) return nothing

    return html`
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click="${this.close}"
      >
        <div
          class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
          @click="${(e) => e.stopPropagation()}"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-800">Add New User</h3>
            <button
              @click="${this.close}"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          ${this._successPassword
            ? html`
                <div class="rounded-md border border-green-200 bg-green-50 p-4 text-center">
                  <div class="mb-2 flex justify-center">
                    <svg
                      class="h-10 w-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-green-800">User Created Successfully!</h4>
                  <p class="mt-1 text-sm text-green-600">
                    Share these credentials securely with the user.
                  </p>

                  <div
                    class="mt-4 flex items-center justify-between rounded border border-green-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <code class="text-primary-700 font-mono text-lg font-bold tracking-wider">
                      ${this._successPassword}
                    </code>
                    <button
                      @click="${this.copyPassword}"
                      class="text-primary-600 hover:text-primary-800 text-sm font-semibold hover:underline"
                    >
                      Copy
                    </button>
                  </div>

                  <button
                    @click="${this.close}"
                    class="mt-6 w-full rounded bg-green-600 px-4 py-2 font-bold text-white transition-colors hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              `
            : html`
                <form @submit="${this._handleSubmit}">
                  ${this._error
                    ? html`
                        <div
                          class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                        >
                          ${this._error}
                        </div>
                      `
                    : nothing}

                  <div class="mb-4">
                    <label class="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      class="focus:border-primary-500 focus:ring-primary-500 w-full rounded border border-gray-300 p-2 focus:ring-1 focus:outline-none"
                      placeholder="e.g. John Stone"
                    />
                  </div>

                  <div class="mb-6">
                    <label class="mb-1 block text-sm font-medium text-gray-700"
                      >Email Address</label
                    >
                    <input
                      type="email"
                      name="email"
                      required
                      class="focus:border-primary-500 focus:ring-primary-500 w-full rounded border border-gray-300 p-2 focus:ring-1 focus:outline-none"
                      placeholder="e.g. jstone@company.com"
                    />
                  </div>

                  <div class="flex justify-end gap-3">
                    <button
                      type="button"
                      @click="${this.close}"
                      class="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      ?disabled="${this._isLoading}"
                      class="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded px-4 py-2 text-sm font-bold text-white focus:outline-none disabled:opacity-50"
                    >
                      ${this._isLoading
                        ? html`
                            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                              ></circle>
                              <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating...
                          `
                        : 'Create User'}
                    </button>
                  </div>
                </form>
              `}
        </div>
      </div>
    `
  }
}

customElements.define('rm-add-user-modal', RmAddUserModal)
