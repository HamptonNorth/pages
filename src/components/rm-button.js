// rm-button.js
// Merged Version: Combines Native Form features (New) with Styling/Sizing (Old)

import { LitElement, html, css, unsafeCSS } from 'lit'
// We revert to this import style as it is much more performant than the <link> tag used in the v1.0 refactor
import tailwindStyles from '../../public/styles/output.css' with { type: 'text' }

export class RmButton extends LitElement {
  // 1. Enable Form Association (From New Version)
  // This allows the button to participate in native <form> submission
  static formAssociated = true

  static properties = {
    // Styling Props (From Old Version)
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },

    // Functional Props
    type: { type: String },
    disabled: { type: Boolean, reflect: true },

    // Loading State (From New Version)
    loading: { type: Boolean, reflect: true },
    loadingText: { type: String, attribute: 'loading-text' },
  }

  static styles = [
    unsafeCSS(tailwindStyles),
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      :host([disabled]),
      :host([loading]) {
        pointer-events: none;
      }
      /* Ensure the button spans full width if the host does */
      button {
        width: 100%;
      }
    `,
  ]

  constructor() {
    super()
    // 2. Attach Internals (From New Version)
    this.internals = this.attachInternals()

    // Defaults
    this.type = 'button'
    this.variant = 'default'
    this.size = 'md'
    this.disabled = false
    this.loading = false
    this.loadingText = 'Loading...'
  }

  // Handle the internal button click to trigger form submission (From New Version)
  _handleClick(e) {
    if (this.disabled || this.loading) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // If this is a submit button and we are inside a form, submit it!
    if (this.type === 'submit' && this.internals.form) {
      this.internals.form.requestSubmit()
    }
  }

  // Logic restored from Old Version
  get _sizeClasses() {
    const sizes = {
      xs: 'px-2 py-1 text-xs rounded-sm gap-1.5',
      sm: 'px-2 py-1.5 text-xs rounded-sm gap-2',
      md: 'px-4 py-2 text-sm rounded-md gap-2', // Updated padding to match standard button feel
      lg: 'px-3.5 py-3 text-base rounded-lg gap-2.5',
    }
    return sizes[this.size] ?? sizes.md
  }

  get _variantClasses() {
    // Handle Loading/Disabled state
    if (this.disabled || this.loading) {
      // Logic from New Version blended with Old
      return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80'
    }

    const variants = {
      // Default: Primary palette
      default: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',

      // Secondary: Restored from Old Version
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400',

      // Outline
      outline:
        'bg-white text-primary-700 hover:bg-primary-50 focus:ring-gray-300 focus:outline-none border border-primary-300',

      // Danger
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }
    return variants[this.variant] ?? variants.default
  }

  render() {
    const classes = [
      'flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      this._sizeClasses,
      this._variantClasses,
      this.disabled || this.loading ? '' : 'cursor-pointer',
    ].join(' ')

    return html`
      <button
        type="${this.type}"
        class="${classes}"
        ?disabled=${this.disabled || this.loading}
        @click="${this._handleClick}"
        part="base"
      >
        ${this.loading
          ? html`
              <svg
                class="-ml-1 h-4 w-4 animate-spin text-current"
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
              ${this.loadingText ? html`<span class="ml-2">${this.loadingText}</span>` : ''}
            `
          : html`
              <slot name="prefix"></slot>
              <slot></slot>
              <slot name="suffix"></slot>
            `}
      </button>
    `
  }
}

customElements.define('rm-button', RmButton)
