# Pages
## Summary

A simple writing/documentation site derived from bunstarter.

# bunstarter to pages

Changing the `<rm-nav-header>` component to the simpler content only version of the component is a simple edit in the source file `./src/client-component-build.js` to import `./src/components/rm-nav-header-pages.js`. The cahnages are then seen in every page. This removed:
- The Countries menu
- The Products menu
- Replaced the pages icon with  "Content" menu wording

The social sign in options were removed (reduces the steps to publish) by editing the `./src/auth-options.js` file.

Relevant usage documenation was moved from bunstarter `./public/pages/*/*.md`  to `./public/pages/documentation/*.md`

The .env was edited to pick up this new `./public/pages` directory

Unused *.md content, scripts and views were deleted as no longer needed

That gave a bare bones site ready for testing.


## Software stack
- Javascript with ES6 node_modules
- Bun 1.3+
- Lit to reduce custom component boilerplate code
- Tailwind CSS 
- SQLite
- Better-auth library for authentication
- Marked library for *.md --> *.html rendering
- CSpell library for spell checking of markdown pages
