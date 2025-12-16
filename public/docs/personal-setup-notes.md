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

Then edit the `package.json` to set the `module` to `test-tailwind.html`. This is used to test the bun+Tailwind combination before adding the server code.

Add a favicon to the root directory 

Create dir `/styles` and create file `output.css.` 

## **Set up Zed as editor of choice**

Zed requires following file to be present in the root directory to trigger the Language servers:

```javascript
// .prettierrrc
{
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}

```

From Zed setting, set Format On Save to true and enable Prettier as formatter (search prettier is easiest)

Test formatting by adding blank lines/removing indentation and saving \- should autoformat

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

console.log('🚀 Starting development environment...\n')

// Start Tailwind CSS watcher in background
console.log('🎨 Starting Tailwind CSS watcher...')
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
console.log('🔨 Starting Bun with hot reload...')
const serverProcess = Bun.spawn(['bun', '--watch', './src/server.js'], {
  stdout: 'ignore', 
  stderr: 'ignore',
})

console.log('\nDevelopment environment ready with watch for Tailwind changes!')
console.log('\n✅  Use http://localhost:3000/ to run in browser')

console.log('\n   Press Ctrl+C to stop both processes\n')

// Handle graceful shutdown
function cleanup() {
  console.log('\n\n🛑 Shutting down...\n')
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

## **bun serve**

Bun server can support both acting as a http server for web pages and as server for API calls. The server code is reworked as follows:



In order for ESlint to recognise `Bun` as a global alias, modify the [`eslint.config.js`](http://eslint.config.js) as follows:

```javascript
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        Bun: "readonly"
      }
    } 
  },
]);

```

**Server.js** 

```javascript

//  Connect to database
import { Database } from "bun:sqlite";
import { join } from "path";
import { initializeTestCountries } from "./db-setup.js";

import { handleApiRoutes } from "./routes/api.js";

// create and export database instance
export const db = new Database(join(import.meta.dir, "../data", "app.db"));
console.log("SQLite database initialised - path: ./data/app.db");

// set up example/test table
initializeTestCountries(db, "test_countries");


const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // API routes
    if (path.startsWith("/api/")) {
      return handleApiRoutes(req, path);
    }

    // Static assets (CSS, JS, images, docs, etc.)
    if (
      path.startsWith("/styles/") ||
      path.startsWith("/scripts/") ||
      path.startsWith("/assets/") ||
      path.startsWith("/docs/")
    ) {
      return serveStatic(path);
    }

    // Favicon
    if (path === "/favicon.ico") {
      return new Response(Bun.file("./favicon.ico"));
    }

    // HTML pages - serve from public directory
    return serveHtmlPage(path);
  },
});

// Serve static files
function serveStatic(path) {
  const file = Bun.file(`./public${path}`);

  return new Response(file);
}

// Serve HTML pages
async function serveHtmlPage(path) {
  // Handle root
  if (path === "/") {
    return new Response(Bun.file("./public/index.html"));
  }

  // Try to serve the HTML file directly
  // e.g., /about -> /about.html
  const htmlPath = path.endsWith(".html") ? path : `${path}.html`;
  const file = Bun.file(`./public${htmlPath}`);

  if (await file.exists()) {
    return new Response(file);
  }

  // 404 page - check if custom 404 exists
  const notFoundFile = Bun.file("./public/404.html");
  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, { status: 404 });
  }

  // Fallback to plain text 404
  return new Response("Not Found", { status: 404 });
}

console.log(`Server running at http://localhost:${server.port}`);

```

The file `server.js` imports  `bun:sqlite` and hen calls the function `intialiseTestCountries()`. This function checks for an existing database/creates a new database, creates a test table `test_countries` if it does not exist and populates with 100 countries (top 100 by GPD). The layout of the `test_countries` table is:

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

Finally the button in the client UI in `./public/countries.html` is wired up 

```javascript
<script>
  document.getElementById('getCountriesBtn').addEventListener('click', async () => {
    const resultDiv = document.getElementById('countriesResult');
    
    try {
           
      // Fetch data
      const response = await fetch('/api/test-countries');
            
      const countries = await response.json();
      
      // Display results
      if (countries.length === 0) {
        resultDiv.innerHTML = '<p>No countries found.</p>';
      } else {
        // resultDiv.innerHTML = JSON.stringify(countries)
        resultDiv.innerHTML = 
        `<table >
              <tr>
                <th >ISO Code</th>
                <th >ISO Name</th>
                <th >Official Name</th>
              </tr>
            </thead>
            <tbody >

              ${countries.map(c => `
                <tr>
                  <td >${c.iso_code}</td>
                  <td >${c.iso_name}</td>
                  <td class=>${c.official_state_name}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    } catch (error) {
      resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      console.error('Error fetching countries:', error);
    }
  });
</script>
```

To see this, navigate to [https://bunstarter.redmug.dev/] and select Countries from nav bar.

## **Adding API calls**

The `Get countries` button on the countries.html page implements a simple fetch to URL [`http://localhost:3000/api/test_countries`](http://localhost:3000/api/test_countries) and returns data from SQLite as JSON ordered by `gdp_billion_usd`.

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
.
.
.
]
```

This is all wired up using the following naming conventions with a 3-tier separation of presentation, business logic and data access:

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

## **Controllers**

Example `testCountriesController.js`

```javascript
export function getAllTestCountries() {
  try {
    //    add business logic here

    const countries = getAllTestCountriesData();

    return Response.json(countries);

  } catch (e) {
    console.error("Controller error: ", e.message);
    return new Response("Could not fetch all countries", { status: 500 });
  }
}
```

## **Models**

```javascript

import { db } from "../server.js";

export function getAllTestCountriesData() {
  const query = db.query(
    "SELECT iso_code, iso_name, official_state_name FROM test_countries ORDER BY gdp_billions_usd DESC",
  );
  return query.all();
}

```

## **Resulting directory structure and file names**

```shell
.
├── bun.lock
├── data
│   └── app.db
├── dev.js
├── eslint.config.js
├── favicon.ico
├── package.json
├── package-lock.json
├── public
│   ├── components
│   │   ├── rm-footer.js
│   │   ├── rm-head.js
│   │   └── rm-navheader.js
│   ├── docs
│   ├── index.html
│   ├── scripts
│   │   ├── countries.js
│   │   └── products.js
│   ├── styles
│   │   ├── input.css
│   │   ├── output.css
│   │   └── rm.css
│   └── views
│       ├── 404.html
│       ├── about.html
│       ├── countries.html
│       └── users.html
├── README.md
└── src
    ├── controllers
    │   ├── testCountries.controller.js
    │   └── testProducts.controller.js
    ├── db-setup.js
    ├── models
    │   ├── testCountries.model.js
    │   └── testUsers.model.js
    ├── routes
    │   └── api.js
    ├── server.js
    └── utils.js

```

Note that, in addition to the added directories/files, the `input.css` and `output.css` have moved to `./public/styles/` directory. Generated using `tree -L 3 -I "node_modules|temp|.git|build|dist|__pycache__"~`

## **Head, header and footer to components**

The meta data, nav menus and the footer are all repeats. These are extracted to Lit based components. The `<rm-navheader.js></rm-navheader>` looks like:

```javascript
// public/components/rm-navheader.js

import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm'

export class RmHeader extends LitElement {
  // Render into Light DOM to inherit Tailwind Global Styles
  createRenderRoot() {
    return this
  }

  render() {
    const currentPath = window.location.pathname
    // Adds 'underline font-semibold' if the link is active.
    const getLinkClass = (path) => {
      const baseClass = 'hover:underline'
      // Simple exact match or root match
      const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path))
      return isActive ? `${baseClass} underline font-semibold text-blue-900` : baseClass
    }

    return html`
      <header class="bg-slate-100 py-2">
        <nav class="flex gap-8 pt-2 pb-2 pl-12 text-blue-700">
          <a href="/" class="${getLinkClass('/')}">Home page</a>
          <a href="/countries.html" class="${getLinkClass('/countries.html')}">Countries</a>
          <a href="/users.html" class="${getLinkClass('/users.html')}">Users</a>
          <a href="/about.html" class="${getLinkClass('/about.html')}">About page</a>
        </nav>
      </header>
    `
  }
}

customElements.define('rm-navheader', RmHeader)


```

The resulting HTML pages:

```html
<!doctype html>
<html lang="en">
  <head>
     <!--Static CSS -->
    <link rel="stylesheet" href="/styles/output.css" />
    <link rel="stylesheet" href="/styles/rm.css" />
     <!--Load components -->
    <script type="module" src="/components/rm-head.js"></script>
    <script type="module" src="/components/rm-navheader.js"></script>
    <script type="module" src="/components/rm-footer.js"></script>

    <rm-head page-title="Home Page v2"></rm-head>
  </head>
  <body>
    .....
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


## Old README.md






======================================= OLD STUFF =====================================================
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

## Initial set up
Following a new install or when deleting an existing SQLite database to force creation, there will not be a database for the server.js app to read/update. 

When starting server.js, it checks if there is a database. If the test fails, the user is asked to run a node setup script (note a **node** script)

## setup.js script
# Database Creation
If the SQLite database does not exist, running the app (server.js) fails with the following message:
```
❌ CRITICAL ERROR: Database not found at /home/rcollins/code/bun-starter/data/app3.db
   Please run the setup script first. This creates an empty database and creates all the
   empty tables for authentication and adds the default admin user.

   Ensure the variables ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET are set in .env and then:

   From the terminal run:      node scripts/setup.js
   
```


The outline sequence to create a new database is:

1) Optionally delete the database from './data' - currently 'app3.db' if you want to create a new database and test data..
2) Check .env varaibles for ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET are set in .env
3) Run the script `node --env-file=.env public/scripts/setup.js`

To reset the database at any time simply delete the database file in `./data` eg. `app3.db` and rerun the node setup.js script.

### Why is this a node script and not a bun x script

Currently `bun x` cannot run the better-auth scripts e.g. `execSync(`npx @better-auth/cli generate --config ${configPath}`, execOptions)` will fail. This is a known issue and has been reported several times. All bug reports point to bun/node difference and are closed and redirected to https://github.com/oven-sh/bun/issues/4290 - when fixed the setup.js can be incorporated back into the vanilla bun server.js. For now it **must** run as a Node script.

## **bun serve**
Supports serving of `auth` routes, `api` routes, static files and file base serving of the HTML views

The file `server.js` imports  `bun:sqlite`, checks for the existence of a valid SQLite database and then calls the function `intialiseTestCountries()`. This function checks for existing test_* tables and if not found, creates test tables `test_countries` and `test_products` . `test_countries` is populated with 100 countries (top 100 by GPD). The layout of the `test_countries` table is:

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

The code for creating and populating the `test_countries` and `test_products` is in `db-setup.js`. 

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
│   └── 2025-12-09T12-48-10.136Z.sql
├── bun.lock
├── data
│   └── app3.db
├── dev.js
├── eslint.config.js
├── favicon.ico
├── package.json
├── package-lock.json
├── public
│   ├── components
│   │   └── client-components.js
│   ├── data
│   │   └── app3.db
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
│   │   ├── node-auth-config.js
│   │   ├── products.js
│   │   └── setup.js
│   ├── styles
│   │   ├── input.css
│   │   ├── output.css
│   │   └── rm.css
│   └── views
│       ├── 404.html
│       ├── about.html
│       ├── colours.html
│       ├── component-variants.html
│       ├── countries.html
│       ├── countries-search.html
│       ├── login.html
│       ├── menu-test.html
│       └── products.html
├── README.md
├── scripts
└── src
    ├── auth-client.js
    ├── auth.js
    ├── auth-options.js
    ├── client-components-build.js
    ├── components
    │   ├── rm-button.js
    │   ├── rm-colour-swatch.js
    │   ├── rm-default-container.js
    │   ├── rm-footer.js
    │   ├── rm-head.js
    │   ├── rm-login.js
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
- <rm-button>             # consistently styled button with multiple sizes, secondary, error and disabled settings
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
