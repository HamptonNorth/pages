// public/components/rm-button.js
// version 1.0 Gemini 2.0 Flash
// Changes:
// - Implemented ElementInternals for native form association.
// - Handles type="submit" to trigger parent form requestSubmit().
// - Uses Shadow DOM with Tailwind link.

import { LitElement, html, css } from 'lit'

export class RmButton extends LitElement {
  // 1. Enable Form Association
  static formAssociated = true

  static properties = {
    variant: { type: String }, // 'default', 'outline', 'disabled', 'danger'
    type: { type: String }, // 'button', 'submit', 'reset'
    loading: { type: Boolean },
    loadingText: { type: String, attribute: 'loading-text' },
    disabled: { type: Boolean },
  }

  constructor() {
    super()
    // 2. Attach Internals to interact with parent forms
    this.internals = this.attachInternals()

    this.variant = 'default'
    this.type = 'button'
    this.loading = false
    this.loadingText = 'Loading...'
    this.disabled = false
  }

  // Handle the internal button click
  _handleClick(e) {
    // If this is a submit button and we are inside a form, submit it!
    if (this.type === 'submit' && this.internals.form) {
      // requestSubmit() triggers the form's submit event and validation
      this.internals.form.requestSubmit()
    }
  }

  render() {
    const isDestructive = this.variant === 'danger'
    const isOutline = this.variant === 'outline'
    const isDisabled = this.disabled || this.variant === 'disabled' || this.loading

    // Base classes
    let classes =
      'flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed '

    // Variant logic (Tailwind)
    if (isDisabled) {
      classes += 'bg-gray-100 text-gray-400 cursor-not-allowed '
    } else if (isOutline) {
      classes +=
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 '
    } else if (isDestructive) {
      classes += 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 '
    } else {
      // Default Primary
      classes += 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 '
    }

    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <button
        type="${this.type}"
        class="${classes}"
        ?disabled="${isDisabled}"
        @click="${this._handleClick}"
      >
        ${this.loading
          ? html`
              <svg
                class="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              ${this.loadingText}
            `
          : html`<slot></slot>`}
      </button>
    `
  }
}

customElements.define('rm-button', RmButton)
