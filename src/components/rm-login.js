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
        .cursor-pointer { cursor: pointer; }
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
            <div class="relative">
              <input type="password" id="login-password" required placeholder="••••••••"
                class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
              <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="login-password">
                <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                </svg>
              </button>
            </div>
          </div>

          <div id="new-password-section" class="hidden">
             <div class="mb-4">
              <label for="new-password" class="block mb-2 text-gray-600 text-sm font-medium">New Password</label>
              <div class="relative">
                <input type="password" id="new-password" placeholder="New secure password"
                  class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="new-password">
                  <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                  </svg>
                </button>
              </div>
              <p id="new-password-hint" class="mt-1 text-xs text-gray-400">
                Must be 8+ chars, include 1 uppercase & 1 number.
              </p>
            </div>

             <div class="mb-6">
              <label for="confirm-password" class="block mb-2 text-gray-600 text-sm font-medium">Confirm New Password</label>
              <div class="relative">
                <input type="password" id="confirm-password" placeholder="Confirm new password"
                  class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="confirm-password">
                  <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                  </svg>
                </button>
              </div>
              <p id="confirm-password-error" class="hidden mt-1 text-xs text-red-600"></p>
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

    this.shadowRoot
      .getElementById('google-btn')
      .addEventListener('click', () => this.handleSocialSignIn('google'))

    this.shadowRoot
      .getElementById('github-btn')
      .addEventListener('click', () => this.handleSocialSignIn('github'))

    // Listen for typing to reset errors
    const inputs = ['new-password', 'confirm-password']
    inputs.forEach((id) => {
      const el = this.shadowRoot.getElementById(id)
      if (el) el.addEventListener('input', () => this.resetPasswordStyles(id))
    })

    // Password Toggle Listeners
    const toggles = this.shadowRoot.querySelectorAll('.toggle-password')
    toggles.forEach((btn) => {
      btn.addEventListener('click', (e) => this.togglePasswordVisibility(e))
    })
  }

  togglePasswordVisibility(e) {
    const btn = e.currentTarget
    const targetId = btn.getAttribute('data-target')
    const input = this.shadowRoot.getElementById(targetId)
    const eyeOpen = btn.querySelector('.eye-open')
    const eyeClosed = btn.querySelector('.eye-closed')

    if (input.type === 'password') {
      input.type = 'text'
      eyeOpen.classList.add('hidden')
      eyeClosed.classList.remove('hidden')
    } else {
      input.type = 'password'
      eyeOpen.classList.remove('hidden')
      eyeClosed.classList.add('hidden')
    }
  }

  // Helper to validate password complexity locally
  validatePassword(password) {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number'
    return null
  }

  // Visual helper: Set input to Error state
  setPasswordError(inputId, message) {
    const input = this.shadowRoot.getElementById(inputId)
    // Add red border
    input.classList.add('border-red-500', 'focus:ring-red-200', 'focus:border-red-500')
    input.classList.remove('border-gray-300', 'focus:ring-primary-200', 'focus:border-primary-500')

    // Handle specific hint text updates
    if (inputId === 'new-password') {
      const hint = this.shadowRoot.getElementById('new-password-hint')
      hint.textContent = message
      hint.classList.remove('text-gray-400')
      hint.classList.add('text-red-600')
    } else if (inputId === 'confirm-password') {
      const errorMsg = this.shadowRoot.getElementById('confirm-password-error')
      errorMsg.textContent = message
      errorMsg.classList.remove('hidden')
    }
  }

  // Visual helper: Reset input to Default state
  resetPasswordStyles(inputId) {
    const input = this.shadowRoot.getElementById(inputId)
    if (!input) return

    input.classList.remove('border-red-500', 'focus:ring-red-200', 'focus:border-red-500')
    input.classList.add('border-gray-300', 'focus:ring-primary-200', 'focus:border-primary-500')

    if (inputId === 'new-password') {
      const hint = this.shadowRoot.getElementById('new-password-hint')
      hint.textContent = 'Must be 8+ chars, include 1 uppercase & 1 number.'
      hint.classList.add('text-gray-400')
      hint.classList.remove('text-red-600')
    } else if (inputId === 'confirm-password') {
      const errorMsg = this.shadowRoot.getElementById('confirm-password-error')
      errorMsg.classList.add('hidden')
    }
  }

  enableChangePasswordMode() {
    this.isChangePasswordMode = true

    this.shadowRoot.getElementById('form-title').textContent = 'Setup New Password'
    this.shadowRoot.getElementById('form-desc').textContent =
      'Administrator requires you to change your password.'
    const submitBtn = this.shadowRoot.getElementById('submit-btn')
    submitBtn.textContent = 'Update & Sign In'

    this.shadowRoot.getElementById('new-password-section').classList.remove('hidden')
    this.shadowRoot.getElementById('email-group').classList.add('hidden')
    this.shadowRoot.getElementById('password-group').classList.add('hidden')

    // Hide social section during password change
    const socialSection = this.shadowRoot.getElementById('social-section')
    if (socialSection) socialSection.classList.add('hidden')

    this.shadowRoot.getElementById('new-password').required = true
    this.shadowRoot.getElementById('confirm-password').required = true

    this.showError(null)

    // IMPORTANT: Re-enable button so user can submit the new password
    submitBtn.disabled = false
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

  /**
   * Generic handler for social login providers.
   * @param {'google' | 'github'} provider
   */
  async handleSocialSignIn(provider) {
    const btnId = `${provider}-btn`
    const btn = this.shadowRoot.getElementById(btnId)
    const originalContent = btn.innerHTML

    // UI Feedback
    btn.disabled = true
    btn.innerHTML = `<span class="${provider === 'github' ? 'text-gray-300' : 'text-gray-500'}">Connecting...</span>`

    try {
      const { data, error } = await authClient.signIn.social({
        provider: provider,
        callbackURL: '/',
      })

      if (error) throw new Error(error.message)
    } catch (err) {
      console.error(`${provider} Sign In Error:`, err)
      this.showError(err.message || `Failed to connect to ${provider}.`)

      // Reset button on error
      btn.disabled = false
      btn.innerHTML = originalContent
    }
  }

  async handleSubmit(e) {
    e.preventDefault()
    const submitBtn = this.shadowRoot.getElementById('submit-btn')

    // Clear global error message
    this.showError(null)

    try {
      if (!this.isChangePasswordMode) {
        // --- Normal Login Flow ---
        submitBtn.disabled = true
        submitBtn.textContent = 'Processing...'

        const email = this.shadowRoot.getElementById('login-email').value
        const password = this.shadowRoot.getElementById('login-password').value

        const { data, error } = await authClient.signIn.email({
          email,
          password,
        })

        if (error) throw new Error(error.message || 'Login failed')

        if (data.user && data.user.requiresPasswordChange) {
          this.tempEmail = email
          this.tempPassword = password

          // SECURITY FIX: Immediately sign out.
          // This prevents the user from navigating away and browsing the app
          // with a valid session while still having a temporary password.
          await authClient.signOut()

          this.enableChangePasswordMode()
          return
        }

        this.finishLogin(data.user)
      } else {
        // --- Change Password Flow ---
        const newPassword = this.shadowRoot.getElementById('new-password').value
        const confirmPassword = this.shadowRoot.getElementById('confirm-password').value

        // 1. Check Matching
        if (newPassword !== confirmPassword) {
          this.setPasswordError('confirm-password', 'Passwords do not match')
          return // Stop submission
        }

        // 2. Check Complexity
        const validationError = this.validatePassword(newPassword)
        if (validationError) {
          this.setPasswordError('new-password', validationError)
          return // Stop submission
        }

        if (newPassword === this.tempPassword) {
          this.showError('New password cannot be the same as temporary password')
          return
        }

        // Validation Passed: Proceed to Submit
        submitBtn.disabled = true
        submitBtn.textContent = 'Processing...'

        // 3. Re-Authenticate (Because we signed out earlier)
        // We use the stored temporary credentials to establish a session strictly for the update.
        const { error: signInError } = await authClient.signIn.email({
          email: this.tempEmail,
          password: this.tempPassword,
        })

        if (signInError) {
          throw new Error('Session expired. Please reload and sign in again.')
        }

        // 4. Change Password
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
