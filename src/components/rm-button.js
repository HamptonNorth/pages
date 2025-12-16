// rm-button.js

class RmButton extends HTMLElement {
  constructor() {
    super()
  }

  static get observedAttributes() {
    return [
      'xs',
      'sm',
      'md',
      'lg',
      'pill',
      'standard',
      'primary',
      'secondary',
      'danger',
      'outline',
      'ghost',
      'disabled',
      'type', // handled  manually for form submission
    ]
  }

  connectedCallback() {
    this.render()
    this.addEventListener('click', this._handleClick)

    // Ensure it can be focused
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0')
    }

    // Accessibility
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button')
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  // Handle form submission manually since Custom Elements don't submit forms automatically
  _handleClick = (e) => {
    if (this.hasAttribute('disabled')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // If type="submit", find the parent form and submit it
    const type = this.getAttribute('type')
    if (type === 'submit') {
      const form = this.closest('form')
      if (form) {
        // Use requestSubmit() to trigger native validation
        form.requestSubmit()
      }
    }
  }

  // Compatibility getter/setter for .label (optional now, but kept for products.js compatibility)
  set label(value) {
    this.textContent = value
  }
  get label() {
    return this.textContent
  }

  getSizeClasses() {
    if (this.hasAttribute('xs')) return 'px-2 py-1 text-xs gap-1.5'
    if (this.hasAttribute('sm')) return 'px-2 py-1.5 text-xs gap-2'
    if (this.hasAttribute('lg')) return 'px-3.5 py-3 text-base gap-2.5'
    return 'px-4 py-2 text-sm gap-2'
  }

  getShapeClasses() {
    if (this.hasAttribute('pill')) return 'rounded-full'
    if (this.hasAttribute('xs') || this.hasAttribute('sm')) return 'rounded-sm'
    if (this.hasAttribute('lg')) return 'rounded-lg'
    return 'rounded-md'
  }

  getStyleClasses() {
    if (this.hasAttribute('ghost'))
      return 'bg-transparent text-primary-600 hover:bg-gray-50 focus:ring-primary-500'
    if (this.hasAttribute('outline'))
      return 'bg-white text-primary-700 hover:bg-primary-50 focus:ring-gray-300 focus:outline-none border border-primary-300'
    if (this.hasAttribute('danger'))
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    if (this.hasAttribute('secondary'))
      return 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400'

    // Default Primary
    return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
  }

  render() {
    //  Calculate Classes
    const base =
      'inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer select-none'
    const size = this.getSizeClasses()
    const shape = this.getShapeClasses()

    let style = ''
    if (this.hasAttribute('disabled')) {
      style =
        'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80 shadow-none pointer-events-none'
      // Remove tabindex if disabled
      this.removeAttribute('tabindex')
    } else {
      style = this.getStyleClasses()
      // Restore tabindex if enabled
      this.setAttribute('tabindex', '0')
    }

    // . Apply classes to the Host Element directly

    this.className = `${base} ${size} ${shape} ${style}`
  }
}

customElements.define('rm-button', RmButton)
