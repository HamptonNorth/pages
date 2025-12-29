// version 1.2.1 Claude Opus 4.5
// rm-image.js - Custom image component with carousel support for markdown content
// Supports: single/multiple images, sizing, positioning, text wrapping, borders, rounded corners
// ARIA compliant for accessibility
//
// CHANGELOG:
// v1.2.1 - Fixed spacing: 8px bottom padding on wrapper, tighter title spacing
// v1.2 - Added title/caption support via slot content, displayed bottom-right
// v1.1 - Moved carousel arrows beneath image, fixed dot indicator synchronization
// v1.0 - Initial release

import { LitElement, html, css } from 'lit'

/**
 * rm-image - A flexible image component for markdown content
 *
 * @property {String|Array} src - Single image path or array of image paths for carousel
 * @property {String} width - Width in px (e.g., "300px") - maintains aspect ratio
 * @property {String} height - Height in px (e.g., "600px") - maintains aspect ratio
 * @property {String} position - Horizontal position: "left" | "center" | "right" (default: "left")
 * @property {String} wrap - Text wrapping mode: "inline" | "wrap" | "break" | "behind" | "in-front" (default: "inline")
 * @property {Boolean} border - Show border (2px primary-500) (default: false)
 * @property {String} rounded - Corner rounding: "none" | "xs" | "sm" | "md" | "lg" (default: "none")
 * @property {String} alt - Alt text for accessibility (applies to single image or all carousel images)
 * @slot - Default slot content becomes the image title/caption (displayed bottom-right)
 *
 * Usage Examples:
 * Single image with title:
 *   <rm-image src="/media/technical/flowchart1.png">Oronsay</rm-image>
 *
 * Carousel with title:
 *   <rm-image src='["/media/img1.png", "/media/img2.png"]'>Holiday Photos 2024</rm-image>
 *
 * With options:
 *   <rm-image
 *     src="/media/diagram.png"
 *     width="400px"
 *     position="center"
 *     wrap="wrap"
 *     border
 *     rounded="md"
 *     alt="System architecture diagram">
 *     Architecture Overview
 *   </rm-image>
 */
class RmImage extends LitElement {
  // ============================================================
  // STATIC PROPERTIES - Define reactive properties
  // ============================================================
  static properties = {
    // Image source - can be string or JSON array string
    src: { type: String },

    // Sizing - only one should be set to maintain aspect ratio
    width: { type: String },
    height: { type: String },

    // Horizontal positioning within container
    position: { type: String },

    // Text wrapping behaviour (Google Docs style)
    wrap: { type: String },

    // Border toggle
    border: { type: Boolean },

    // Corner rounding using Tailwind naming convention
    rounded: { type: String },

    // Alt text for accessibility
    alt: { type: String },

    // Internal state - current carousel index
    _currentIndex: { type: Number, state: true },

    // Internal state - parsed array of image sources
    _images: { type: Array, state: true },

    // Internal state - is this a carousel (multiple images)
    _isCarousel: { type: Boolean, state: true },

    // Internal state - has title content in slot
    _hasTitle: { type: Boolean, state: true },
  }

  // ============================================================
  // STATIC STYLES - Component CSS using Tailwind-compatible values
  // ============================================================
  static styles = css`
    /*
     * Host element styling
     * Uses CSS custom properties for theming compatibility
     */
    :host {
      --primary-500: #607d8b; /* primary-500 as default border */
      --primary-200: #b0bec5; /* primary-200 for title text */
      --border-width: 2px;
      display: block;
    }

    /* --------------------------------------------------------
     * WRAPPER STYLES - Controls text wrapping behaviour
     * Mirrors Google Docs image insertion options
     * -------------------------------------------------------- */

    /* Base wrapper styling - provides bottom spacing */
    .image-wrapper {
      padding-bottom: 0.5rem; /* 8px bottom spacing for all images */
    }

    /* Inline: Image sits in text flow like a character */
    .wrap-inline {
      display: inline-block;
      vertical-align: middle;
      padding-bottom: 0; /* No extra padding for inline images */
    }

    /* Wrap: Text wraps around the image (float behaviour) */
    .wrap-wrap.position-left {
      float: left;
      margin-right: 1rem;
      margin-bottom: 0.5rem;
    }

    .wrap-wrap.position-right {
      float: right;
      margin-left: 1rem;
      margin-bottom: 0.5rem;
    }

    .wrap-wrap.position-center {
      /* Center cannot float, so behaves like break */
      display: block;
      margin: 1rem auto;
      clear: both;
    }

    /* Break: Image breaks text flow, sits on its own line */
    .wrap-break {
      display: block;
      clear: both;
      margin: 1rem 0;
    }

    .wrap-break.position-left {
      margin-right: auto;
    }

    .wrap-break.position-center {
      margin-left: auto;
      margin-right: auto;
    }

    .wrap-break.position-right {
      margin-left: auto;
    }

    /* Behind: Image positioned behind text (background-like) */
    .wrap-behind {
      position: relative;
      z-index: -1;
    }

    /* In-front: Image positioned in front of text (overlay) */
    .wrap-in-front {
      position: relative;
      z-index: 10;
    }

    /* --------------------------------------------------------
     * IMAGE CONTAINER - Holds the image and carousel controls
     * -------------------------------------------------------- */
    .image-container {
      position: relative;
      display: inline-block;
      max-width: 100%;
      /*background-color: green !important;*/
      padding-top: 20px;
    }

    /* --------------------------------------------------------
     * IMAGE STYLES - The actual image element
     * -------------------------------------------------------- */
    .image {
      display: block;
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }

    /* Border styles when border attribute is present */
    .image.has-border {
      border: var(--border-width) solid var(--primary-500);
    }

    /* Rounded corner variants matching Tailwind naming */
    .image.rounded-xs {
      border-radius: 0.125rem;
    } /* 2px */
    .image.rounded-sm {
      border-radius: 0.25rem;
    } /* 4px */
    .image.rounded-md {
      border-radius: 0.375rem;
    } /* 6px */
    .image.rounded-lg {
      border-radius: 0.5rem;
    } /* 8px */

    /* --------------------------------------------------------
     * CAROUSEL CONTROLS - Container for arrows and indicators
     * All controls now positioned beneath the image
     * -------------------------------------------------------- */
    .carousel-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0 0.25rem 0;
    }

    /* Navigation button base styles - now inline with indicators */
    .carousel-nav {
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: 9999px;
      background-color: rgba(0, 0, 0, 0.15);
      color: #374151;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background-color 0.2s ease,
        opacity 0.2s ease;
      flex-shrink: 0;
    }

    .carousel-nav:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }

    .carousel-nav:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }

    .carousel-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* Navigation arrow icons */
    .carousel-nav svg {
      width: 1rem;
      height: 1rem;
    }

    /* --------------------------------------------------------
     * CAROUSEL INDICATORS - Dots showing current position
     * -------------------------------------------------------- */
    .carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    .carousel-indicator {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      border: none;
      background-color: rgba(0, 0, 0, 0.3);
      cursor: pointer;
      padding: 0;
      transition:
        background-color 0.2s ease,
        transform 0.2s ease;
    }

    .carousel-indicator:hover {
      background-color: rgba(0, 0, 0, 0.5);
      transform: scale(1.2);
    }

    .carousel-indicator:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }

    .carousel-indicator.active {
      background-color: var(--primary-500);
    }

    /* --------------------------------------------------------
     * FOOTER ROW - Contains controls (left/center) and title (right)
     * -------------------------------------------------------- */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0 0.25rem 0;
      gap: 1rem;
    }

    /* When no carousel, title takes full width and aligns right */
    /* Reduced padding for tighter layout with single images */
    .footer-row.title-only {
      justify-content: flex-end;
      padding: 0.15rem 0 0.5rem 0; /* 4px top only, wrapper provides bottom */
    }

    /* Controls section within footer */
    .footer-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* --------------------------------------------------------
     * TITLE/CAPTION STYLES - Slot content displayed bottom-right
     * -------------------------------------------------------- */
    .image-title {
      font-size: 0.75rem; /* Small font - 12px */
      line-height: 1;
      color: var(--primary-200); /* #b0bec5 */
      white-space: nowrap; /* No wrapping */
      overflow: hidden; /* Hide overflow */
      text-overflow: ellipsis; /* Add ellipsis when truncated */
      max-width: 100%; /* Constrain to container */
      text-align: right;
      flex-shrink: 1;
      min-width: 0; /* Allow shrinking below content size */
    }

    /* Hide the slot visually - we read its content via JS */
    .slot-container {
      display: none;
    }

    /* --------------------------------------------------------
     * SCREEN READER ONLY - Hidden but accessible text
     * -------------------------------------------------------- */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `

  // ============================================================
  // CONSTRUCTOR - Initialize default values
  // ============================================================
  constructor() {
    super()

    // Default property values
    this.src = ''
    this.width = ''
    this.height = ''
    this.position = 'left'
    this.wrap = 'inline'
    this.border = false
    this.rounded = 'none'
    this.alt = 'Image'

    // Internal state
    this._currentIndex = 0
    this._images = []
    this._isCarousel = false
    this._hasTitle = false
  }

  // ============================================================
  // LIFECYCLE - willUpdate: Parse src and prepare images array
  // ============================================================
  willUpdate(changedProperties) {
    if (changedProperties.has('src')) {
      this._parseSource()
    }
  }

  // ============================================================
  // LIFECYCLE - firstUpdated: Check for slot content
  // ============================================================
  firstUpdated() {
    this._checkSlotContent()
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Check if slot has any text content for title
   */
  _checkSlotContent() {
    const slot = this.shadowRoot.querySelector('slot')
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true })
      const textContent = nodes
        .map((node) => node.textContent || '')
        .join('')
        .trim()
      this._hasTitle = textContent.length > 0
    }
  }

  /**
   * Get the title text from slot content
   * @returns {String} Title text or empty string
   */
  _getTitleText() {
    const slot = this.shadowRoot.querySelector('slot')
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true })
      return nodes
        .map((node) => node.textContent || '')
        .join('')
        .trim()
    }
    return ''
  }

  /**
   * Parse the src attribute to determine if single image or carousel
   * Handles both string paths and JSON array strings
   */
  _parseSource() {
    if (!this.src) {
      this._images = []
      this._isCarousel = false
      return
    }

    // Try to parse as JSON array
    try {
      // Check if src looks like a JSON array
      const trimmed = this.src.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          this._images = parsed
          this._isCarousel = parsed.length > 1
          this._currentIndex = 0
          return
        }
      }
    } catch (e) {
      // Not valid JSON, treat as single image path
    }

    // Single image path
    this._images = [this.src]
    this._isCarousel = false
    this._currentIndex = 0
  }

  /**
   * Navigate to previous image in carousel
   * Uses requestUpdate() to ensure synchronization
   */
  _goToPrevious() {
    if (this._currentIndex > 0) {
      this._currentIndex = this._currentIndex - 1
      this.requestUpdate()
      this._announceSlideChange()
    }
  }

  /**
   * Navigate to next image in carousel
   * Uses requestUpdate() to ensure synchronization
   */
  _goToNext() {
    if (this._currentIndex < this._images.length - 1) {
      this._currentIndex = this._currentIndex + 1
      this.requestUpdate()
      this._announceSlideChange()
    }
  }

  /**
   * Navigate to specific image by index
   * Uses requestUpdate() to ensure synchronization
   * @param {Number} index - Target image index
   */
  _goToIndex(index) {
    if (index >= 0 && index < this._images.length && index !== this._currentIndex) {
      this._currentIndex = index
      this.requestUpdate()
      this._announceSlideChange()
    }
  }

  /**
   * Announce slide change for screen readers
   */
  _announceSlideChange() {
    // Use updateComplete to ensure DOM is ready before querying
    this.updateComplete.then(() => {
      const liveRegion = this.shadowRoot.querySelector('.carousel-live-region')
      if (liveRegion) {
        liveRegion.textContent = `Image ${this._currentIndex + 1} of ${this._images.length}`
      }
    })
  }

  /**
   * Handle keyboard navigation for carousel
   * @param {KeyboardEvent} event - Keyboard event
   */
  _handleKeydown(event) {
    if (!this._isCarousel) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        this._goToPrevious()
        break
      case 'ArrowRight':
        event.preventDefault()
        this._goToNext()
        break
      case 'Home':
        event.preventDefault()
        this._goToIndex(0)
        break
      case 'End':
        event.preventDefault()
        this._goToIndex(this._images.length - 1)
        break
    }
  }

  /**
   * Handle slot content changes
   */
  _handleSlotChange() {
    this._checkSlotContent()
    this.requestUpdate()
  }

  /**
   * Build CSS classes for the wrapper element based on position and wrap mode
   * @returns {String} Space-separated class names
   */
  _getWrapperClasses() {
    const classes = ['image-wrapper']

    // Add wrap mode class
    classes.push(`wrap-${this.wrap}`)

    // Add position class
    classes.push(`position-${this.position}`)

    return classes.join(' ')
  }

  /**
   * Build CSS classes for the image element
   * @returns {String} Space-separated class names
   */
  _getImageClasses() {
    const classes = ['image']

    // Add border class if border attribute is present
    if (this.border) {
      classes.push('has-border')
    }

    // Add rounded class if specified
    if (this.rounded && this.rounded !== 'none') {
      classes.push(`rounded-${this.rounded}`)
    }

    return classes.join(' ')
  }

  /**
   * Get inline styles for sizing
   * @returns {String} Inline style string
   */
  _getSizeStyles() {
    const styles = []

    // Apply width if specified
    if (this.width) {
      styles.push(`width: ${this.width}`)
      styles.push('height: auto') // Maintain aspect ratio
    }
    // Apply height if specified (and no width)
    else if (this.height) {
      styles.push(`height: ${this.height}`)
      styles.push('width: auto') // Maintain aspect ratio
    }
    // Default width if neither specified
    else {
      styles.push('max-width: 600px')
      styles.push('width: 100%')
      styles.push('height: auto')
    }

    return styles.join('; ')
  }

  /**
   * Render the carousel controls (arrows + indicators)
   * Separated for clarity and maintainability
   */
  _renderCarouselControls() {
    const currentIdx = this._currentIndex
    const totalImages = this._images.length

    return html`
      <!-- Previous button -->
      <button
        class="carousel-nav"
        @click="${this._goToPrevious}"
        ?disabled="${currentIdx === 0}"
        aria-label="Previous image"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Dot indicators -->
      <div class="carousel-indicators" role="tablist" aria-label="Image navigation">
        ${this._images.map(
          (_, index) => html`
            <button
              class="carousel-indicator ${index === currentIdx ? 'active' : ''}"
              role="tab"
              aria-selected="${index === currentIdx}"
              aria-label="Go to image ${index + 1}"
              @click="${() => this._goToIndex(index)}"
              type="button"
            ></button>
          `,
        )}
      </div>

      <!-- Next button -->
      <button
        class="carousel-nav"
        @click="${this._goToNext}"
        ?disabled="${currentIdx === totalImages - 1}"
        aria-label="Next image"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Screen reader live region for announcing slide changes -->
      <div class="carousel-live-region sr-only" role="status" aria-live="polite" aria-atomic="true">
        Image ${currentIdx + 1} of ${totalImages}
      </div>
    `
  }

  /**
   * Render the footer row with controls and/or title
   */
  _renderFooter() {
    const hasCarousel = this._isCarousel
    const titleText = this._getTitleText()
    const hasTitle = titleText.length > 0

    // No footer needed if no carousel and no title
    if (!hasCarousel && !hasTitle) {
      return ''
    }

    // Title only (no carousel)
    if (!hasCarousel && hasTitle) {
      return html`
        <div class="footer-row title-only">
          <span class="image-title" title="${titleText}">${titleText}</span>
        </div>
      `
    }

    // Carousel with or without title
    return html`
      <div class="footer-row">
        <div class="footer-controls">${this._renderCarouselControls()}</div>
        ${hasTitle
          ? html` <span class="image-title" title="${titleText}">${titleText}</span> `
          : ''}
      </div>
    `
  }

  // ============================================================
  // RENDER - Build the component template
  // ============================================================
  render() {
    // Handle empty state
    if (this._images.length === 0) {
      return html`
        <div class="image-wrapper" role="img" aria-label="No image source provided">
          <span class="sr-only">No image source provided</span>
        </div>
      `
    }

    // Get current values for rendering
    const currentIdx = this._currentIndex
    const currentImage = this._images[currentIdx]
    const imageClasses = this._getImageClasses()
    const sizeStyles = this._getSizeStyles()
    const wrapperClasses = this._getWrapperClasses()

    return html`
      <!-- Hidden slot to capture title content -->
      <div class="slot-container">
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </div>

      <div class="${wrapperClasses}">
        <!--
          Main image container
          For carousel: acts as a group with keyboard navigation
        -->
        <div
          class="image-container"
          role="${this._isCarousel ? 'group' : 'none'}"
          aria-roledescription="${this._isCarousel ? 'carousel' : ''}"
          aria-label="${this._isCarousel
            ? `Image carousel with ${this._images.length} images`
            : ''}"
          @keydown="${this._handleKeydown}"
          tabindex="${this._isCarousel ? '0' : '-1'}"
          style="${sizeStyles}"
        >
          <!-- Current image display -->
          <img
            src="${currentImage}"
            alt="${this.alt}${this._isCarousel
              ? ` (${currentIdx + 1} of ${this._images.length})`
              : ''}"
            class="${imageClasses}"
            style="${sizeStyles}"
            loading="lazy"
          />
        </div>

        <!-- Footer row: carousel controls and/or title -->
        ${this._renderFooter()}
      </div>
    `
  }
}

// ============================================================
// REGISTER COMPONENT - Define custom element
// ============================================================
customElements.define('rm-image', RmImage)

export { RmImage }
