// version 3.1 Claude Opus 4.5
// Complete Markdown Editor with CSpell-based Spellcheck and SQLite Dictionary integration
// Changes from 3.1:
// - Fixed Lit compatibility: contenteditable content managed imperatively, not via template
// - Use requestAnimationFrame for DOM sync to ensure element exists
// Changes from 3.0:
// - Switched from textarea + overlay to contenteditable div with CSS Highlights API
// - Native text highlighting without positioning issues
// - Uses ::highlight(spell-error) pseudo-element for styling

import { LitElement, html, css, nothing } from 'lit'

export class RmMarkdownEditor extends LitElement {
  static properties = {
    // Public properties
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

    // Spellcheck state
    _spellErrors: { state: true },
    _isChecking: { state: true },
    _showContext: { state: true },
    _contextWord: { state: true },
    _contextPos: { state: true },
  }

  constructor() {
    super()
    this.isOpen = false
    this.category = ''
    this.slug = ''
    this.mode = 'view'
    this._resetState()
    this._highlight = null
    this._isUserTyping = false
  }

  // Use light DOM so CSS Highlights API can access the text nodes
  createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    // Inject highlight styles into document head (needed for light DOM)
    this._injectHighlightStyles()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    // Clean up highlight
    if (CSS.highlights && this._highlight) {
      CSS.highlights.delete('spell-error')
    }
    // Remove injected styles
    const styleEl = document.getElementById('rm-markdown-editor-highlight-styles')
    if (styleEl) styleEl.remove()
  }

  _injectHighlightStyles() {
    if (document.getElementById('rm-markdown-editor-highlight-styles')) return
    const style = document.createElement('style')
    style.id = 'rm-markdown-editor-highlight-styles'
    style.textContent = `
      ::highlight(spell-error) {
        text-decoration: underline  red;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
        background-color: transparent;
      }
    `
    document.head.appendChild(style)
  }

  updated(changedProperties) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._loadContent()
    }
    if (changedProperties.has('isOpen') && !this.isOpen) {
      this._resetState()
    }
    if (changedProperties.has('_spellErrors')) {
      this._applyHighlights()
    }
    // Always sync editor content after render if we have content
    // Use requestAnimationFrame to ensure DOM is ready
    if (changedProperties.has('_currentContent') || changedProperties.has('_isLoading')) {
      requestAnimationFrame(() => this._syncEditorContent())
    }
  }

  _resetState() {
    this._originalContent = ''
    this._currentContent = ''
    this._isLoading = false
    this._isSaving = false
    this._error = null
    this._isDirty = false
    this._title = ''
    this._spellErrors = []
    this._isChecking = false
    this._showContext = false
    this._isUserTyping = false
    // Clear highlights
    if (CSS.highlights) {
      CSS.highlights.delete('spell-error')
    }
  }

  async _loadContent() {
    if (!this.category || !this.slug) {
      this._error = 'Missing category or slug'
      return
    }

    this._isLoading = true
    this._error = null

    try {
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`)
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`)

      const data = await response.json()
      this._originalContent = data.content || ''
      this._currentContent = data.content || ''
      this._title = data.meta?.title || this.slug
      this._isDirty = false
    } catch (err) {
      this._error = err.message || 'Failed to load content'
    } finally {
      this._isLoading = false
    }
  }

  _syncEditorContent() {
    // Don't sync while user is typing to avoid cursor jumping
    if (this._isUserTyping) return

    const editor = this.querySelector('#editor-content')
    if (!editor) return

    // Only update if content is different to avoid cursor jumping
    if (editor.textContent !== this._currentContent) {
      editor.textContent = this._currentContent
    }
  }

  _handleInput(e) {
    const editor = e.target
    this._isUserTyping = true
    this._currentContent = editor.textContent || ''
    this._isDirty = this._currentContent !== this._originalContent
    // Clear errors when typing
    if (this._spellErrors.length > 0) {
      this._spellErrors = []
    }
    // Reset flag after a short delay
    requestAnimationFrame(() => {
      this._isUserTyping = false
    })
  }

  _handlePaste(e) {
    // Paste as plain text only
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  _handleKeydown(e) {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (this._isDirty && this.mode === 'edit') this._handleSave()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      this._handleClose()
    }
  }

  async _runSpellCheck() {
    if (this._isChecking) return
    this._isChecking = true

    try {
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: this._currentContent }),
      })
      const data = await response.json()
      this._spellErrors = data.errors || []
    } catch (err) {
      console.error('Spellcheck failed:', err)
    } finally {
      this._isChecking = false
    }
  }

  _applyHighlights() {
    if (!CSS.highlights) {
      console.warn('CSS Highlights API not supported')
      return
    }

    const editor = this.querySelector('#editor-content')
    if (!editor) return

    // Clear existing highlights
    CSS.highlights.delete('spell-error')

    if (this._spellErrors.length === 0) return

    const ranges = []
    const textNode = this._getTextNode(editor)

    if (!textNode) return

    for (const error of this._spellErrors) {
      try {
        const range = new Range()
        range.setStart(textNode, error.offset)
        range.setEnd(textNode, error.offset + error.length)
        ranges.push(range)
      } catch (err) {
        // Offset might be invalid if content changed
        console.warn('Failed to create range for:', error.word, err)
      }
    }

    if (ranges.length > 0) {
      this._highlight = new Highlight(...ranges)
      CSS.highlights.set('spell-error', this._highlight)
    }
  }

  _getTextNode(element) {
    // For a contenteditable with just text, the first child should be the text node
    // But we need to handle the case where the browser wraps content
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false)
    return walker.nextNode()
  }

  _handleContextMenu(e) {
    if (this._spellErrors.length === 0) return

    const editor = this.querySelector('#editor-content')
    if (!editor) return

    const selection = window.getSelection()
    if (!selection.rangeCount) return

    // Get cursor position in text
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editor)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const start = preCaretRange.toString().length

    // Find if cursor is within a misspelled word
    const error = this._spellErrors.find(
      (err) => start >= err.offset && start <= err.offset + err.length,
    )

    if (error) {
      e.preventDefault()
      this._contextWord = error.word
      this._contextPos = { x: e.clientX, y: e.clientY }
      this._showContext = true
    }
  }

  async _addToDictionary(word) {
    try {
      const response = await fetch('/api/dictionary/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      })
      if (response.ok) {
        this._spellErrors = this._spellErrors.filter((e) => e.word !== word)
        this._showContext = false
      }
    } catch (err) {
      console.error('Failed to add word:', err)
    }
  }

  async _handleSave() {
    if (!this._isDirty || this._isSaving) return
    this._isSaving = true
    try {
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: this._currentContent }),
      })
      if (!response.ok) throw new Error('Save failed')

      this._originalContent = this._currentContent
      this._isDirty = false
      this.dispatchEvent(
        new CustomEvent('saved', { detail: { slug: this.slug }, bubbles: true, composed: true }),
      )
      this._emitClose()
    } catch (err) {
      this._error = err.message
    } finally {
      this._isSaving = false
    }
  }

  _handleDiscard() {
    this._currentContent = this._originalContent
    this._isDirty = false
    this._spellErrors = []
    // Sync the editor
    const editor = this.querySelector('#editor-content')
    if (editor) {
      editor.textContent = this._originalContent
    }
  }

  _handleClose() {
    if (this._isDirty && !window.confirm('Unsaved changes. Close anyway?')) return
    this._emitClose()
  }

  _emitClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }))
  }

  get _lineCount() {
    return (this._currentContent || '').split('\n').length
  }
  get _charCount() {
    return (this._currentContent || '').length
  }

  render() {
    if (!this.isOpen) return nothing
    const isEditMode = this.mode === 'edit'

    const editorStyles = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 16px;
      margin: 0;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      box-sizing: border-box;
      background: ${isEditMode ? '#ffffff' : '#f8fafc'};
      outline: none;
      overflow: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      cursor: ${isEditMode ? 'text' : 'default'};
    `

    return html`
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click="${this._handleClose}"
      >
        <div
          class="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
          @click="${(e) => e.stopPropagation()}"
        >
          <div
            class="bg-primary-700 flex shrink-0 items-center justify-between px-6 py-4 text-white"
          >
            <div class="flex items-center gap-4">
              <h2 class="max-w-md truncate text-lg font-bold">${this._title || 'Loading...'}</h2>
              <div class="bg-primary-800 flex rounded-full p-1">
                <button
                  class="${!isEditMode
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200'} rounded-full px-3 py-1 text-sm font-medium transition-colors"
                  @click="${() => (this.mode = 'view')}"
                >
                  View
                </button>
                <button
                  class="${isEditMode
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200'} rounded-full px-3 py-1 text-sm font-medium transition-colors"
                  @click="${() => (this.mode = 'edit')}"
                >
                  Edit
                </button>
              </div>
            </div>
            <button class="hover:bg-primary-600 rounded p-1.5" @click="${this._handleClose}">
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

          <div class="relative flex flex-1 flex-col overflow-hidden">
            ${this._isLoading
              ? html`
                  <div class="flex flex-1 items-center justify-center">
                    <div
                      class="border-primary-200 border-t-primary-600 h-10 w-10 animate-spin rounded-full border-4"
                    ></div>
                  </div>
                `
              : this._error
                ? html`
                    <div class="flex flex-1 items-center justify-center p-6 text-center">
                      <p class="font-normal text-red-500">${this._error}</p>
                    </div>
                  `
                : html`
                    <div class="relative flex-1 overflow-hidden p-4">
                      <div class="relative h-full w-full">
                        <div
                          id="editor-content"
                          contenteditable="${isEditMode ? 'true' : 'false'}"
                          style="${editorStyles}"
                          @input="${this._handleInput}"
                          @paste="${this._handlePaste}"
                          @keydown="${this._handleKeydown}"
                          @contextmenu="${this._handleContextMenu}"
                          spellcheck="false"
                        ></div>
                      </div>

                      ${this._showContext
                        ? html`
                            <div
                              class="border-primary-200 fixed z-[100] w-64 rounded-md border bg-white py-2 shadow-2xl"
                              style="left: ${this._contextPos.x}px; top: ${this._contextPos.y}px;"
                            >
                              <div
                                class="text-primary-400 border-primary-50 mb-1 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                              >
                                Spellcheck
                              </div>
                              <button
                                class="hover:bg-primary-50 text-secondary-600 w-full px-4 py-2 text-left font-semibold"
                                @click="${() => this._addToDictionary(this._contextWord)}"
                              >
                                Add "${this._contextWord}" to Dictionary
                              </button>
                              <button
                                class="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100"
                                @click="${() => (this._showContext = false)}"
                              >
                                Ignore
                              </button>
                            </div>
                          `
                        : nothing}
                    </div>
                  `}
          </div>

          <div class="bg-primary-50 flex items-center justify-between border-t px-6 py-3">
            <div class="text-primary-500 flex items-center gap-4 text-sm">
              <span>${this._lineCount} lines</span>
              <span>${this._charCount.toLocaleString()} characters</span>
              ${this._spellErrors.length > 0
                ? html`
                    <span class="flex items-center gap-1 font-normal text-red-600">
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        />
                      </svg>
                      ${this._spellErrors.length} errors
                    </span>
                  `
                : nothing}
            </div>

            <div class="flex items-center gap-3">
              ${isEditMode
                ? html`
                    <button
                      class="text-primary-600 hover:text-primary-800 px-2 text-sm font-semibold transition-colors"
                      @click="${this._runSpellCheck}"
                      ?disabled="${this._isChecking}"
                    >
                      ${this._isChecking ? 'Checking...' : 'Spell Check'}
                    </button>
                    <button
                      class="text-primary-600 hover:bg-primary-100 rounded px-4 py-2 text-sm font-medium"
                      @click="${this._handleDiscard}"
                    >
                      Discard
                    </button>
                    <button
                      class="bg-secondary-600 hover:bg-secondary-700 rounded px-4 py-2 text-sm font-medium text-white shadow"
                      @click="${this._handleSave}"
                      ?disabled="${this._isSaving}"
                    >
                      ${this._isSaving ? 'Saving...' : 'Save'}
                    </button>
                  `
                : html`<button
                    class="border-primary-200 rounded border bg-white px-4 py-2 text-sm font-medium shadow-sm"
                    @click="${this._handleClose}"
                  >
                    Close
                  </button>`}
            </div>
          </div>
        </div>
      </div>
    `
  }
}
customElements.define('rm-markdown-editor', RmMarkdownEditor)
