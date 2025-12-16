class RmXButton extends HTMLElement {
  constructor() {
    super()
  }

  static get observedAttributes() {
    return ['xs', 'sm', 'md', 'lg', 'circle', 'disabled']
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  getSizeClasses() {
    // Defines the box size of the click area
    if (this.hasAttribute('xs')) return 'h-6 w-6'
    if (this.hasAttribute('sm')) return 'h-8 w-8'
    if (this.hasAttribute('lg')) return 'h-12 w-12'
    return 'h-10 w-10' // Default md
  }

  getIconSize() {
    // Defines the SVG size explicitly
    if (this.hasAttribute('xs')) return 'h-3 w-3'
    if (this.hasAttribute('sm')) return 'h-4 w-4'
    if (this.hasAttribute('lg')) return 'h-6 w-6'
    return 'h-5 w-5' // Default md
  }

  getStyleClasses() {
    // Base: Darker text (gray-500) for better visibility
    const base =
      'text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'

    if (this.hasAttribute('circle')) {
      // Circle: Transparent default, background on hover only
      return `${base} rounded-full hover:bg-gray-100`
    }

    // Standard: Rounded corners, background on hover only
    return `${base} rounded-md hover:bg-gray-100`
  }

  render() {
    let btn = this.querySelector('button.rm-x-btn-internal')

    if (!btn) {
      btn = document.createElement('button')
      btn.className = 'rm-x-btn-internal'
      this.appendChild(btn)
    }

    const base = 'inline-flex items-center justify-center transition-colors duration-200'
    const size = this.getSizeClasses()
    const style = this.getStyleClasses()
    const disabled = this.hasAttribute('disabled')
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer'

    btn.className = `rm-x-btn-internal ${base} ${size} ${style} ${disabled}`
    btn.setAttribute('type', 'button')
    btn.setAttribute('aria-label', 'Close')

    if (this.hasAttribute('disabled')) {
      btn.setAttribute('disabled', '')
    } else {
      btn.removeAttribute('disabled')
    }

    const iconSize = this.getIconSize()

    // stroke-width="2.5"  for a bolder look
    btn.innerHTML = `
            <svg class="${iconSize}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `

    this.style.display = 'contents'
  }
}

customElements.define('rm-x-button', RmXButton)
