// version 1.2 Claude Opus 4.5
// =============================================================================
// PAGES SEARCH MODAL COMPONENT
// =============================================================================
// A full-screen modal for searching across all markdown pages.
// Styled to match the app's existing search UI patterns.
//
// Features:
// - Full-screen overlay with simple centered content
// - Simple input + button layout matching existing search pages
// - Debounced search (250ms delay)
// - Minimum 3 character requirement
// - Results styled similar to pages-list.html
// - Keyboard support (Escape to close)
//
// Usage:
//   <rm-pages-search-modal
//     .isOpen="${true}"
//     @close="${this.handleClose}"
//   ></rm-pages-search-modal>
// =============================================================================

import { LitElement, html, nothing } from 'lit'

export class RmPagesSearchModal extends LitElement {
  static properties = {
    // Public properties
    isOpen: { type: Boolean },

    // Internal state
    _query: { state: true },
    _results: { state: true },
    _isLoading: { state: true },
    _error: { state: true },
    _hasSearched: { state: true },
    _totalResults: { state: true },
    _duration: { state: true },
  }

  // Debounce timer reference
  _searchTimeout = null

  // Minimum characters required for search
  static MIN_QUERY_LENGTH = 3

  // Debounce delay in milliseconds
  static DEBOUNCE_MS = 250

  constructor() {
    super()
    this.isOpen = false
    this._query = ''
    this._results = []
    this._isLoading = false
    this._error = null
    this._hasSearched = false
    this._totalResults = 0
    this._duration = ''
  }

  // Use light DOM so Tailwind classes work
  createRenderRoot() {
    return this
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  updated(changedProperties) {
    // Focus search input when modal opens
    if (changedProperties.has('isOpen') && this.isOpen) {
      setTimeout(() => {
        const input = this.querySelector('#pages-search-input')
        if (input) input.focus()
      }, 50)
    }

    // Reset state when modal closes
    if (changedProperties.has('isOpen') && !this.isOpen) {
      this._resetState()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }
  }

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  _resetState() {
    this._query = ''
    this._results = []
    this._isLoading = false
    this._error = null
    this._hasSearched = false
    this._totalResults = 0
    this._duration = ''
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }
  }

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle search input changes with debouncing
   */
  _handleInput(e) {
    this._query = e.target.value

    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }

    if (this._query.trim().length < RmPagesSearchModal.MIN_QUERY_LENGTH) {
      this._results = []
      this._hasSearched = false
      this._error = null
      return
    }

    this._isLoading = true
    this._searchTimeout = setTimeout(() => {
      this._performSearch()
    }, RmPagesSearchModal.DEBOUNCE_MS)
  }

  /**
   * Handle search button click
   */
  _handleSearchClick() {
    if (this._query.trim().length >= RmPagesSearchModal.MIN_QUERY_LENGTH) {
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }
      this._performSearch()
    }
  }

  /**
   * Handle keyboard events
   */
  _handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      this._emitClose()
    }

    if (e.key === 'Enter' && this._query.trim().length >= RmPagesSearchModal.MIN_QUERY_LENGTH) {
      e.preventDefault()
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }
      this._performSearch()
    }
  }

  /**
   * Handle backdrop click to close
   */
  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._emitClose()
    }
  }

  /**
   * Emit close event to parent
   */
  _emitClose() {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  // =========================================================================
  // SEARCH
  // =========================================================================

  async _performSearch() {
    const query = this._query.trim()

    if (query.length < RmPagesSearchModal.MIN_QUERY_LENGTH) {
      this._isLoading = false
      return
    }

    this._isLoading = true
    this._error = null

    try {
      const response = await fetch(`/api/pages/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Search failed: ${response.status}`)
      }

      const data = await response.json()

      if (query === this._query.trim()) {
        this._results = data.results || []
        this._totalResults = data.total || 0
        this._duration = data.duration || ''
        this._hasSearched = true
        this._error = data.error || null
      }
    } catch (err) {
      console.error('[Search] Error:', err)
      this._error = err.message || 'Search failed'
      this._results = []
    } finally {
      this._isLoading = false
    }
  }

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  /**
   * Render a single search result item
   */
  _renderResult(result) {
    const url = `/pages/${result.category}/${result.slug}`

    return html`
      <a
        href="${url}"
        class="group border-primary-100 hover:border-primary-200 block rounded-md border bg-white p-4 shadow-sm transition-all hover:shadow-md"
        @click="${this._emitClose}"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-grow">
            <!-- Category badge and status -->
            <div class="mb-1 flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-700 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
              >
                ${result.category}
              </span>
              ${result.isPrivate
                ? html`<span
                    class="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                    >Private</span
                  >`
                : nothing}
              ${result.isUnpublished
                ? html`<span
                    class="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >Unpublished</span
                  >`
                : nothing}
            </div>

            <!-- Title -->
            <h3
              class="text-primary-800 group-hover:text-primary-600 text-lg leading-tight font-bold"
            >
              ${result.title || 'Untitled'}
            </h3>

            <!-- Description -->
            ${result.description
              ? html`<p class="text-primary-600 mt-1 line-clamp-2 text-sm">
                  ${result.description}
                </p>`
              : nothing}

            <!-- Match snippets -->
            ${result.matches && result.matches.length > 0
              ? html`
                  <div class="mt-2 space-y-1">
                    ${result.matches.map(
                      (match) => html`
                        <div class="flex items-start gap-2 text-xs">
                          <span
                            class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 capitalize"
                          >
                            ${match.region}
                          </span>
                          <span
                            class="text-gray-600 [&>mark]:rounded [&>mark]:bg-yellow-200 [&>mark]:px-0.5"
                          >
                            ${this._renderHighlightedFragment(match.fragment)}
                          </span>
                        </div>
                      `,
                    )}
                  </div>
                `
              : nothing}
          </div>

          <!-- Arrow indicator -->
          <div
            class="text-secondary-600 group-hover:text-secondary-700 hidden shrink-0 items-center gap-1 pl-2 text-sm font-semibold whitespace-nowrap transition-colors sm:flex"
          >
            <span>Read</span>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </div>
        </div>
      </a>
    `
  }

  /**
   * Render fragment with HTML mark tags preserved
   */
  _renderHighlightedFragment(fragment) {
    if (!fragment) return ''
    return html`<span .innerHTML="${fragment}"></span>`
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  render() {
    if (!this.isOpen) return nothing

    const queryLength = this._query.trim().length
    const canSearch = queryLength >= RmPagesSearchModal.MIN_QUERY_LENGTH

    return html`
      <!-- Full-screen modal backdrop -->
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-black/40"
        @click="${this._handleBackdropClick}"
        @keydown="${this._handleKeydown}"
      >
        <!-- Modal container - centered with max width, viewport-relative height -->
        <div class="flex items-start justify-center p-4 pt-16 sm:pt-20">
          <div
            class="flex w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
            style="height: calc(85vh - 5rem);"
            @click="${(e) => e.stopPropagation()}"
          >
            <!-- Header -->
            <div class="shrink-0 border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <h2 class="text-primary-700 text-2xl font-bold">Search Pages</h2>
                <button
                  @click="${this._emitClose}"
                  class="text-gray-400 transition-colors hover:text-gray-600"
                  title="Close"
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
              <p class="mt-1 text-sm text-gray-600">
                The search string must be ${RmPagesSearchModal.MIN_QUERY_LENGTH} characters or
                longer. The search is across titles, headings, and content.
              </p>
            </div>

            <!-- Search input section -->
            <div class="shrink-0 px-6 py-4">
              <div class="flex gap-3">
                <input
                  id="pages-search-input"
                  type="text"
                  placeholder="Search pages"
                  class="focus:border-primary-500 focus:ring-primary-500 flex-grow rounded-md border border-gray-300 px-4 py-2 text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none"
                  .value="${this._query}"
                  @input="${this._handleInput}"
                  @keydown="${this._handleKeydown}"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button
                  @click="${this._handleSearchClick}"
                  ?disabled="${!canSearch || this._isLoading}"
                  class="bg-primary-700 hover:bg-primary-800 rounded-md px-6 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ${this._isLoading ? 'Searching...' : 'Search Pages'}
                </button>
              </div>
            </div>

            <!-- Results section - fills remaining space -->
            <div class="min-h-0 flex-grow overflow-y-auto border-t border-gray-200 px-6 py-4">
              ${this._error
                ? html`
                    <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">${this._error}</div>
                  `
                : this._hasSearched && this._results.length === 0
                  ? html`
                      <div class="py-8 text-center text-gray-500">
                        <p class="text-lg">No pages found</p>
                        <p class="mt-1 text-sm">Try different keywords or check your spelling</p>
                      </div>
                    `
                  : this._results.length > 0
                    ? html`
                        <div class="mb-3 text-sm text-gray-500">
                          Found ${this._totalResults} result${this._totalResults !== 1 ? 's' : ''}
                          ${this._duration
                            ? html`<span class="text-gray-400">(${this._duration})</span>`
                            : nothing}
                        </div>
                        <div class="space-y-3">
                          ${this._results.map((result) => this._renderResult(result))}
                        </div>
                      `
                    : html`
                        <div class="py-8 text-center text-gray-500">
                          <p>Enter a search term to find pages</p>
                        </div>
                      `}
            </div>

            <!-- Footer -->
            <div class="shrink-0 border-t border-gray-200 px-6 py-3 text-right">
              <button
                @click="${this._emitClose}"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('rm-pages-search-modal', RmPagesSearchModal)
