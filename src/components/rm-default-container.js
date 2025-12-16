import { LitElement, html } from 'lit'

export class RmDefaultContainer extends LitElement {
  render() {
    return html`
      <!-- Link to Tailwind Output to ensure styles inside Shadow DOM work -->
      <link rel="stylesheet" href="/styles/output.css" />

      <!--
        Container Logic:
        - min-h-screen: Ensures the container takes at least the full height of the viewport.
        - w-full: Takes available width up to the max-width.
        - max-w-[1200px]: Restricts width on large monitors
        - min-w-[320px]: Ensures readable layout on small mobiles
        - mx-auto: Centers the container within the viewport (provides the whitespace on sides).
        - bg-white: Defines the content area background.
        - shadow-xl: Adds depth to separate content from the browser background on wide screens.
        - flex flex-col: Allows children (header, main, footer) to layout vertically.
      -->
      <div
        class="relative mx-auto mb-8 flex min-h-screen w-full max-w-[1200px] min-w-[320px] flex-col bg-white shadow-xl"
      >
        <slot></slot>
      </div>
    `
  }
}

customElements.define('rm-default-container', RmDefaultContainer)
