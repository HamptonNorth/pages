---
title: Start here
summary: A quick explanation of pages
created: 2025-12-12T10:35:00-00:00
published: y
file-type: markdown
style: github
---

# Pages

The `bunstarter` template application includes a simple blog system. Mardown pages , in the right directories are automatically incuded in an index page with all navigation links.

In this sample set up there are three cartories of page. These are **start**, **rants** and **technical**. These are the categories used in the drop down naviagtion bar menu.

The categories are controlled by the `.env` file in the root directory. 

```bash
PAGES="start, technical:sidebar, rants"
```
The `:sidebar` controls an optional permanant left drawer menu which will be useful for documentation style sites.

The title, summary text and other variables come from `front matter`. Here is a the front matter for this page:

```text
---
title: Start here
summary: A quick explanation of pages
created: 2025-12-12T10:35:00-00:00
published: y
file-type: markdown
style: github
---
```

Using the front matter, pages may also be:
- marked as private by adding to the front matter block `private: john@gamil.com`. The page can only be view by the user signed in as 'john@gmail.com'
- Pages can be automatically lapsed by using `lapse: 2026-01-05T00:00:00`. This can be useful if you use pages for announcements (e.g Opening hours between Christmas and New Year 2025) 

There is no *sticky* flag in the front matter. Since there is no validation on `created:` date just make it `2099-01-01T00:00:00`. As the index is sorted *latest first* that should work!
