# **Bun-starter setup**

## **bun**

Set up notes for bun-starter, a minimal template app for the following stack:

* Bun 1.3.xx  
* Tailwind   
* Lit     
* Bun serve with SQLite for persistent storage 

To see live, navigate to To see this, navigate to [https://bunstarter.redmug.dev/]

Follow bun installation instructions.

```shell
cd code/bun-starter
bun init
```


## **Tailwind**

Install dependencies:

```shell
bun add -D tailwindcss postcss autoprefixer
```

Create the file and add the following line to `./public/styles/input.css` 

```javascript
@import "tailwindcss";
```

This is the *only* file you'll edit for your CSS. Tailwind will use it to generate the final output.css file. 

From Tailwind 4.1+ all the separate imports are no longer needed  (e.g. @tailwindbase)

In separate terminal tabs, run:

```shell

bunx @tailwindcss/cli -i ./public/styles/input.css -o ./public/styles/output.css --watch

```

For minimal `test-tailwind.html` HTML page use:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test 1</title>
    <link rel="stylesheet" href="styles/output.css">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <main>
      <div class="m-8 text-2xl text-green-500">Test Tailwind with bun!</div>
    </main>  
</body>
</html>
```

Then, from the terminal:



```shell
bun run test-tailwind.html
```

Should see green text if Tailwind installed correctly.

## **Set up package.json scripts**

For now just add the script section to package.json with only `bun run dev`

```json
{
  "name": "bun-starter-2",
  "module": "test-tailwind.html",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "bun run dev.js"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6",
    "prettier": "3.6.2",
    "prettier-plugin-tailwindcss": "^0.7.1",
    "tailwindcss": "^4.1.17"
  },
  "peerDependencies": {
    "typescript": "^5"
  },
  "dependencies": {
    "@tailwindcss/cli": "^4.1.17",
    "eslint": "^9.39.1"
  }
}

```

Add the dev.js  to the root directory:

```javascript
// Runs server and Tailwind CSS watcher in parallel
import { $ } from 'bun'

console.log('Starting development environment with Tailwind CSS watcher...\n')

// Start Tailwind CSS watcher in background

const tailwindProcess = Bun.spawn(
  [
    'bunx',
    '@tailwindcss/cli@',
    '-i',
    './public/styles/input.css',
    '-o',
    './public/styles/output.css',
    '--watch',
  ],
  {
    stdout: 'ignore', // equivalent to .quiet()
    stderr: 'ignore',
  },
)
// Pause to ensure Tailwind is initialized
await new Promise((resolve) => setTimeout(resolve, 2000))

// Start Bun server with watch mode
const serverProcess = Bun.spawn(['bun', '--watch', './src/server.js'], {
  stdout: 'inherit',
  stderr: 'inherit',
})

console.log('\n   Press Ctrl+C to stop both processes\n')

// Handle graceful shutdown
function cleanup() {
  console.log('\n\n    Shutting down...\n')
  tailwindProcess.kill()
  serverProcess.kill()
  process.exit(0)
}

// Listen for shutdown signals
process.on('SIGINT', cleanup) // Ctrl+C
process.on('SIGTERM', cleanup) // Kill command

// Keep the script running
try {
  await Promise.all([tailwindProcess, serverProcess])
} catch (error) {
  console.error('Process error:', error)
  cleanup()
}


```

`bun run dev` then kick off both commands. `ctrl + C` kills both commands.

To ensure Tailwind classes are presented in a consistent order add:

```shell
bun add -d prettier-plugin-tailwindcss

```

In the `.prettierrc` file in root and add the `plugin` line

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Test by amending the order of classes in test-tailwind.css by moving `m-8` to the end. Saving should restore the default class order.
Go to `./public/styles/input.css` to view the custom theme colour pallette. Thes colours are base on Material Design 3 blue-grey and teal pallettes. 
## **bun serve**
Supports serving of `auth` routes, `api` routes, static files and file base serving of the HTML views

The file `server.js` imports  `bun:sqlite` and then calls the function `intialiseTestCountries()`. This function checks for an existing database/creates a new database, creates test tables `test_countries` and `test_products` . `test_countries` is populated with 100 countries (top 100 by GPD). The layout of the `test_countries` table is:

```sql
CREATE TABLE test_countries (
  rank INTEGER PRIMARY KEY,
  iso_code TEXT NOT NULL UNIQUE,
  iso_name TEXT NOT NULL,
  official_state_name TEXT,
  currency TEXT,
  currency_code TEXT, 
  tld TEXT,
  population REAL,
  gdp_billions_usd REAL
```

The test_countries table is used for an example GET api call and a GET call with a passed parameter - the search token. The test_products table is used for POST and PUT examples with JSON form data passsed to the API.

The code for creating and populating the `test_countries` and `test_products` is in `db-setup.js`. If is no database in `./data/` the database setup code also creates the better-auth files and the default admin user. Here is a sample outpu of database creation for a new install:

``` bash
Using database at: /home/rcollins/code/bun-starter/data/app2.db
SQLite database initialised at: /home/rcollins/code/bun-starter/data/app2.db
test_countries table created and populated
test_products table created and populated.

--- Fresh Database Detected: Starting Better-Auth Setup ---
Running Better-Auth Migration...
Using database at: /home/rcollins/code/bun-starter/data/app2.db
SQLite database initialised at: /home/rcollins/code/bun-starter/data/app2.db
-> name, email, emailVerified, image, createdAt, updatedAt, requiresPasswordChange fields on user table.
-> expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId fields on session table.
-> accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt fields on account table.
-> identifier, value, expiresAt, createdAt, updatedAt fields on verification table.
✔ Are you sure you want to run these migrations? … yes
Better-Auth tables created successfully.
Seeding initial admin user...
Admin user created: rcollins@redmug.co.uk
--- New app2.db database created and populated successfully ---

Build successful. ./public/components/client-components.js created.

Server running at http://localhost:3000
```

All calls pass through a controller for business logic and a model for database access. All data is returned as JSON


To see this, navigate to [https://bunstarter.redmug.dev/] and select Countries from nav bar.

### **Example API calls**

The `Get countries` button on the countries.html page implements a simple fetch to URL [`http://localhost:3000/api/test_countries`](http://localhost:3000/api/test_countries) and returns data from SQLite as JSON ordered by `gdp_billion_usd`.

The controller is `testCountries.controller.js` and the data access layer is `testCountries.model.js`

Here is a snippet of the returned data

```json
[
  {
    "iso_code": "USA",
    "iso_name": "United States of America",
    "official_state_name": "United States of America"
  },
  {
    "iso_code": "CHN",
    "iso_name": "China",
    "official_state_name": "People's Republic of China"
  },




]
```

## **URI naming**

* All Lowercase: Use only lowercase letters.  
* Kebab-Case: Use hyphens (-) to separate words. 

Examples:

`https://localhost:3000/api/test-countries`

## **SQL table naming and column naming**

* ##### snake\_case (lowercase with underscores) \- most widely accepted across SQL dialects

* ##### Use descriptive names: created\_at, user\_id, total\_amount

* ##### Avoid reserved keywords (order, user, date)

Examples:

`gdp_billions_usd`


## **Routes**

All API routes are set up in the `./src/routes/api.js` file. Names should be kebab-case using `-` between words.

Examples in  an html page script:

```javascript
// Fetch data
      const response = await fetch('/api/test-countries');
```

Example API route in  `./src/routes/api.js`:

```javascript

import { getAllTestCountries } from "../controllers/testCountries.controller.js";

// Handle API routes
export function handleApiRoutes(req, path) {
  const method = req.method;

  if (path === "/api/test-countries" && method === "GET") {
    console.log("api.js ln 11");
    return getAllTestCountries(); // calls function in controller
  }

  //  more routes here

  return Response.json({ error: "API endpoint not found" }, { status: 404 });
}

```


## **Resulting directory structure and file names**

```shell
.
├── better-auth_migrations
│   └── 2025-12-02T23-04-10.018Z.sql
├── bun.lock
├── data
│   └── app2.db
├── dev.js
├── eslint.config.js
├── favicon.ico
├── package.json
├── package-lock.json
├── public
│   ├── components
│   │   └── client-components.js
│   ├── docs
│   │   ├── adding-better-auth.md
│   │   ├── database-creation.md
│   │   ├── personal-setup-notes.md
│   │   └── roadmap.md
│   ├── index.html
│   ├── media
│   │   └── redmug_logo_316x316.png
│   ├── scripts
│   │   ├── countries.js
│   │   ├── countries-search.js
│   │   └── products.js
│   ├── styles
│   │   ├── input.css
│   │   ├── output.css
│   │   └── rm.css
│   └── views
│       ├── 404.html
│       ├── about.html
│       ├── countries.html
│       ├── countries-search.html
│       ├── menu-test.html
│       └── products.html
├── README.md
└── src
    ├── auth.js
    ├── client-components-build.js
    ├── components
    │   ├── rm-button.js
    │   ├── rm-default-container.js
    │   ├── rm-footer.js
    │   ├── rm-head.js
    │   └── rm-nav-header.js
    ├── controllers
    │   ├── testCountries.controller.js
    │   └── testProducts.controller.js
    ├── db-setup.js
    ├── models
    │   ├── testCountries.model.js
    │   └── testProducts.model.js
    ├── routes
    │   └── api.js
    ├── server.js
    └── utils.js

```

Generated using `tree -L 3 -I "node_modules|temp|.git|build|dist|__pycache__"~`

## **Components**

There are a (growing) collection of comonents. The are in the directory `./src/components`. The list as at release 1.4 consists of:

- <rm-head>               #consistent meta data for views
- <rm-nav-header>         # logo, title, header navigation, waffle menu, 3 dot menu and hamburger menu for samll viewports
- <rm-footer>             # a simple footer
- <rm-default-container>  # a container for page content so responsive break points are consistent across views
- <rm-button>             # consistently styled button with multiple sizes, secondary, erro and disabled settings
- <rm-login>      # sign in/sign out authentication UI

The components are combined into a single `js` file `./public/components/client-components.js` as part of the `server.js` code,

**Note:** If you modify any components ensure to restart your `server.js` if it is running as a `systemctl` process. If you don't you'll continu to see stale code. 


```

A minimal HTML page using these `<rm-*></rm-*>` components:

```html
<!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="/styles/output.css" />
    <link rel="stylesheet" href="/styles/rm.css" />      # your custom CSS
    <script type="module" src="/components/client-components.js"></script>
    <rm-head page-title="Simple view"></rm-head>
  </head>
  <body>
    <rm-default-container>
      <rm-nav-header class="block"></rm-nav-header>
        <div class="mx-8 my-8">Content here</div>
      <rm-footer></rm-footer>
    </rm-default-container>
  </body>
</html>
```

## **Naming standards**

API Layer:  e.g., getAllTestProducts, addTestUser in the controllers.  
Data Layer: e.g., getAllTestProductsData, addTestUserData in the models.  
Client-Side: e.g., getAllProducts, addProduct mirrors the API, which is a perfect pattern.  
Data/HTML: Use snake\_case (user\_id, first\_name) for data payloads and HTML form names. JS Variables: Use camelCase for JavaScript variables (userName)  
URIs: Lower case and hyphens (i.e kebab case) e.g /api/order-items


## **SQL**

To ensure compatible with SQLite and PostgreSQL use following to create tables from code:

```sql
CREATE TABLE your_table (  
id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL
  -- ... other columns
);

```

INT would be enough \- 2,147 million rows\!
