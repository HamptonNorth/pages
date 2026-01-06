// version 2.1 Claude Opus 4.5
// =============================================================================
// CHANGES from v2.1:
// - Removed Countries dropdown and all sub-navigation
// - Removed Products link from header and drawer
// - Removed waffle icon menu (Apps/Resources) and all sub-navigation
// - Replaced Pages icon with "Content" text dropdown
// =============================================================================
// public/components/rm-nav-header.js

import { LitElement, html, nothing } from 'lit'
import { authClient } from '../auth-client.js'
import './rm-add-user-modal.js'
import './rm-reset-password-modal.js'
import './rm-delete-user-modal.js'
import './rm-pages-search-modal.js'

export class RmHeader extends LitElement {
  static properties = {
    _isDrawerOpen: { state: true },
    _isMenuOpen: { state: true },
    _isPagesOpen: { state: true },
    _pageCategories: { state: true },

    // Search modal state
    _isSearchOpen: { state: true },

    _isSignOutModalOpen: { state: true },
    _isAddUserModalOpen: { state: true },

    _isResetPasswordModalOpen: { state: true },
    _resetPasswordUser: { state: true },

    _isDeleteUserModalOpen: { state: true },
    _deleteUserTarget: { state: true },

    isSignedIn: { type: Boolean },
    userRole: { type: String },
  }

  constructor() {
    super()
    this._isDrawerOpen = false
    this._isMenuOpen = false
    this._isPagesOpen = false
    this._pageCategories = [] // Now stores objects: { name: 'blog', sidebar: false }

    // Search modal state
    this._isSearchOpen = false

    this._isSignOutModalOpen = false
    this._isAddUserModalOpen = false

    this._isResetPasswordModalOpen = false
    this._resetPasswordUser = null

    this._isDeleteUserModalOpen = false
    this._deleteUserTarget = null

    this.isSignedIn = false
    this.userRole = null
  }

  createRenderRoot() {
    return this
  }

  async connectedCallback() {
    super.connectedCallback()
    window.addEventListener('auth-changed', this._handleAuthChange.bind(this))

    window.addEventListener('request-password-reset', this._handleResetPasswordRequest.bind(this))
    window.addEventListener('request-delete-user', this._handleDeleteUserRequest.bind(this))

    await this._checkSession()
    await this._fetchPageCategories()
  }

  disconnectedCallback() {
    window.removeEventListener('auth-changed', this._handleAuthChange.bind(this))
    window.removeEventListener(
      'request-password-reset',
      this._handleResetPasswordRequest.bind(this),
    )
    window.removeEventListener('request-delete-user', this._handleDeleteUserRequest.bind(this))
    super.disconnectedCallback()
  }

  async _fetchPageCategories() {
    try {
      const response = await fetch('/api/pages-config')
      if (response.ok) {
        this._pageCategories = await response.json()
      } else {
        console.warn('Could not fetch pages config')
        this._pageCategories = []
      }
    } catch (error) {
      console.error('Error fetching pages config:', error)
      this._pageCategories = []
    }
  }

  _handleResetPasswordRequest(e) {
    this._resetPasswordUser = e.detail || null
    this._isMenuOpen = false
    this._isResetPasswordModalOpen = true
  }

  _handleDeleteUserRequest(e) {
    this._deleteUserTarget = e.detail || null
    this._isMenuOpen = false
    this._isDeleteUserModalOpen = true
  }

  async _checkSession() {
    try {
      const { data } = await authClient.getSession()
      if (data) {
        this.isSignedIn = true
        this.userRole = data.user.role || 'user'
      } else {
        this.isSignedIn = false
        this.userRole = null
      }
    } catch (error) {
      console.error('Failed to check session:', error)
      this.isSignedIn = false
      this.userRole = null
    }
  }

  _handleAuthChange(e) {
    this.isSignedIn = e.detail.signedIn
    if (this.isSignedIn) {
      this._checkSession()
    } else {
      this.userRole = null
    }
  }

  toggleDrawer() {
    this._isDrawerOpen = !this._isDrawerOpen
  }

  toggleMenu() {
    this._isMenuOpen = !this._isMenuOpen
    if (this._isMenuOpen) {
      this._isPagesOpen = false
    }
  }

  togglePages() {
    this._isPagesOpen = !this._isPagesOpen
    if (this._isPagesOpen) {
      this._isMenuOpen = false
    }
  }

  // =========================================================================
  // SEARCH MODAL METHODS
  // =========================================================================

  openSearchModal() {
    this._isPagesOpen = false // Close the pages dropdown
    this._isSearchOpen = true
  }

  closeSearchModal() {
    this._isSearchOpen = false
  }

  openAddUserModal() {
    this._isMenuOpen = false
    this._isAddUserModalOpen = true
  }
  closeAddUserModal() {
    this._isAddUserModalOpen = false
  }

  closeResetPasswordModal() {
    this._isResetPasswordModalOpen = false
    this._resetPasswordUser = null
  }
  closeDeleteUserModal() {
    this._isDeleteUserModalOpen = false
    this._deleteUserTarget = null
  }

  openSignOutModal() {
    this._isMenuOpen = false
    this._isSignOutModalOpen = true
  }
  closeSignOutModal() {
    this._isSignOutModalOpen = false
  }

  async performSignOut() {
    try {
      await authClient.signOut()
      localStorage.removeItem('user_email')
      this.isSignedIn = false
      this.userRole = null
      this._isSignOutModalOpen = false
      window.location.href = '/'
    } catch (error) {
      this._isSignOutModalOpen = false
    }
  }

  render() {
    const currentPath = window.location.pathname
    const getHeaderLinkClass = (path) => {
      const baseClass = 'hover:text-white transition-colors duration-200 cursor-pointer'
      const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path))
      return isActive
        ? `${baseClass} underline font-semibold text-white`
        : `${baseClass} text-primary-100`
    }
    const getDrawerLinkClass = (path) => {
      const baseClass = 'block px-4 py-2 rounded transition-colors text-sm'
      const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path))
      return isActive
        ? `${baseClass} font-bold text-secondary-700 bg-secondary-50`
        : `${baseClass} text-primary-600 hover:bg-primary-100`
    }
    const isAdmin = this.isSignedIn && this.userRole === 'admin'
    const hasPages = this._pageCategories && this._pageCategories.length > 0

    return html`
      <header class="bg-primary-700 relative z-30 text-white shadow-md">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              aria-label="Hamburger menu button to open drawer on mobile"
              @click="${this.toggleDrawer}"
              class="hover:bg-primary-600 rounded p-1 focus:outline-none sm:hidden"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <img
              src="/media/redmug_logo_316x316.png"
              alt="Redmug Logo"
              class="relative -top-0.75 h-10 w-auto object-contain"
            />
            <span class="text-xl font-bold tracking-tight whitespace-nowrap text-white">Pages</span>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <nav class="mr-2 hidden items-center gap-6 text-sm sm:flex">
              <a href="/" class="${getHeaderLinkClass('/')}">Home</a>
              ${hasPages
                ? html`
                    <div class="relative">
                      <button
                        aria-label="Button to access Pages and Blogs"
                        @click="${this.togglePages}"
                        class="${this._isPagesOpen
                          ? 'text-white'
                          : 'text-primary-100'} flex items-center gap-1 transition-colors hover:text-white focus:outline-none"
                      >
                        Content
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      ${this._isPagesOpen
                        ? html`
                            <div
                              class="fixed inset-0 z-40 cursor-default"
                              @click="${() => (this._isPagesOpen = false)}"
                            ></div>
                            <div
                              class="text-primary-800 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5"
                            >
                              <div
                                class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                              >
                                Content
                              </div>
                              ${this._pageCategories.map(
                                (cat) => html`
                                  <a
                                    href="/pages/${cat.name}"
                                    class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm capitalize"
                                  >
                                    ${cat.name}
                                  </a>
                                `,
                              )}

                              <!-- Search pages option -->
                              <div class="border-primary-100 mt-1 border-t pt-1">
                                <button
                                  @click="${this.openSearchModal}"
                                  class="text-primary-700 hover:bg-primary-50 flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
                                >
                                  <svg
                                    class="text-primary-400 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                  </svg>
                                  Search pages
                                </button>
                              </div>
                            </div>
                          `
                        : nothing}
                    </div>
                  `
                : nothing}
              <a href="/about.html" class="${getHeaderLinkClass('/about.html')}">About</a>
            </nav>

            <div class="relative">
              <button
                aria-label="Button to access admin sub menu - sign in  and sign out"
                @click="${this.toggleMenu}"
                class="hover:bg-primary-600 rounded p-1 focus:outline-none"
              >
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  ></path>
                </svg>
              </button>
              ${this._isMenuOpen
                ? html`
                    <div
                      class="fixed inset-0 z-40 cursor-default"
                      @click="${() => (this._isMenuOpen = false)}"
                    ></div>
                    <div
                      class="text-primary-800 absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
                    >
                      ${isAdmin
                        ? html`<div
                              class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                            >
                              User admin
                            </div>
                            <button
                              aria-label="Add new user button"
                              @click="${this.openAddUserModal}"
                              class="text-primary-800 hover:bg-primary-100 w-full px-4 py-2 text-left text-sm"
                            >
                              Add new user</button
                            ><a
                              href="/users-list.html"
                              class="hover:bg-primary-100 block px-4 py-2 text-sm"
                              >List users</a
                            >
                            <hr class="border-primary-100 my-1" />`
                        : nothing}
                      ${!this.isSignedIn
                        ? html`<a
                            href="/login.html"
                            class="hover:bg-primary-100 block px-4 py-2 text-sm"
                            >Sign in</a
                          >`
                        : nothing}
                      ${this.isSignedIn
                        ? html`<button
                            aria-label="Sign out button"
                            @click="${this.openSignOutModal}"
                            class="text-primary-800 hover:bg-primary-100 w-full px-4 py-2 text-left text-sm"
                          >
                            Sign out
                          </button>`
                        : nothing}
                    </div>
                  `
                : nothing}
            </div>
          </div>
        </div>
      </header>

      ${this._isDrawerOpen
        ? html`<div
              class="fixed inset-0 z-40 bg-black/50 transition-opacity"
              @click="${this.toggleDrawer}"
            ></div>
            <aside class="fixed top-0 left-0 z-50 h-full w-60 overflow-y-auto bg-white shadow-2xl">
              <div
                class="border-primary-200 bg-primary-50 flex items-center justify-between border-b p-4"
              >
                <span class="text-primary-700 font-bold">Menu</span
                ><button
                  arai-label="Close drawer on mobile"
                  @click="${this.toggleDrawer}"
                  class="text-primary-500 hover:text-error1"
                >
                  Close
                </button>
              </div>

              <div class="flex flex-col py-2">
                <a href="/" class="${getDrawerLinkClass('/')}">Home</a>
                <a href="/about.html" class="${getDrawerLinkClass('/about.html')}">About</a>

                ${hasPages
                  ? html`
                      <div
                        class="text-primary-500 bg-primary-50 mt-2 px-4 py-2 text-xs font-bold tracking-wider uppercase"
                      >
                        Content
                      </div>
                      ${this._pageCategories.map(
                        (cat) => html`
                          <a
                            href="/pages/${cat.name}"
                            class="${getDrawerLinkClass(`/pages/${cat.name}`)} pl-8 capitalize"
                          >
                            ${cat.name}
                          </a>
                        `,
                      )}
                      <!-- Search pages in mobile drawer -->
                      <button
                        @click="${() => {
                          this.toggleDrawer()
                          this.openSearchModal()
                        }}"
                        class="text-primary-600 hover:bg-primary-100 flex items-center gap-2 px-4 py-2 pl-8 text-left text-sm"
                      >
                        <svg
                          class="text-primary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                        Search pages
                      </button>
                    `
                  : nothing}
              </div>
            </aside>`
        : nothing}
      ${this._isSignOutModalOpen
        ? html`<div
            class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            @click="${this.closeSignOutModal}"
          >
            <div
              class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
              @click="${(e) => e.stopPropagation()}"
            >
              <h3 class="text-lg font-bold text-gray-900">Confirm Sign Out</h3>
              <div class="mt-6 flex justify-end gap-3">
                <button
                  aria-label="Sign out button"
                  @click="${this.closeSignOutModal}"
                  class="rounded border border-gray-300 px-4 py-2"
                >
                  Cancel</button
                ><button
                  @click="${this.performSignOut}"
                  class="bg-primary-600 rounded px-4 py-2 text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>`
        : nothing}

      <rm-add-user-modal
        .isOpen="${this._isAddUserModalOpen}"
        @close="${this.closeAddUserModal}"
      ></rm-add-user-modal>
      <rm-reset-password-modal
        .isOpen="${this._isResetPasswordModalOpen}"
        .user="${this._resetPasswordUser}"
        @close-modal="${this.closeResetPasswordModal}"
      ></rm-reset-password-modal>

      <rm-delete-user-modal
        .isOpen="${this._isDeleteUserModalOpen}"
        .user="${this._deleteUserTarget}"
        @close="${this.closeDeleteUserModal}"
      ></rm-delete-user-modal>

      <!-- Pages Search Modal -->
      <rm-pages-search-modal
        .isOpen="${this._isSearchOpen}"
        @close="${this.closeSearchModal}"
      ></rm-pages-search-modal>
    `
  }
}
customElements.define('rm-nav-header', RmHeader)
