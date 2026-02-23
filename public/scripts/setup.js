import { Database } from 'bun:sqlite'
import { spawn } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { getMigrations } from 'better-auth/db'
import { authOptions } from '../../src/auth-options.js'

//  Setup Path Logic
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..', '..')
const dbPath = join(projectRoot, 'data', process.env.DATABASE_NAME)
const envPath = join(projectRoot, '.env')

console.log('🚀 Starting System Setup...')
console.log(`📂 Project Root determined as: ${projectRoot}`)

// Validation: Check for Environment Variables
const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  PORT,
  DATABASE_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env

const missingVars = []
if (!ADMIN_EMAIL) missingVars.push('ADMIN_EMAIL')
if (!ADMIN_PASSWORD) missingVars.push('ADMIN_PASSWORD')
if (!ADMIN_NAME) missingVars.push('ADMIN_NAME')
if (!PORT) missingVars.push('PORT')

if (missingVars.length > 0) {
  console.error('\n❌ Error: Missing Environment Variables.')
  console.error(`   Checked for .env at: ${envPath}`)
  console.error(`   Missing: ${missingVars.join(', ')}`)
  console.error('   Please add these to your .env file.\n')
  process.exit(1)
} else {
  console.log('.env variables loaded successfully.')
  console.log('   - ADMIN_NAME:', ADMIN_NAME)
}

//  Create DB Directory & File
if (!existsSync(dirname(dbPath))) {
  mkdirSync(dirname(dbPath), { recursive: true })
}
const db = new Database(dbPath)
db.run('PRAGMA journal_mode = WAL')
console.log(`✅ Database created at: ${dbPath}`)

//  Run Better-Auth Migrations (programmatic, no CLI needed)
console.log('📦 Running Better-Auth Migrations...')
try {
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations({
    database: db,
    ...authOptions,
  })

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log('   No pending migrations.')
  } else {
    console.log(`   Tables to create: ${toBeCreated.length}, Tables to alter: ${toBeAdded.length}`)
    await runMigrations()
  }
  console.log('✅ Auth tables created/updated successfully.')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}

// Close the migration DB connection to release all locks before proceeding
db.close()
console.log('   (Closed migration DB connection to release locks)')

// Seed Admin User (via API)
console.log(`👤 Seeding Admin User (${ADMIN_EMAIL})...`)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

try {
  // Re-open a fresh connection just for the admin check query
  const dbCheck = new Database(dbPath)
  const existing = dbCheck.prepare('SELECT id FROM user WHERE email = ?').get(ADMIN_EMAIL)
  dbCheck.close()

  if (!existing) {
    console.log('   Starting temporary server to handle API request...')

    //  Start the server in the background
    const serverProcess = spawn('bun', ['src/server.js'], {
      cwd: projectRoot,
      // CRITICAL FIX: 'inherit' allows us to see the server's console logs/errors
      stdio: ['ignore', 'inherit', 'inherit'],
      detached: false,
      env: { ...process.env },
    })

    //  Wait for server to boot
    await wait(5000)

    try {
      console.log('   Sending Sign Up request...')

      const response = await fetch(`http://localhost:${PORT}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
          baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          name: ADMIN_NAME,
          data: {
            requiresPasswordChange: false,
            // Note: Omitted tempPasswordExpiresAt (better than sending null)
          },
        }),
      })

      if (response.ok) {
        console.log('✅ Admin user created successfully via API.')

        // Re-open DB connection for the final manual update
        const dbFinal = new Database(dbPath)

        const updateInfo = dbFinal
          .prepare("UPDATE user SET role = 'admin' WHERE email = ?")
          .run(ADMIN_EMAIL)

        if (updateInfo.changes > 0) {
          console.log('✅ User manually promoted to ADMIN role in database.')
        } else {
          console.error('❌ Failed to promote user to admin in DB.')
        }
        dbFinal.close()
      } else {
        const errText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errText}`)
      }
    } catch (reqErr) {
      console.error(`❌ Could not connect to localhost:${PORT}`)
      console.error('   Details:', reqErr.message)
    } finally {
      serverProcess.kill()
      console.log('   Temporary server stopped.')
    }
  } else {
    console.log('   Admin user already exists (Skipping).')
  }
} catch (err) {
  console.error('❌ Seeding failed:', err.message)
}

console.log('\n Setup Complete! You can now start the server normally.')
console.log(' e.g.  $ bun run dev')
