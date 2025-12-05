// version 2.1 Gemini 2.5 Pro
// public/components/rm-nav-header.js

import { LitElement, html, nothing } from 'lit'

export class RmHeader extends LitElement {
  static properties = {
    _isDrawerOpen: { state: true },
    _isMenuOpen: { state: true },
    _isAppsOpen: { state: true },
    _isCountriesOpen: { state: true },
    _isSignOutModalOpen: { state: true }, // New state for confirmation modal
    isSignedIn: { type: Boolean },
  }

  constructor() {
    super()
    this._isDrawerOpen = false
    this._isMenuOpen = false
    this._isAppsOpen = false
    this._isCountriesOpen = false
    this._isSignOutModalOpen = false
    this.isSignedIn = true
  }

  createRenderRoot() {
    return this
  }

  toggleDrawer() {
    this._isDrawerOpen = !this._isDrawerOpen
  }

  toggleMenu() {
    this._isMenuOpen = !this._isMenuOpen
    if (this._isMenuOpen) {
      this._isAppsOpen = false
      this._isCountriesOpen = false
    }
  }

  toggleApps() {
    this._isAppsOpen = !this._isAppsOpen
    if (this._isAppsOpen) {
      this._isMenuOpen = false
      this._isCountriesOpen = false
    }
  }

  toggleCountries() {
    this._isCountriesOpen = !this._isCountriesOpen
    if (this._isCountriesOpen) {
      this._isMenuOpen = false
      this._isAppsOpen = false
    }
  }

  // --- Sign Out Logic ---

  openSignOutModal() {
    this._isMenuOpen = false // Close the dropdown menu
    this._isSignOutModalOpen = true // Open the modal
  }

  closeSignOutModal() {
    this._isSignOutModalOpen = false
  }

  async performSignOut() {
    try {
      // Call the better-auth signout endpoint
      await fetch('/api/auth/sign-out', {
        method: 'POST',
      })
      // Redirect to home or login page after successful sign out
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed', error)
      // Optional: Add error handling UI here
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

    const getTestLink = (area, text) => {
      return `/menu-test.html?area=${area}&text=${encodeURIComponent(text)}`
    }

    return html`
      <header class="bg-primary-700 relative z-30 text-white shadow-md">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              @click="${this.toggleDrawer}"
              class="hover:bg-primary-600 rounded p-1 focus:outline-none sm:hidden"
              aria-label="Open Menu"
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
              class="relative -top-[3px] h-10 w-auto object-contain"
            />

            <span class="text-xl font-bold tracking-tight whitespace-nowrap text-white">
              Redmug software
            </span>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <nav class="mr-2 hidden items-center gap-6 text-sm sm:flex">
              <a href="/" class="${getHeaderLinkClass('/')}">Home</a>

              <div class="relative">
                <button
                  @click="${this.toggleCountries}"
                  class="${this._isCountriesOpen
                    ? 'text-white'
                    : 'text-primary-100'} flex items-center gap-1 transition-colors hover:text-white focus:outline-none"
                >
                  Countries
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                ${this._isCountriesOpen
                  ? html`
                      <div
                        class="fixed inset-0 z-40 cursor-default"
                        @click="${() => (this._isCountriesOpen = false)}"
                      ></div>
                      <div
                        class="text-primary-800 absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
                      >
                        <a
                          href="/countries.html"
                          class="hover:bg-primary-100 block px-4 py-2 text-sm"
                          >View all countries</a
                        >
                        <a
                          href="/countries-search.html"
                          class="hover:bg-primary-100 block px-4 py-2 text-sm"
                          >Search countries</a
                        >
                      </div>
                    `
                  : nothing}
              </div>

              <a href="/products.html" class="${getHeaderLinkClass('/products.html')}">Products</a>
              <a href="/about.html" class="${getHeaderLinkClass('/about.html')}">About</a>
            </nav>

            <div class="relative hidden sm:block">
              <button
                @click="${this.toggleApps}"
                class="text-primary-300 hover:bg-primary-600 rounded p-1 hover:text-white focus:outline-none"
                aria-label="Apps"
                title="Applications"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </button>

              ${this._isAppsOpen
                ? html`
                    <div
                      class="fixed inset-0 z-40 cursor-default"
                      @click="${() => (this._isAppsOpen = false)}"
                    ></div>

                    <div
                      class="text-primary-800 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5"
                    >
                      <div
                        class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                      >
                        Resources
                      </div>
                      <a
                        href="/colours.html"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        Colour swatches
                      </a>
                      <a
                        href="/component-variants.html"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        Custom components
                      </a>

                      <div
                        class="border-primary-700 bg-primary-100 text-primary-500 mt-2 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                      >
                        Calendar
                      </div>
                      <a
                        href="${getTestLink('waffle', 'Add new event')}"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        Add new event
                      </a>
                      <a
                        href="${getTestLink('waffle', 'Amend event')}"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        Amend event
                      </a>
                      <a
                        href="${getTestLink('waffle', 'View all events')}"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        View all events
                      </a>

                      <hr class="border-primary-100 my-1" />

                      <a
                        href="${getTestLink('waffle', 'Email users')}"
                        class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm"
                      >
                        Email users
                      </a>
                    </div>
                  `
                : nothing}
            </div>

            <div class="relative">
              <button
                @click="${this.toggleMenu}"
                class="hover:bg-primary-600 rounded p-1 focus:outline-none"
                aria-label="User Options"
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
                      ${this.isSignedIn
                        ? html`
                            <div
                              class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                            >
                              User admin
                            </div>
                            <a
                              href="${getTestLink('user_admin', 'Add new user')}"
                              class="hover:bg-primary-100 block px-4 py-2 text-sm"
                              >Add new user</a
                            >
                            <a
                              href="${getTestLink('user_admin', 'Amend user')}"
                              class="hover:bg-primary-100 block px-4 py-2 text-sm"
                              >Amend user</a
                            >
                            <a
                              href="${getTestLink('user_admin', 'Reset user password')}"
                              class="hover:bg-primary-100 block px-4 py-2 text-sm"
                              >Reset user password</a
                            >
                            <hr class="border-primary-100 my-1" />
                          `
                        : nothing}

                      <a href="/login.html" class="hover:bg-primary-100 block px-4 py-2 text-sm"
                        >Sign in</a
                      >
                      <button
                        @click="${this.openSignOutModal}"
                        class="text-primary-800 hover:bg-primary-100 w-full px-4 py-2 text-left text-sm"
                      >
                        Sign out
                      </button>
                      <a
                        href="${getTestLink('user', 'Add avatar')}"
                        class="hover:bg-primary-100 block px-4 py-2 text-sm"
                        >Add avatar</a
                      >
                    </div>
                  `
                : nothing}
            </div>
          </div>
        </div>
      </header>

      ${this._isDrawerOpen
        ? html`
            <div
              class="fixed inset-0 z-40 bg-black/50 transition-opacity"
              @click="${this.toggleDrawer}"
            ></div>

            <aside class="fixed top-0 left-0 z-50 h-full w-60 overflow-y-auto bg-white shadow-2xl">
              <div
                class="border-primary-200 bg-primary-50 flex items-center justify-between border-b p-4"
              >
                <span class="text-primary-700 font-bold">Menu</span>
                <button @click="${this.toggleDrawer}" class="text-primary-500 hover:text-error1">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div class="flex flex-col py-2">
                <div class="border-primary-200 mb-2 flex flex-col gap-1 border-b pb-2 sm:hidden">
                  <span class="text-primary-400 mt-2 mb-1 px-4 text-xs font-semibold uppercase"
                    >Navigation</span
                  >

                  <a href="/" class="${getDrawerLinkClass('/')}">Home</a>

                  <details class="group">
                    <summary
                      class="text-primary-600 hover:bg-primary-100 flex cursor-pointer list-none items-center justify-between px-4 py-2 text-sm"
                    >
                      <span>Countries</span>
                      <svg
                        class="text-primary-400 h-4 w-4 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7 7"
                        ></path>
                      </svg>
                    </summary>
                    <div class="bg-primary-50 flex flex-col">
                      <a
                        href="/countries.html"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-8 text-sm"
                        >View all countries</a
                      >
                      <a
                        href="/countries-search.html"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-8 text-sm"
                        >Search countries</a
                      >
                    </div>
                  </details>

                  <a href="/products.html" class="${getDrawerLinkClass('/products.html')}"
                    >Products</a
                  >
                  <a href="/about.html" class="${getDrawerLinkClass('/about.html')}">About</a>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-primary-400 mt-2 mb-1 px-4 text-xs font-semibold uppercase"
                    >Apps</span
                  >

                  <details class="group">
                    <summary
                      class="text-primary-600 hover:bg-primary-100 flex cursor-pointer list-none items-center justify-between px-4 py-2 text-sm"
                    >
                      <div class="flex items-center gap-2">
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          ></path>
                        </svg>
                        <span>Resources</span>
                      </div>
                      <svg
                        class="text-primary-400 h-4 w-4 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7 7"
                        ></path>
                      </svg>
                    </summary>
                    <div class="bg-primary-50 flex flex-col">
                      <a
                        href="${getTestLink('waffle', 'Add new resource')}"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-10 text-xs"
                        >Add new resource</a
                      >
                      <a
                        href="${getTestLink('waffle', 'View resources')}"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-10 text-xs"
                        >View resources</a
                      >
                    </div>
                  </details>

                  <details class="group">
                    <summary
                      class="text-primary-600 hover:bg-primary-100 flex cursor-pointer list-none items-center justify-between px-4 py-2 text-sm"
                    >
                      <div class="flex items-center gap-2">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        <span>Calendar</span>
                      </div>
                      <svg
                        class="text-primary-400 h-4 w-4 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7 7"
                        ></path>
                      </svg>
                    </summary>
                    <div class="bg-primary-50 flex flex-col">
                      <a
                        href="${getTestLink('waffle', 'Add new event')}"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-10 text-xs"
                        >Add new event</a
                      >
                      <a
                        href="${getTestLink('waffle', 'Amend event')}"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-10 text-xs"
                        >Amend event</a
                      >
                      <a
                        href="${getTestLink('waffle', 'View all events')}"
                        class="text-primary-600 hover:text-secondary-700 py-2 pr-4 pl-10 text-xs"
                        >View all events</a
                      >
                    </div>
                  </details>

                  <a
                    href="${getTestLink('waffle', 'Email users')}"
                    class="text-primary-600 hover:bg-primary-100 flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <div class="flex items-center gap-2">
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span>Email users</span>
                    </div>
                  </a>
                </div>
              </div>
            </aside>
          `
        : nothing}
      ${this._isSignOutModalOpen
        ? html`
            <div
              class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              @click="${this.closeSignOutModal}"
            >
              <div
                class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
                @click="${(e) => e.stopPropagation()}"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <svg
                      class="text-primary-600 h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">Confirm Sign Out</h3>
                </div>
                <p class="mt-3 text-sm text-gray-600">
                  Are you sure you want to sign out of your account?
                </p>
                <div class="mt-6 flex justify-end gap-3">
                  <button
                    @click="${this.closeSignOutModal}"
                    class="hover:bg-primary-50 text-primary-700 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    @click="${this.performSignOut}"
                    class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          `
        : nothing}
    `
  }
}

customElements.define('rm-nav-header', RmHeader)
