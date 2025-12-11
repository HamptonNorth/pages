// public/scripts/setup.js
import Database from 'better-sqlite3'
import { execSync, spawn } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { dirname, resolve, join, relative } from 'path' // Added 'relative'
import { fileURLToPath } from 'url'

// 1. Setup Path Logic
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..', '..')
const dbPath = join(projectRoot, 'data', 'app3.db')
const envPath = join(projectRoot, '.env')

console.log('🚀 Starting System Setup...')
console.log(`📂 Project Root determined as: ${projectRoot}`)

// 0. Validation: Check for Environment Variables
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, PORT } = process.env

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME || !PORT) {
  console.error('\n❌ Error: Missing Admin details in environment.')
  console.error(`   Checked for .env at: ${envPath}`)
  console.error('   Please ensure ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME and PORT are set.\n')
  process.exit(1)
} else {
  console.log('.env variables loaded successfully - ADMIN_NAME set to: ', ADMIN_NAME)
}

// 1. Create DB Directory & File
if (!existsSync(dirname(dbPath))) {
  mkdirSync(dirname(dbPath), { recursive: true })
}
const db = new Database(dbPath)
console.log(`✅ Database created at: ${dbPath}`)

// 2. Run Better-Auth CLI (Generate & Migrate)
console.log('📦 Running Better-Auth Migrations...')
try {
  // FIXED: Calculate path relative to process.cwd() to prevent "double path" errors in CLI
  const absConfigPath = join(__dirname, 'node-auth-config.js')
  const configPath = relative(process.cwd(), absConfigPath)

  console.log(`   Config path set to: ${configPath}`)

  const execOptions = {
    input: 'y\n',
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env },
  }

  // Generate
  execSync(`npx @better-auth/cli generate --config ${configPath}`, execOptions)

  // Migrate
  execSync(`npx @better-auth/cli migrate --config ${configPath}`, execOptions)
  console.log('✅ Auth tables created successfully.')
} catch (error) {
  console.error('❌ Migration failed.')
  process.exit(1)
}

// 3. Seed Admin User (via API)
console.log(`👤 Seeding Admin User (${ADMIN_EMAIL})...`)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

try {
  // Check if exists in DB first
  const existing = db.prepare('SELECT id FROM user WHERE email = ?').get(ADMIN_EMAIL)

  if (!existing) {
    console.log('   Starting temporary server to handle API request...')

    // 1. Start the server in the background
    // NOTE: This uses 'bun'. If you are moving strictly to Node, change 'bun' to 'node' below.
    const serverProcess = spawn('bun', ['src/server.js'], {
      cwd: projectRoot,
      stdio: 'ignore',
      detached: false,
      env: { ...process.env },
    })

    // 2. Wait for server to boot
    await wait(3000)

    try {
      console.log('   Sending Sign Up request...')

      const response = await fetch(`http://localhost:${PORT}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          name: ADMIN_NAME,
          role: 'admin',
          data: { requiresPasswordChange: false },
        }),
      })

      if (response.ok) {
        console.log('✅ Admin user created successfully via API.')
      } else {
        const errText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errText}`)
      }
    } catch (reqErr) {
      console.error(`❌ Could not connect to localhost:${PORT}`)
      console.error('   Details:', reqErr.message)
    } finally {
      // 4. Kill the temporary server
      serverProcess.kill()
      console.log('   Temporary server stopped.')
    }
  } else {
    console.log('   Admin user already exists (Skipping).')
  }
} catch (err) {
  console.error('❌ Seeding failed:', err.message)
}

console.log('\n🎉 Setup Complete! You can now start the server normally.')
console.log('   $ bun src/server.js')
