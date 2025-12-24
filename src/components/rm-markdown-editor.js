// version 1.0 Claude Opus 4.5
// public/components/rm-markdown-editor.js
//
// A modal-based markdown editor component for viewing and editing *.md files.
// Features:
// - View mode (read-only) with syntax highlighting
// - Edit mode with change tracking
// - Save/Discard buttons when changes are detected
// - Downloads raw markdown from server and saves back via API
//
// Usage:
//   <rm-markdown-editor
//     .isOpen="${true}"
//     .category="${'blog'}"
//     .slug="${'my-post'}"
//     .mode="${'edit'}"  // 'view' or 'edit'
//     @close="${this.handleClose}"
//     @saved="${this.handleSaved}"
//   ></rm-markdown-editor>

import { LitElement, html, nothing } from 'lit'

export class RmMarkdownEditor extends LitElement {
  static properties = {
    // Public properties (set by parent)
    isOpen: { type: Boolean },
    category: { type: String },
    slug: { type: String },
    mode: { type: String }, // 'view' or 'edit'

    // Internal state
    _originalContent: { state: true },
    _currentContent: { state: true },
    _isLoading: { state: true },
    _isSaving: { state: true },
    _error: { state: true },
    _isDirty: { state: true },
    _title: { state: true },
  }

  constructor() {
    super()
    this.isOpen = false
    this.category = ''
    this.slug = ''
    this.mode = 'view'

    this._originalContent = ''
    this._currentContent = ''
    this._isLoading = false
    this._isSaving = false
    this._error = null
    this._isDirty = false
    this._title = ''
  }

  // Use light DOM so Tailwind classes work
  createRenderRoot() {
    return this
  }

  /**
   * Watch for property changes to load content when modal opens
   */
  updated(changedProperties) {
    // Load content when modal opens
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._loadContent()
    }

    // Reset state when modal closes
    if (changedProperties.has('isOpen') && !this.isOpen) {
      this._resetState()
    }
  }

  /**
   * Reset internal state
   */
  _resetState() {
    this._originalContent = ''
    this._currentContent = ''
    this._isLoading = false
    this._isSaving = false
    this._error = null
    this._isDirty = false
    this._title = ''
  }

  /**
   * Load the raw markdown content from the server
   */
  async _loadContent() {
    if (!this.category || !this.slug) {
      this._error = 'Missing category or slug'
      return
    }

    this._isLoading = true
    this._error = null

    try {
      // Fetch raw markdown content
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to load: ${response.status}`)
      }

      const data = await response.json()
      this._originalContent = data.content || ''
      this._currentContent = data.content || ''
      this._title = data.meta?.title || this.slug
      this._isDirty = false
    } catch (err) {
      console.error('Failed to load markdown:', err)
      this._error = err.message || 'Failed to load content'
    } finally {
      this._isLoading = false
    }
  }

  /**
   * Handle textarea input changes
   */
  _handleInput(e) {
    this._currentContent = e.target.value
    this._isDirty = this._currentContent !== this._originalContent
  }

  /**
   * Handle keyboard shortcuts (Ctrl+S to save, Escape to close)
   */
  _handleKeydown(e) {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (this._isDirty && this.mode === 'edit') {
        this._handleSave()
      }
    }

    // Escape to close (with confirmation if dirty)
    if (e.key === 'Escape') {
      e.preventDefault()
      this._handleClose()
    }
  }

  /**
   * Handle save button click
   */
  async _handleSave() {
    if (!this._isDirty || this._isSaving) return

    this._isSaving = true
    this._error = null

    try {
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: this._currentContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to save: ${response.status}`)
      }

      // Update original content to match saved content
      this._originalContent = this._currentContent
      this._isDirty = false

      // Dispatch saved event so parent can react (e.g., refresh list)
      this.dispatchEvent(
        new CustomEvent('saved', {
          detail: { category: this.category, slug: this.slug },
          bubbles: true,
          composed: true,
        }),
      )

      // Close the modal after successful save
      this._emitClose()
    } catch (err) {
      console.error('Failed to save markdown:', err)
      this._error = err.message || 'Failed to save'
    } finally {
      this._isSaving = false
    }
  }

  /**
   * Handle discard button click - reset to original content
   */
  _handleDiscard() {
    this._currentContent = this._originalContent
    this._isDirty = false
  }

  /**
   * Handle close button or backdrop click
   * Shows confirmation if there are unsaved changes
   */
  _handleClose() {
    if (this._isDirty) {
      // Show browser confirmation dialog for unsaved changes
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return
    }
    this._emitClose()
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

  /**
   * Switch between view and edit modes
   */
  _setMode(newMode) {
    this.mode = newMode
  }

  /**
   * Calculate line count for display
   */
  get _lineCount() {
    if (!this._currentContent) return 0
    return this._currentContent.split('\n').length
  }

  /**
   * Calculate character count for display
   */
  get _charCount() {
    if (!this._currentContent) return 0
    return this._currentContent.length
  }

  render() {
    // Don't render if not open
    if (!this.isOpen) return nothing

    const isEditMode = this.mode === 'edit'

    return html`
      <!-- Modal backdrop -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click="${this._handleClose}"
        @keydown="${this._handleKeydown}"
      >
        <!-- Modal container -->
        <div
          class="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
          @click="${(e) => e.stopPropagation()}"
        >
          <!-- Header -->
          <div class="bg-primary-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4">
              <h2 class="text-lg font-bold truncate max-w-md" title="${this._title}">
                ${this._title || 'Loading...'}
              </h2>
              <!-- Mode toggle pills -->
              <div class="flex bg-primary-800 rounded-full p-1">
                <button
                  class="px-3 py-1 text-sm font-medium rounded-full transition-colors ${!isEditMode
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200 hover:text-white'}"
                  @click="${() => this._setMode('view')}"
                >
                  View
                </button>
                <button
                  class="px-3 py-1 text-sm font-medium rounded-full transition-colors ${isEditMode
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200 hover:text-white'}"
                  @click="${() => this._setMode('edit')}"
                >
                  Edit
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- File path info -->
              <span class="text-primary-200 text-sm font-mono hidden sm:inline">
                ${this.category}/${this.slug}.md
              </span>

              <!-- Close button -->
              <button
                class="text-white hover:bg-primary-600 rounded p-1.5 transition-colors"
                @click="${this._handleClose}"
                title="Close (Esc)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content area -->
          <div class="flex-1 overflow-hidden flex flex-col">
            ${this._isLoading
              ? html`
                  <div class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                      <div
                        class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"
                      ></div>
                      <p class="text-primary-600">Loading markdown...</p>
                    </div>
                  </div>
                `
              : this._error
                ? html`
                    <div class="flex-1 flex items-center justify-center">
                      <div
                        class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center"
                      >
                        <svg
                          class="w-12 h-12 text-red-400 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <p class="text-red-700 font-medium">${this._error}</p>
                        <button
                          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          @click="${this._loadContent}"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  `
                : html`
                    <!-- Editor/Viewer -->
                    <div class="flex-1 overflow-hidden p-4">
                      <textarea
                        class="w-full h-full p-4 font-mono text-sm leading-relaxed resize-none border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isEditMode
                          ? 'bg-white'
                          : 'bg-primary-50 cursor-default'}"
                        .value="${this._currentContent}"
                        ?readonly="${!isEditMode}"
                        @input="${this._handleInput}"
                        @keydown="${this._handleKeydown}"
                        placeholder="No content"
                        spellcheck="false"
                      ></textarea>
                    </div>
                  `}
          </div>

          <!-- Footer -->
          <div
            class="bg-primary-50 border-t border-primary-100 px-6 py-3 flex items-center justify-between shrink-0"
          >
            <!-- Stats -->
            <div class="text-sm text-primary-500 flex items-center gap-4">
              <span>${this._lineCount} lines</span>
              <span>${this._charCount.toLocaleString()} characters</span>
              ${this._isDirty
                ? html`<span class="text-amber-600 font-medium flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Unsaved changes
                  </span>`
                : nothing}
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3">
              ${isEditMode && this._isDirty
                ? html`
                    <!-- Discard button -->
                    <button
                      class="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded transition-colors"
                      @click="${this._handleDiscard}"
                      ?disabled="${this._isSaving}"
                    >
                      Discard
                    </button>

                    <!-- Save button (primary action) -->
                    <button
                      class="px-4 py-2 text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 rounded shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="${this._handleSave}"
                      ?disabled="${this._isSaving}"
                    >
                      ${this._isSaving
                        ? html`
                            <div
                              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            ></div>
                            Saving...
                          `
                        : html`
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            Save
                          `}
                    </button>
                  `
                : html`
                    <!-- Close button when no changes or in view mode -->
                    <button
                      class="px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 rounded shadow-sm transition-colors"
                      @click="${this._handleClose}"
                    >
                      Close
                    </button>
                  `}
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('rm-markdown-editor', RmMarkdownEditor)
