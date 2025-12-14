// public/components/rm-reset-password-modal.js
// version 1.0 Gemini 2.0 Flash
import { LitElement, html, css } from 'lit'
import { validatePassword } from '../auth-validation.js'

export class RmResetPasswordModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    user: { type: Object }, // The user object passed from the list
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true },
    _password: { state: true }, // Only tracking password locally, other data comes from 'user' prop
    _passwordError: { state: true },
  }

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .text-red-600 {
      color: #dc2626;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .mt-1 {
      margin-top: 0.25rem;
    }
  `

  constructor() {
    super()
    this.isOpen = false
    this.user = null
    this._isLoading = false
    this._errorMessage = ''
    this._successMessage = ''
    this._passwordError = null
    this._password = this._generateStrongPassword()
  }

  updated(changedProperties) {
    // When modal opens, regenerate password and clear messages
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._resetFormState()
    }
  }

  _generateStrongPassword() {
    const length = 12
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const numbers = '23456789'
    const all = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'

    let result = ''
    result += upper.charAt(Math.floor(Math.random() * upper.length))
    result += numbers.charAt(Math.floor(Math.random() * numbers.length))

    for (let i = 2; i < length; i++) {
      result += all.charAt(Math.floor(Math.random() * all.length))
    }

    return result
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')
  }

  _regeneratePassword() {
    this._password = this._generateStrongPassword()
    this._passwordError = null
    this.requestUpdate()
  }

  _handlePasswordInput(e) {
    this._password = e.target.value
    this._passwordError = validatePassword(this._password)
  }

  _getMailtoLink() {
    if (!this.user) return '#'

    const subject = encodeURIComponent('Password Reset for BunStarter')
    const body = encodeURIComponent(
      `Hello ${this.user.name || 'User'},

Your password has been reset.

URL: ${window.location.origin}
Email: ${this.user.email}
Password: ${this._password}

Please log in and change your password immediately.`,
    )
    return `mailto:${this.user.email}?subject=${subject}&body=${body}`
  }

  async _handleSubmit(e) {
    e.preventDefault()
    if (!this.user || !this.user.id) return

    this._isLoading = true
    this._errorMessage = ''
    this._successMessage = ''

    // Client-Side Validation
    const validationError = validatePassword(this._password)
    if (validationError) {
      this._passwordError = validationError
      this._isLoading = false
      return
    }

    try {
      // Call our custom server route
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.user.id,
          newPassword: this._password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }

      this._successMessage = 'Password reset successfully!'

      // Delay closing
      setTimeout(() => {
        this._close()
      }, 1500)
    } catch (err) {
      this._errorMessage = err.message || 'Failed to reset password.'
    } finally {
      this._isLoading = false
    }
  }

  _close() {
    this.isOpen = false
    this.dispatchEvent(new Event('close-modal'))
  }

  _resetFormState() {
    this._password = this._generateStrongPassword()
    this._errorMessage = ''
    this._successMessage = ''
    this._passwordError = null
  }

  render() {
    const overlayState = this.isOpen
      ? 'opacity-100 pointer-events-auto visible'
      : 'opacity-0 pointer-events-none invisible'

    // Safety check if user data hasn't loaded yet
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
          class="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl"
        >
          <button
            @click="${this._close}"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 class="mb-6 text-2xl font-bold text-gray-800">Reset Password</h2>

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

          <form @submit="${this._handleSubmit}">
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                .value="${userData.name}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500"
              />
            </div>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                .value="${userData.email}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500"
              />
            </div>

            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-gray-600"
                  >New Temporary Password</label
                >
                <a
                  href="${this._getMailtoLink()}"
                  class="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email New Password
                </a>
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  id="password"
                  name="password"
                  .value="${this._password}"
                  @input="${this._handlePasswordInput}"
                  required
                  class="focus:ring-primary-200 focus:border-primary-500 ${this._passwordError
                    ? 'border-red-500'
                    : 'border-gray-300'} flex-1 rounded border p-3 font-mono text-sm tracking-wider transition duration-200 focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  @click="${this._regeneratePassword}"
                  class="rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 transition-colors hover:bg-gray-200"
                  title="Regenerate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              ${this._passwordError
                ? html`<p class="mt-1 text-xs text-red-600">${this._passwordError}</p>`
                : html`<p class="mt-1 text-xs text-gray-400">
                    Must be 8+ chars, include 1 uppercase & 1 number.
                  </p>`}
            </div>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                .value="${userData.role}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500 capitalize"
              />
            </div>

            <div class="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                checked
                disabled
                class="text-primary-400 h-4 w-4 cursor-not-allowed rounded border-gray-300 bg-gray-100"
              />
              <label class="text-sm text-gray-500 select-none">
                Force password change on next login (Required)
              </label>
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <button
                type="button"
                @click="${this._close}"
                class="rounded bg-gray-100 px-4 py-2 font-medium text-gray-700 transition duration-200 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                ?disabled="${this._isLoading || !!this._passwordError}"
                class="bg-primary-500 hover:bg-primary-600 rounded px-4 py-2 font-bold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ${this._isLoading ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `
  }
}

customElements.define('rm-reset-password-modal', RmResetPasswordModal)
