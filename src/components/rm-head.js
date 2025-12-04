// version 2.0 Gemini 2.5 Pro
// public/components/rm-head.js

import { LitElement } from 'lit'

export class RmHead extends LitElement {
  static properties = {
    pageTitle: { type: String, attribute: 'page-title' },
  }

  // CRITICAL: Keep this for rm-head.
  // We need to manipulate the real document head, not a shadow root.
  createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this.initHead()
  }

  /**
   * Populates the document head with common meta tags
   */
  initHead() {
    if (this.pageTitle) {
      document.title = this.pageTitle
    }

    this.addMetaTag('charset', 'UTF-8')
    this.addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    this.addMetaTag('description', 'Bun starter template')
    this.addMetaTag('author', 'RNC')
    this.addMetaTag('keywords', 'Bun 1.3 bun-serve tailwind tailwindcss Lit SQLite')

    this.addLinkTag('icon', '/favicon.ico', 'image/x-icon')
  }

  addMetaTag(attrName, attrValue) {
    if (attrName === 'charset') {
      if (!document.querySelector('meta[charset]')) {
        const meta = document.createElement('meta')
        meta.setAttribute('charset', attrValue)
        document.head.appendChild(meta)
      }
      return
    }

    if (!document.querySelector(`meta[name="${attrName}"]`)) {
      const meta = document.createElement('meta')
      meta.name = attrName
      meta.content = attrValue
      document.head.appendChild(meta)
    }
  }

  addLinkTag(rel, href, type = null) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      if (type) link.type = type
      document.head.appendChild(link)
    }
  }
}

customElements.define('rm-head', RmHead)
