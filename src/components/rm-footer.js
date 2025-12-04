// version 2.5 Gemini 2.5 Pro
// public/components/rm-footer.js

import { LitElement, html } from 'lit'
import { authClient } from '../auth-client.js' // Import better-auth client

export class RmFooter extends LitElement {
  static properties = {
    currentUser: { type: String },
  }

  constructor() {
    super()
    this.currentUser = null
  }

  async connectedCallback() {
    super.connectedCallback()

    // 1. Check better-auth session directly on load
    try {
      const { data } = await authClient.getSession()
      if (data?.user) {
        this.currentUser = data.user.email
      }
    } catch (e) {
      // Not logged in
    }

    // 2. Listen for login events (immediate UI update without refresh)
    window.addEventListener('auth-changed', this._handleAuthChange)
  }

  disconnectedCallback() {
    window.removeEventListener('auth-changed', this._handleAuthChange)
    super.disconnectedCallback()
  }

  _handleAuthChange = (e) => {
    if (e.detail?.signedIn) {
      this.currentUser = e.detail.email
    } else {
      this.currentUser = null
    }
  }

  render() {
    const year = new Date().getFullYear()
    const versionText = 'Version 1.1.2 released 03/12/2025'

    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <footer class="text-primary-800 mt-24 mb-8 px-8 text-xs">
        <div class="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <span>&copy; ${year} Redmug Software. All rights reserved.</span>

            ${this.currentUser
              ? html`<span class="text-primary-600 font-semibold"
                  >Signed in as: ${this.currentUser}</span
                >`
              : html`<span class="text-gray-400 italic">Not signed in</span>`}
          </div>

          <div class="text-right">${versionText}</div>
        </div>
      </footer>
    `
  }
}

customElements.define('rm-footer', RmFooter)
