# Roadmap
### Next Release 
Authentication and show a protected API route (SimpleWebAuth?, better-auth https://www.better-auth.com/) Add avatar to (replace?) 3-dot menu


### Next
Send emails (support issues)
Integrate upload/download/view docs (link to Open Cloud?). Ability to check out a file (gym spreadsheeet issue) WebDav protocol? synckit https://github.com/Dancode-188/synckit
Blog - simple version of /blog/page#. Auto index with search. Content as markdown or quarkdown
Simple search https://karboosx.net/post/4eZxhBon/building-a-simple-search-engine-that-actually-works
User admin - manage users/roles. Ban/unban users. Banner on login.

### Wild thoughts
Image carousel
Markdown slides viewer
Simple Markdown editor


## git
Now you are ready to code. Here is how your lifecycle looks from here:

- Code & Commit: You do your work on the feature/user-auth branch.
- Test: You run your tests.
- Merge: When Auth is working perfectly, you switch back to main and merge:

``` bash
git checkout main
git merge feature/user-auth
Release 2.0: Once merged, you repeat the tagging process:
```
- Release 2.0: Once merged, repeat the tagging process for the next release

``` bash
git tag -a v2.0.0 -m "Release 2.0: Added User Authentication"
git push origin v2.0.0
```


Set primary 600 to #134679  - Looks a good blue slight grey
