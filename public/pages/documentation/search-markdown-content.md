---
title: Search markdown content
summary: A weighted search of markdown content that works across all categories.
created: 2026-01-02
published: y
file-type: markdown
style: github
---
# Search
Search text in *.md files across all categories. This screenshot illustrates:
<rm-image src="/media/technical/search_example.png"  border rounded="md"></rm-image>
## Content Weighting
Finding the search string `github` is likely to be more relevant if the `github` is in the front matter title or the summary description rather than buried in the body of the text. Weightings are applied to return the search result in sensible order. The values given to the weighting are as follows:


| Content Region | Weight | Example |
|----------------|--------|---------|
| Front matter `title:` | 10 | Most important |
| Front matter `summary:` / `description:` | 8 | High priority |
| `# H1` headings | 6 | Section titles |
| `## H2` headings | 5 | Subsections |
| `### H3` headings | 4 | Minor sections |
| `#### to ######` | 2 | Deep headings |
| `**bold text**` | 2 | Emphasis |
| `[link text](url)` | 2 | Link labels |
| `> blockquotes` | 1.5 | Quoted content |
| Body text | 1 | General content |
| Code blocks | 0.5 | Rarely searched |


## Settings
To keep the search flexible, the key settings in the code base are: 

``` javascript
SEARCH_MIN_QUERY_LENGTH = 3
SEARCH_MAX_RESULTS = 20 
SEARCH_CONTEXT_CHARS = 30
```
If the signed in user has `role=admin` the search results will include any unpublished pages that match.

If the front matter has `private:sombody@gamil.com` set, the search will only return the page if the user is signed in with that email address.

## Uses SQLite FTS5

FTS5 is an SQLite virtual table module that provides full-text search functionality to database applications. The setup uses the same database with the FTS5 tables added to existing app3.db.

The following tables are added to the default database:

```bash
pages_search         
pages_search_content
pages_search_data  
pages_search_config 
pages_search_docsize
pages_search_idx   
pages_search_meta  
```

Searches are matched left-to-right, at word-start and are case-insensitive.

## API endpoints
To search across all pages:
```javascript
# limit is optional and defaults to 20 and has a max of 50
GET /api/pages/search?q=<query>&limit=50   
```
This might return:
```json
{
  "query": "start",
  "results": [
    {
      "category": "technical",
      "slug": "getting-started",
      "title": "Getting Started Guide",
      "description": "How to start your first project",
      "score": 18.5,
      "isPrivate": false,
      "isUnpublished": false,
      "matches": [
        { "region": "title", "fragment": "Getting Started Guide" }
      ]
    }
  ],
  "total": 5,
  "duration": "12ms"
}
```


## Source files and what they do
##### 1. `src/services/pages-search.js`
The search service provides:
- SQLite FTS5 full-text search index
- Weighted content extraction from markdown
- Prefix matching (left-to-right, word-start, case-insensitive)
- Access control (admin sees unpublished, email-matched private pages)

##### 2. `src/server.js` (modified)
Updated with:
- Import and initialization of search service
- Three new API endpoints - `POST /api/pages/reindex`, `GET /api/pages/search-meta` and `GET /api/pages/search?q=<query>`
- Integration with existing auth system

##### 3. `rm-pages-search-modal.js`
New custom component to surface the modal search page that accept the input of a search string and returns the resulting matched pages in 'weighted order`.
