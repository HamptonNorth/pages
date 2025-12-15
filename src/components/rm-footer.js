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
    const versionText = 'version 0.8.0'

    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <footer class="text-primary-800 mt-24 mb-8 pl-8 text-xs">
        <div class="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <span>&copy; ${year} Redmug Software. </span><span class="pl-0">${versionText}</span>
          </div>

          <div class="text-right mr-8">${
            this.currentUser
              ? html`Signed in as:
                  <span class="text-primary-600 font-semibold">${this.currentUser}</span>`
              : html`<span class="text-gray-400 italic">Not signed in</span>`
          }</div>
        </div>
        </div>
      </footer>
    `
  }
}

customElements.define('rm-footer', RmFooter)
