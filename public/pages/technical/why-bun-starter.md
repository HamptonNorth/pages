---
title: Why bunstarter was made
summary: Purpose and motivation for the bunstarter project
created: 2025-09-12T10:35:00-00:00
published: y
file-type: markdown
style: github
---
# bunstarter
## What's it for

Every time one starts a new web based application there are the same building blocks needed before you get to the new code specific to the app. Almost every application needs menus, headers, footer, hamburger menus on small viewports, account sub menus, authentication, a reset password function and so on.

This project provides a scaffolded fully working application that ships with most of the needed base functionality. It includes:
- Example HTML pages served by Bun
- Example Bun server with api to the back end with GET, POST, PUT and DELETE calls
- Strucured back end with routes, controllers and models
- Persistent back end storage using Bun SQLite connector
- Authentication using the better-auth library with example email/password, Google and GitHub sign in workflows
- Example components built with Lit, Javascript and Tailwind CSS
- Set up scripts to create database, create and populate better-auth tables and sample test data tables
- Responsive UI, works on mobile but examples designed for desktop apps
- A blog like **Pages** markdown to to HTML static pages section (think really simple Jekyl). Front matter supports indexing, auto lapsing, privacy and GitHub/Tailwind prose styling. Multiple categories set up from `.env` file.

Faced with a new web application, clone this stater template, hack out the bits that are not need then add the missing user requirements. If it's quicker than starting from scratch, I'll take that as a win.

## Software stack
- Javascript with ES6 node_modules
- Bun 1.3+
- Lit to reduce custom component boilerplate code
- Tailwind CSS 
- SQLite
- Better-auth library for authentication
- marked for markdown to HTML in `/pages` 


## Development set up
To clone that repository into say your `~/code` directory:

1. Navigate to your working directory

```bash
# Step 1
cd ~/code
```
