Here is the complete, consolidated documentation for **Release 2.0** (Backend Authentication). This guide incorporates all the path and driver fixes we implemented to ensure compatibility between Bun (Runtime) and Node (CLI).

-----

### **Phase 1: Dependencies**

**Step 1: Install Libraries**
We need the auth library and the Node.js SQLite driver (as a dev dependency) so the migration tools don't crash.

```bash
bun add better-auth
bun add -d better-sqlite3
```

-----

### **Phase 2: Universal Database Manager**

**Step 2: Update `src/db-setup.js`**
This file is now the single source of truth for your database. It handles the "Hybrid" logic (switching between Bun/Node drivers) and robust path resolution (finding the DB file relative to the script, not the terminal command).

**Create/Overwrite `src/db-setup.js` with this complete code:**

```javascript
// src/db-setup.js
import { resolve, dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { nowSQLiteFormat } from "./utils.js";

let db;

// --- 1. Robust Path Resolution ---
// This ensures the DB is always found at project-root/data/app.db
// regardless of where you run the 'bun' or 'npx' command from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..'); 
const dbPath = join(projectRoot, 'data', 'app.db');

// --- 2. Hybrid Driver Loading ---
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch (e) {
  console.error(`Error creating DB directory: ${e.message}`);
}

if (typeof Bun !== "undefined") {
  // Runtime: Use Bun's native, fast SQLite driver
  const { Database } = await import("bun:sqlite");
  db = new Database(dbPath);
} else {
  // CLI/Node: Use better-sqlite3 for compatibility during migrations
  const Database = (await import("better-sqlite3")).default;
  db = new Database(dbPath);
}

export { db };

// --- 3. Universal Helper Functions ---
// We use .prepare() and .exec() because they work in BOTH drivers.

export function tableExists(tableName) {
  try {
    const query = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
    return query.get(tableName) !== null;
  } catch (e) {
    return false;
  }
}

export function initialiseTestCountries(tableName = 'test_countries') {
  if (tableExists(tableName)) return;

  // Use .exec for schema creation
  db.exec(`CREATE TABLE ${tableName} (
    rank INTEGER PRIMARY KEY,
    iso_code TEXT NOT NULL UNIQUE,
    iso_name TEXT NOT NULL,
    official_state_name TEXT,
    currency TEXT,
    currency_code TEXT, 
    tld TEXT,
    population REAL,
    gdp_billions_usd REAL
  );`);

  // Use .exec for bulk setup scripts
  db.exec(`INSERT INTO ${tableName} (rank, iso_code, iso_name, official_state_name, currency, currency_code, tld, population, gdp_billions_usd) VALUES
    (1, 'USA', 'United States of America', 'United States of America', 'US Dollar', 'USD', '.us', 341.8, 30615.7),
    (2, 'CHN', 'China', 'People''s Republic of China', 'Chinese Yuan', 'CNY', '.cn', 1425.2, 19398.6),
    (3, 'GBR', 'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', 'Pound Sterling', 'GBP', '.uk', 69.8, 3958.8)
  ;`);
  console.log(`${tableName} table created`);
}

export function initialiseTestUsers(tableName = "test_users") {
  if (tableExists(tableName)) return;

  db.exec(`CREATE TABLE ${tableName} (
    id INTEGER PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    surname TEXT,
    status_setting TEXT,
    date_added TEXT,
    date_last_amended TEXT
  );`);

  const now = nowSQLiteFormat();
  const usersToInsert = [
    { id: 1, user_name: "rcollins", first_name: "Robert", surname: "Collins", status_setting: "Active", date_added: now, date_last_amended: now },
    { id: 2, user_name: "psmith", first_name: "Peter", surname: "Smith", status_setting: "Active", date_added: now, date_last_amended: now }
  ];

  const stmt = db.prepare(`INSERT INTO ${tableName} (id, user_name, first_name, surname, status_setting, date_added, date_last_amended) VALUES (?, ?, ?, ?, ?, ?, ?);`);

  const insertTransaction = db.transaction((users) => {
    for (const user of users) {
      stmt.run(user.id, user.user_name, user.first_name, user.surname, user.status_setting, user.date_added, user.date_last_amended);
    }
    return users.length;
  });

  try {
    insertTransaction(usersToInsert);
    console.log(`${tableName} table created`);
  } catch (error) {
    console.error("User init failed:", error);
  }
}

// Auto-initialize legacy tables
try {
  initialiseTestCountries();
  initialiseTestUsers();
} catch (e) {
  // Ignore init errors during CLI generation phases
}
```

-----

### **Phase 3: Auth Configuration**

**Step 3: Create `src/auth.js`**
This configures the library to use the DB we just set up.

```javascript
// src/auth.js
import { betterAuth } from "better-auth";
import { db } from "./db-setup.js"; 

export const auth = betterAuth({
    database: db,
    emailAndPassword: {  
        enabled: true 
    }
});
```

**Step 4: Create `src/auth-client.js`**
(Optional but recommended for when you do the frontend).

```javascript
// src/auth-client.js
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000"
});
```

-----

### **Phase 4: Server Integration**

**Step 5: Update `src/server.js`**
Here is the **complete** source code. This version handles authentication routes first, then your API, then static files.

```javascript
// src/server.js
import { auth } from './auth.js';
import { db } from './db-setup.js'; // Imports the DB and triggers table creation
import { handleApiRoutes } from './routes/api.js';

// Re-export db so existing models referencing 'server.js' don't break
export { db };

// Bundle the client components on server start.
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
});

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs);
} else {
  console.log('Build successful. ./public/components/client-components.js created.');
}

// Server Configuration
const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // 1. Auth Routes (Better-Auth)
    // Intercepts /api/auth/* requests (signin, signup, session, etc.)
    if (path.startsWith('/api/auth')) {
      return auth.handler(req);
    }

    // 2. API Routes
    if (path.startsWith('/api/')) {
      return handleApiRoutes(req, path);
    }

    // 3. Serve Bundled Components (Cached)
    if (path === '/components/client-components.js') {
      console.log('Serving bundled components (cached)');
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: {
          'Content-Type': 'text/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 4. Static Assets (CSS, JS, Images)
    if (
      path.startsWith('/styles/') ||
      path.startsWith('/scripts/') ||
      path.startsWith('/media/') ||
      path.startsWith('/docs/')
    ) {
      return serveStatic(path);
    }

    if (path === '/favicon.ico') {
      return new Response(Bun.file('./favicon.ico'), {
        headers: { 'Content-Type': 'image/x-icon' },
      });
    }

    // 5. HTML Pages (Routing)
    if (path === '/') {
      return serveHtmlPage('./public/index.html');
    }

    // Default: Try to find a matching HTML file in /public/views
    return serveHtmlPage('./public/views' + path);
  },
});

// --- Helper Functions ---

// Serves a static file from the public directory.
async function serveStatic(path) {
  const file = Bun.file(`./public${path}`);

  // Check if file exists to avoid serving empty bodies with wrong headers
  if (!(await file.exists())) {
    return serve404();
  }

  return new Response(file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// Serves an HTML file, returning 404 if missing.
async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath);

  if (!(await pageFile.exists())) {
    return serve404();
  }

  return new Response(pageFile, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function serve404() {
  const notFoundFile = Bun.file('./public/views/404.html');
  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new Response('Not Found', { status: 404 });
}

console.log(`\nServer running at http://localhost:${server.port}`);
```

-----

### **Phase 5: Schema Migration**

**Step 6: Generate the Schema**
We run the generator. Because of our `db-setup.js` fix, this now uses Node/better-sqlite3 cleanly.

```bash
npx @better-auth/cli generate --config ./src/auth.js
```

**Step 7: Apply the Schema**
We run the migration to actually create the tables.

```bash
npx @better-auth/cli migrate --config ./src/auth.js
```

-----

### **Phase 6: Testing (The Curl Test)**

**Step 8: Start the Server**
In your main terminal:

```bash
bun src/server.js
```

**Step 9: Run Curl**
In a *separate* terminal window, run this command to create a user:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'
```

**Step 10: Verify**
Run this command to check the database content:

```bash
bun sqlite ./data/app.db "SELECT * FROM user;"
```
