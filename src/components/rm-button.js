// version 3.1 Gemini 2.5 Pro
// rm-button.js
import { LitElement, html, css, unsafeCSS } from 'lit'
import tailwindStyles from '../../public/styles/output.css' with { type: 'text' }

export class RmButton extends LitElement {
  static properties = {
    type: { type: String },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  }

  static styles = [
    unsafeCSS(tailwindStyles),
    css`
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        pointer-events: none;
      }
    `,
  ]

  constructor() {
    super()
    this.type = 'button'
    this.variant = 'default'
    this.size = 'md'
    this.disabled = false
  }

  get _sizeClasses() {
    const sizes = {
      xs: 'px-2 py-1 text-xs rounded-sm',
      sm: 'px-2 py-1.5 text-xs rounded-sm',
      md: 'px-2.5 py-2 text-sm rounded-md',
      lg: 'px-3.5 py-3 text-base rounded-lg',
    }
    return sizes[this.size] ?? sizes.md
  }

  get _variantClasses() {
    if (this.disabled) {
      return 'bg-primary-400 text-primary-200 cursor-not-allowed opacity-50'
    }

    // if (this.outline) {
    //   return 'bg-primary-400 text-primary-200 cursor-not-allowed opacity-50'
    // }

    // class="hover:bg-primary-50 text-primary-700 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-gray-300 focus:outline-none"

    const variants = {
      // Default: Primary palette
      default: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',

      // Secondary: Mapped to Secondary-500 as requested
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400',

      outline: `bg-white text-primary-700 hover:bg-primary-50 focus:ring-gray-300 focus:outline-none border border-primary-300`,

      // Danger: Mapped to Error1
      // Note: Using brightness-90 for hover as explicit darker error shade wasn't provided
      danger: 'bg-error1 text-white hover:brightness-90 focus:ring-error2',
    }
    return variants[this.variant] ?? variants.default
  }

  render() {
    const classes = [
      this._sizeClasses,
      this._variantClasses,
      'font-semibold transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      this.disabled ? '' : 'cursor-pointer',
    ].join(' ')

    return html`
      <button type="${this.type}" class="${classes}" ?disabled=${this.disabled} part="base">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
    `
  }
}

customElements.define('rm-button', RmButton)
