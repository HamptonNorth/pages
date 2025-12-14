// public/components/rm-login.js
// version 3.6 Gemini 2.0 Flash
// Changes:
// - FIXED: Restored missing opening <div> for password group in HTML.
// - FIXED: Added missing 'email' variable definition in handleSubmit.

import { authClient } from '../auth-client.js'

class RMLogin extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isChangePasswordMode = false
    this.tempEmail = ''
    this.tempPassword = ''
  }

  connectedCallback() {
    this.render()
    this.addEventListeners()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/output.css">
      <style>
        :host { display: block; width: 100%; max-width: 24rem; margin: 0 auto; }
        .hidden { display: none !important; }
      </style>

      <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 id="form-title" class="text-2xl font-bold text-gray-800 text-center mb-2">Sign In</h2>
        <p id="form-desc" class="text-gray-500 text-center text-sm mb-6">Enter your credentials to access the system.</p>

        <div id="error-msg" class="hidden text-red-600 bg-red-50 p-3 rounded mb-4 text-sm border border-red-200"></div>

        <form id="auth-form">
          <div class="mb-4" id="email-group">
            <label for="login-email" class="block mb-2 text-gray-600 text-sm font-medium">Email Address</label>
            <input type="email" id="login-email" required placeholder="you@company.com"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
          </div>

          <div class="mb-6" id="password-group">
            <label for="login-password" id="password-label" class="block mb-2 text-gray-600 text-sm font-medium">Password</label>
            <input type="password" id="login-password" required placeholder="••••••••"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
          </div>

          <div id="new-password-section" class="hidden">
             <div class="mb-4">
              <label for="new-password" class="block mb-2 text-gray-600 text-sm font-medium">New Password</label>
              <input type="password" id="new-password" placeholder="New secure password"
                class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
            </div>

             <div class="mb-6">
              <label for="confirm-password" class="block mb-2 text-gray-600 text-sm font-medium">Confirm New Password</label>
              <input type="password" id="confirm-password" placeholder="Confirm new password"
                class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
            </div>
          </div>

          <button type="submit" id="submit-btn"
            class="w-full bg-primary-500 text-white p-3 rounded font-bold hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200">
            Sign In
          </button>
        </form>
      </div>
    `
  }

  addEventListeners() {
    this.shadowRoot
      .getElementById('auth-form')
      .addEventListener('submit', (e) => this.handleSubmit(e))
  }

  enableChangePasswordMode() {
    this.isChangePasswordMode = true

    this.shadowRoot.getElementById('form-title').textContent = 'Setup New Password'
    this.shadowRoot.getElementById('form-desc').textContent =
      'Administrator requires you to change your password.'
    this.shadowRoot.getElementById('submit-btn').textContent = 'Update & Sign In'

    this.shadowRoot.getElementById('new-password-section').classList.remove('hidden')
    this.shadowRoot.getElementById('email-group').classList.add('hidden')
    this.shadowRoot.getElementById('password-group').classList.add('hidden')

    this.shadowRoot.getElementById('new-password').required = true
    this.shadowRoot.getElementById('confirm-password').required = true

    this.showError(null)
  }

  showError(message) {
    const errorMsg = this.shadowRoot.getElementById('error-msg')
    if (message) {
      errorMsg.textContent = message
      errorMsg.classList.remove('hidden')
      errorMsg.classList.add('block')
    } else {
      errorMsg.classList.add('hidden')
      errorMsg.classList.remove('block')
    }
  }

  async handleSubmit(e) {
    e.preventDefault()
    const submitBtn = this.shadowRoot.getElementById('submit-btn')
    submitBtn.disabled = true
    submitBtn.textContent = 'Processing...'
    this.showError(null)

    try {
      if (!this.isChangePasswordMode) {
        // FIXED: Retrieve email from the input field
        const email = this.shadowRoot.getElementById('login-email').value
        const password = this.shadowRoot.getElementById('login-password').value

        const { data, error } = await authClient.signIn.email({
          email,
          password,
        })

        if (error) throw new Error(error.message || 'Login failed')

        // Check if user object contains the custom flag
        if (data.user && data.user.requiresPasswordChange) {
          this.tempEmail = email
          this.tempPassword = password
          this.enableChangePasswordMode()
          return
        }

        this.finishLogin(data.user)
      } else {
        // --- CHANGE PASSWORD ---
        const newPassword = this.shadowRoot.getElementById('new-password').value
        const confirmPassword = this.shadowRoot.getElementById('confirm-password').value

        if (newPassword !== confirmPassword) throw new Error('Passwords do not match')
        if (newPassword.length < 8) throw new Error('Password must be at least 8 characters')
        if (newPassword === this.tempPassword)
          throw new Error('New password cannot be the same as temporary password')

        const { data, error } = await authClient.changePassword({
          newPassword: newPassword,
          currentPassword: this.tempPassword,
          revokeOtherSessions: true,
        })

        if (error) throw new Error(error.message || 'Failed to update password')

        const userPayload = data?.user || { email: this.tempEmail }
        this.finishLogin(userPayload)
      }
    } catch (err) {
      let message = err.message
      if (message === 'Failed to fetch' || message === 'NetworkError') {
        message = 'Unable to connect to the server. Please try again later.'
      }
      this.showError(message)

      if (this.isChangePasswordMode) submitBtn.textContent = 'Update & Sign In'
      else submitBtn.textContent = 'Sign In'
    } finally {
      submitBtn.disabled = false
    }
  }

  finishLogin(user) {
    localStorage.setItem('user_email', user.email || this.tempEmail)

    window.dispatchEvent(
      new CustomEvent('auth-changed', {
        detail: { email: user.email || this.tempEmail, signedIn: true },
      }),
    )

    window.location.href = '/'
  }
}

customElements.define('rm-login', RMLogin)
