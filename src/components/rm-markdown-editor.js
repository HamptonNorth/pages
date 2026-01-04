// version 3.11 Gemini 3 Flash
// Complete Markdown Editor: Debounced Spellcheck, Multi-node Highlights, and Dynamic Pluralized Footer
import { LitElement, html, css, nothing } from 'lit'

export class RmMarkdownEditor extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    category: { type: String },
    slug: { type: String },
    mode: { type: String },
    _originalContent: { state: true },
    _currentContent: { state: true },
    _isLoading: { state: true },
    _isSaving: { state: true },
    _error: { state: true },
    _isDirty: { state: true },
    _title: { state: true },
    _spellErrors: { state: true },
    _isChecking: { state: true },
    _showContext: { state: true },
    _contextWord: { state: true },
    _contextPos: { state: true },
    _dots: { state: true },
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
    this._debounceTimer = null
    this._dotInterval = null
    this._dots = ''
  }

  createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this._injectHighlightStyles()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (CSS.highlights && this._highlight) CSS.highlights.delete('spell-error')
    const styleEl = document.getElementById('rm-markdown-editor-highlight-styles')
    if (styleEl) styleEl.remove()
    this._stopDotAnimation()
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
  }

  _injectHighlightStyles() {
    if (document.getElementById('rm-markdown-editor-highlight-styles')) return
    const style = document.createElement('style')
    style.id = 'rm-markdown-editor-highlight-styles'
    style.textContent = `
      ::highlight(spell-error) {
        text-decoration: underline wavy red;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }
    `
    document.head.appendChild(style)
  }

  updated(changedProperties) {
    if (changedProperties.has('isOpen') && this.isOpen) this._loadContent()
    if (changedProperties.has('isOpen') && !this.isOpen) this._resetState()
    if (changedProperties.has('_spellErrors')) this._applyHighlights()
    if (changedProperties.has('_currentContent') || changedProperties.has('_isLoading')) {
      requestAnimationFrame(() => this._syncEditorContent())
    }
    if (changedProperties.has('_isChecking')) {
      if (this._isChecking) this._startDotAnimation()
      else this._stopDotAnimation()
    }
  }

  _startDotAnimation() {
    this._dots = ''
    this._dotInterval = setInterval(() => {
      this._dots = this._dots.length >= 3 ? '' : this._dots + ' .'
    }, 400)
  }

  _stopDotAnimation() {
    if (this._dotInterval) clearInterval(this._dotInterval)
    this._dots = ''
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
    this._stopDotAnimation()
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
    if (CSS.highlights) CSS.highlights.delete('spell-error')
  }

  async _loadContent() {
    if (!this.category || !this.slug) return
    this._isLoading = true
    try {
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`)
      if (!response.ok) throw new Error(`Load failed: ${response.status}`)
      const data = await response.json()
      this._originalContent = data.content || ''
      this._currentContent = data.content || ''
      this._title = data.meta?.title || this.slug
      if (this._currentContent) this._runSpellCheck()
    } catch (err) {
      this._error = err.message
    } finally {
      this._isLoading = false
    }
  }

  _syncEditorContent() {
    if (this._isUserTyping) return
    const editor = this.querySelector('#editor-content')
    if (editor && editor.textContent !== this._currentContent) {
      editor.textContent = this._currentContent
    }
  }

  _handleInput(e) {
    const editor = e.target
    this._isUserTyping = true
    this._currentContent = editor.textContent || ''
    this._isDirty = this._currentContent !== this._originalContent
    if (this._spellErrors.length > 0) this._spellErrors = []
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
    this._debounceTimer = setTimeout(() => {
      if (this._isDirty) this._runSpellCheck()
    }, 1500)
    requestAnimationFrame(() => {
      this._isUserTyping = false
    })
  }

  _handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  _handleKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (this._isDirty && this.mode === 'edit') this._handleSave()
    }
    if (e.key === 'Escape') this._handleClose()
  }

  async _runSpellCheck() {
    if (this._isChecking || !this._currentContent) return
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
    if (!CSS.highlights) return
    const editor = this.querySelector('#editor-content')
    if (!editor) return

    CSS.highlights.delete('spell-error')
    if (this._spellErrors.length === 0) return

    const ranges = []
    const textNodes = []
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node)
    }

    if (textNodes.length === 0) return

    for (const error of this._spellErrors) {
      let charCount = 0
      let startNode = null
      let startOffset = 0
      let endNode = null
      let endOffset = 0

      for (const n of textNodes) {
        const nodeLength = n.textContent.length
        if (!startNode && charCount + nodeLength >= error.offset) {
          startNode = n
          startOffset = error.offset - charCount
        }
        if (charCount + nodeLength >= error.offset + error.length) {
          endNode = n
          endOffset = error.offset + error.length - charCount
          break
        }
        charCount += nodeLength
      }

      if (startNode && endNode) {
        try {
          const range = new Range()
          range.setStart(startNode, startOffset)
          range.setEnd(endNode, endOffset)
          ranges.push(range)
        } catch (err) {
          console.warn('Range error:', error.word)
        }
      }
    }

    if (ranges.length > 0) {
      this._highlight = new Highlight(...ranges)
      CSS.highlights.set('spell-error', this._highlight)
    }
  }

  _handleContextMenu(e) {
    if (this._spellErrors.length === 0) return
    const editor = this.querySelector('#editor-content')
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editor)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const start = preCaretRange.toString().length

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
      console.error(err)
    }
  }

  async _handleSave() {
    if (!this._isDirty || this._isSaving) return
    this._isSaving = true
    try {
      await fetch(`/api/pages/raw/${this.category}/${this.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: this._currentContent }),
      })
      this._originalContent = this._currentContent
      this._isDirty = false
      this.dispatchEvent(new CustomEvent('saved', { detail: { slug: this.slug }, bubbles: true }))
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
    const editor = this.querySelector('#editor-content')
    if (editor) editor.textContent = this._originalContent
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

  render() {
    if (!this.isOpen) return nothing
    const isEditMode = this.mode === 'edit'

    const statusColor = this._isChecking
      ? 'text-primary-700'
      : this._spellErrors.length > 0
        ? 'text-red-600'
        : 'text-green-500'

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
                  class="${this.mode === 'view'
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200'} rounded-full px-3 py-1 text-sm font-medium"
                  @click="${() => (this.mode = 'view')}"
                >
                  View
                </button>
                <button
                  class="${isEditMode
                    ? 'bg-white text-primary-700'
                    : 'text-primary-200'} rounded-full px-3 py-1 text-sm font-medium"
                  @click="${() => (this.mode = 'edit')}"
                >
                  Edit
                </button>
              </div>
            </div>
            <button class="hover:bg-primary-600 rounded p-1.5" @click="${this._handleClose}">
              &times;
            </button>
          </div>

          <div class="relative flex-1 overflow-hidden p-4">
            <div
              id="editor-content"
              contenteditable="${isEditMode ? 'true' : 'false'}"
              class="border-primary-200 ${isEditMode
                ? 'bg-white'
                : 'bg-primary-50 cursor-default'} absolute inset-0 m-4 overflow-auto rounded-lg border p-4 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap outline-none"
              @input="${this._handleInput}"
              @paste="${this._handlePaste}"
              @keydown="${this._handleKeydown}"
              @contextmenu="${this._handleContextMenu}"
              spellcheck="false"
            ></div>

            ${this._showContext
              ? html`
                  <div
                    class="border-primary-200 fixed z-[100] w-64 rounded-md border bg-white py-2 shadow-2xl"
                    style="left: ${this._contextPos.x}px; top: ${this._contextPos.y}px;"
                  >
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

          <div class="bg-primary-50 flex items-center justify-between border-t px-6 py-3">
            <div class="text-primary-500 flex items-center gap-4 text-sm">
              <span class="w-24">${this._lineCount} lines</span>
              <span class="w-24"
                >${(this._currentContent || '').length.toLocaleString()} chars</span
              >

              <span
                class="${statusColor} flex items-center gap-1 font-mono transition-colors duration-300"
              >
                <svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <span class="min-w-[120px]">
                  ${this._isChecking
                    ? html`Checking<span class="inline-block w-8 text-left">${this._dots}</span>`
                    : this._spellErrors.length > 0
                      ? html`<strong
                          >${this._spellErrors.length}
                          ${this._spellErrors.length === 1 ? 'error' : 'errors'} found</strong
                        >`
                      : 'Check complete'}
                </span>
              </span>
            </div>

            <div class="flex items-center gap-3">
              ${isEditMode
                ? html`
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
                      Save
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
