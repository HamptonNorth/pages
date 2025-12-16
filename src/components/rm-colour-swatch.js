import { LitElement, html } from 'lit'

export class RmColourSwatch extends LitElement {
  static properties = {
    color: { type: String },
    _hexValues: { state: true },
  }

  // Shared cache - only fetch the CSS file once for all components
  static _cssCache = null

  constructor() {
    super()
    this.color = 'primary'
    this._hexValues = {}

    this.paletteConfig = {
      standard: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      error: ['1', '2'],
      highlight: ['1', '2', '3'],
    }
  }

  createRenderRoot() {
    return this
  }

  async connectedCallback() {
    super.connectedCallback()
    await this._loadColors()
  }

  /**
   * Fetches input.css and extracts variable definitions using Regex.
   */
  async _loadColors() {
    // 1. Fetch file (only once)
    if (!RmColourSwatch._cssCache) {
      try {
        const response = await fetch('/styles/input.css')
        if (!response.ok) throw new Error('Failed to load input.css')
        RmColourSwatch._cssCache = await response.text()
      } catch (err) {
        console.error('RmColourSwatch Error:', err)
        return
      }
    }

    const cssText = RmColourSwatch._cssCache
    const newHexValues = {}
    const shades = this.getShades()

    //  Parse variables for this specific palette
    // logic:  look for "--color-{name}-?{shade}: #hex;"
    shades.forEach((shade) => {
      // Determine variable name format based on palette type
      // Standard: --color-primary-50
      // Custom:   --color-error1
      const isStandard = !['error', 'highlight'].includes(this.color)
      const separator = isStandard ? '-' : ''
      const varName = `--color-${this.color}${separator}${shade}`

      // Regex Explanation:
      // ${varName}  -> matches "--color-primary-50"
      // \s*:\s* -> matches colon with optional spaces
      // (#[0-9a-fA-F]{3,8}) -> captures the hex code (e.g., #eceff1)
      const regex = new RegExp(`${varName}\\s*:\\s*(#[0-9a-fA-F]{3,8})`, 'i')
      const match = cssText.match(regex)

      if (match && match[1]) {
        newHexValues[shade] = match[1]
      }
    })

    this._hexValues = newHexValues
  }

  getShades() {
    return this.paletteConfig[this.color] || this.paletteConfig.standard
  }

  getMainShade(shades) {
    if (shades.includes(500)) return 500
    return shades[Math.floor((shades.length - 1) / 2)]
  }

  getTextColorClass(shade) {
    if (this.color === 'highlight') return 'text-slate-900'
    if (this.color === 'error') return 'text-white'

    const shadeNum = parseInt(shade)
    if (!isNaN(shadeNum)) {
      return shadeNum >= 500 ? 'text-white' : 'text-slate-900'
    }
    return 'text-slate-900'
  }

  render() {
    const shades = this.getShades()
    const headerShade = this.getMainShade(shades)
    const isStandard = !['error', 'highlight'].includes(this.color)

    // Get hex directly from our parsed data
    const headerHex = this._hexValues[headerShade] || '#cccccc'
    const headerLabel = isStandard ? headerShade : `${this.color}${headerShade}`

    return html`
      <div
        class="flex w-64 flex-col gap-0.5 overflow-hidden rounded-lg border border-slate-200 bg-white font-sans text-sm shadow-lg"
      >
        <!-- Header Block -->
        <div
          class="${this.getTextColorClass(headerShade)} flex h-32 flex-col justify-between p-4"
          style="background-color: ${headerHex}"
        >
          <span class="text-lg font-semibold capitalize">${this.color}</span>
          <div class="flex items-end justify-between">
            <span class="font-medium opacity-90">${headerLabel}</span>
            <span class="font-mono uppercase opacity-80"
              >${this._hexValues[headerShade] || '...'}</span
            >
          </div>
        </div>

        <!-- List of Shades -->
        <div class="flex flex-col">
          ${shades.map((shade) => {
            const hex = this._hexValues[shade] || '#ffffff'
            const textColor = this.getTextColorClass(shade)
            const rowLabel = isStandard ? shade : `${this.color}${shade}`

            return html`
              <div
                class="${textColor} flex items-center justify-between px-4 py-3"
                style="background-color: ${hex}"
              >
                <span class="font-medium">${rowLabel}</span>
                <span class="font-mono uppercase opacity-80">${this._hexValues[shade] || ''}</span>
              </div>
            `
          })}
        </div>
      </div>
    `
  }
}

customElements.define('rm-colour-swatch', RmColourSwatch)
