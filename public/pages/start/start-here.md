---
title: Start here
summary: A quick explanation of pages
created: 2099-12-30
published: y
file-type: markdown
style: github
sticky: true
---

# Pages

The `bunstarter` template application includes a simple blog system. Markdown pages , in the right directories are automatically included in an index page with all navigation links.

In this sample set up there are three categories or types of of pages. These are **start**, **rants** and **technical**. These are the categories used in the drop down naviagtion bar menu.

The categories are controlled by the `.env` file in the root directory. 

```bash
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia","docs":"mcss-verdana"}'
```
The `:sidebar` controls an optional permanant left drawer menu which will be useful for documentation style sites. The `:"github"`, `:"mcss-georgia"` are the style setting for the resulting HTML.

The title, summary text and other variables come from `front matter`. Here is a the front matter for this page:

```text
---
title: Start here
summary: A quick explanation of pages
created: 2099-12-30
published: y
file-type: markdown
style: github
sticky: true
---
```

Using the front matter, pages may also be:
- marked as *sticky* by adding to the front matter block `sticky: true`. Sticky pages will always be shown first.
- marked as private by adding to the front matter block `private: john@gamil.com`. The page can only be view by the user signed in as 'john@gmail.com'
- Pages can be automatically lapsed by using `lapse: 2026-01-05T00:00:00`. This can be useful if you use pages for announcements (e.g Opening hours between Christmas and New Year 2025)
