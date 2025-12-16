import { LitElement, html, css } from 'lit'
import { authClient } from '../auth-client.js'
import { validatePassword } from '../auth-validation.js'

export class RmAddUserModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true },
    _formData: { state: true },
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
    this._isLoading = false
    this._errorMessage = ''
    this._successMessage = ''
    this._passwordError = null

    this._formData = {
      name: '',
      email: '',
      password: this._generateStrongPassword(),
      role: 'user',
      requiresPasswordChange: true,
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
    const newPass = this._generateStrongPassword()
    this._formData = { ...this._formData, password: newPass }
    this._passwordError = null
    this.requestUpdate()
  }

  _handleInput(e) {
    const { name, value, type, checked } = e.target
    this._formData = {
      ...this._formData,
      [name]: type === 'checkbox' ? checked : value,
    }

    if (name === 'password') {
      this._passwordError = validatePassword(value)
    }

    this.requestUpdate()
  }

  _getMailtoLink() {
    const subject = encodeURIComponent('Sign up credentials for BunStarter')
    const body = encodeURIComponent(
      `Hello ${this._formData.name || 'User'},

Here are your login credentials for BunStarter:

URL: ${window.location.origin}
Email: ${this._formData.email}
Password: ${this._formData.password}

Please log in and change your password immediately.`,
    )
    return `mailto:${this._formData.email}?subject=${subject}&body=${body}`
  }

  async _handleSubmit(e) {
    e.preventDefault()
    this._isLoading = true
    this._errorMessage = ''
    this._successMessage = ''

    const validationError = validatePassword(this._formData.password)
    if (validationError) {
      this._passwordError = validationError
      this._isLoading = false
      return
    }

    try {
      const hours = parseInt(process.env.TEMP_PASSWORD_LAPSE_HOURS || '48')
      let expiresAt = null

      if (this._formData.requiresPasswordChange) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)
      }

      const { data, error } = await authClient.admin.createUser({
        name: this._formData.name,
        email: this._formData.email,
        password: this._formData.password,
        role: this._formData.role,
        data: {
          requiresPasswordChange: this._formData.requiresPasswordChange,
          tempPasswordExpiresAt: expiresAt,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      this._successMessage = 'User created successfully!'

      this.dispatchEvent(
        new CustomEvent('user-added', {
          detail: { user: data },
          bubbles: true,
          composed: true,
        }),
      )

      setTimeout(() => {
        this._resetForm()
        this._close()
      }, 1500)
    } catch (err) {
      this._errorMessage = err.message || 'Failed to create user.'
    } finally {
      this._isLoading = false
    }
  }

  _close() {
    this.isOpen = false
    this.dispatchEvent(new Event('close-modal'))
  }

  _resetForm() {
    this._formData = {
      name: '',
      email: '',
      password: this._generateStrongPassword(),
      role: 'user',
      requiresPasswordChange: true,
    }
    this._errorMessage = ''
    this._successMessage = ''
    this._passwordError = null
  }

  render() {
    const overlayState = this.isOpen
      ? 'opacity-100 pointer-events-auto visible'
      : 'opacity-0 pointer-events-none invisible'

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

          <h2 class="mb-6 text-2xl font-bold text-gray-800">Add New User</h2>

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
              <label for="name" class="mb-2 block text-sm font-medium text-gray-600"
                >Full Name</label
              >
              <input
                type="text"
                id="name"
                name="name"
                .value="${this._formData.name}"
                @input="${this._handleInput}"
                required
                placeholder="e.g. Jane Doe"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 p-3 transition duration-200 focus:ring-2 focus:outline-none"
              />
            </div>

            <div class="mb-4">
              <label for="email" class="mb-2 block text-sm font-medium text-gray-600"
                >Email Address</label
              >
              <input
                type="email"
                id="email"
                name="email"
                .value="${this._formData.email}"
                @input="${this._handleInput}"
                required
                placeholder="user@example.com"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 p-3 transition duration-200 focus:ring-2 focus:outline-none"
              />
            </div>

            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label for="add-user-password" class="block text-sm font-medium text-gray-600"
                  >Temporary Password</label
                >
                ${this._formData.email && this._formData.password
                  ? html`
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
                        Email Credentials
                      </a>
                    `
                  : ''}
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  id="add-user-password"
                  name="password"
                  .value="${this._formData.password}"
                  @input="${this._handleInput}"
                  required
                  class="focus:ring-primary-200 focus:border-primary-500 ${this._passwordError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : ''} flex-1 rounded border border-gray-300 p-3 font-mono text-sm tracking-wider transition duration-200 focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  @click="${this._regeneratePassword}"
                  class="rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 transition-colors hover:bg-gray-200"
                  title="Regenerate Password"
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
              <label for="role" class="mb-2 block text-sm font-medium text-gray-600">Role</label>
              <select
                id="role"
                name="role"
                @change="${this._handleInput}"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 bg-white p-3 transition duration-200 focus:ring-2 focus:outline-none"
              >
                <option value="user" ?selected="${this._formData.role === 'user'}">User</option>
                <option value="admin" ?selected="${this._formData.role === 'admin'}">Admin</option>
              </select>
            </div>

            <div class="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="forceReset"
                name="requiresPasswordChange"
                .checked="${this._formData.requiresPasswordChange}"
                @change="${this._handleInput}"
                class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
              />
              <label for="forceReset" class="cursor-pointer text-sm text-gray-600 select-none">
                Force password change on first login
              </label>
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <rm-button
                aria-label="Add User cancel button"
                type="button"
                @click="${this._close}"
                outline
              >
                Cancel
              </rm-button>
              <rm-button
                aria-label="Create user button"
                type="submit"
                ?disabled="${this._isLoading || this._passwordError}"
              >
                ${this._isLoading ? 'Creating...' : 'Create User'}
              </rm-button>
            </div>
          </form>
        </div>
      </div>
    `
  }
}

customElements.define('rm-add-user-modal', RmAddUserModal)
