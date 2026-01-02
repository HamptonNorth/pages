---
title: markdown tables for prose
summary: Adding tables to a markdown document (styled by TailwindCSS prose class)
created: 2025-12-12T10:35
published: y
file-type: markdown
style: tailwind
---

# markdown tables for prose

You can create tables with pipes | and hyphens -. Hyphens are used to create each column's header, while pipes separate each column. You must include a blank line before your table in order for it to correctly render. 

Note this page does not have the GitHub flavour set. `style:tailwind` in the front matter. The Tailwind `prose` class is better for text content pages. `style:github` in fron matter works best for technical content and content with tables.

```markdown

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |
| Third row cell- they don't all need to be the same width | Content Cell  |

```


This will render as:

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |
| Third row cell- they don't all need to be the same width | Content Cell  |

---

The alignment of columns can be sepecified but they are ignored in a TailwindCSS `class="prose"` section 

```markdown

| Centred | First Header  | Second Header | Right aligned |
| :---: | :---  | :--- | ---: |
| 12/12/2025 | Content Cell  | Content Cell  | 123.45 |
| 16/12/2025 | Content Cell  | Content Cell  | 3,299.75 |
| Xmas | Third row cell- a little bit wider | Content Cell  | Free to enter! |

```

This will render with all cells **left justified**:


| Centred | First Header  | Second Header | Right aligned |
| :---: | :---  | :--- | ---: |
| 12/12/2025 | Content Cell  | Content Cell  | 123.45 |
| 16/12/2025 | Content Cell  | Content Cell  | 3,299.75 |
| Xmas | Third row cell- a little bit wider | Content Cell  | Free to enter! |

Use `style:github` in the front matter if you want more control over column layouts. 

There are lot and lots of markdown tutorials on the internet. Two good guides are [John Gruber's site](https://daringfireball.net/projects/markdown/syntax) or for a somewhat longer guide [GitHub's site](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).
