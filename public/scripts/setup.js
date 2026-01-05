import Database from 'better-sqlite3'
import { execSync, spawn } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { dirname, resolve, join, relative } from 'path'
import { fileURLToPath } from 'url'

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
db.pragma('journal_mode = WAL')
console.log(`✅ Database created at: ${dbPath}`)

//  Run Better-Auth CLI (Generate & Migrate)
console.log('📦 Running Better-Auth Migrations...')
try {
  const absConfigPath = join(__dirname, 'node-auth-config.js')
  const configPath = relative(process.cwd(), absConfigPath)

  console.log(`   Config path set to: ${configPath}`)

  const execOptions = {
    input: 'y\n',
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env },
  }

  execSync(`npx @better-auth/cli generate --config ${configPath}`, execOptions)
  execSync(`npx @better-auth/cli migrate --config ${configPath}`, execOptions)
  console.log('✅ Auth tables created/updated successfully.')
} catch (error) {
  console.error('❌ Migration failed.')
  process.exit(1)
}

// Seed Admin User (via API)
console.log(`👤 Seeding Admin User (${ADMIN_EMAIL})...`)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

try {
  // Check if exists in DB first
  const existing = db.prepare('SELECT id FROM user WHERE email = ?').get(ADMIN_EMAIL)

  if (!existing) {
    console.log('   Starting temporary server to handle API request...')

    // Close the setup script's DB connection BEFORE spawning the server.
    // This prevents "Database Locked" errors when the server tries to write to the same file.
    db.close()
    console.log('   (Closed local DB connection to release locks)')

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    db.close()
  }
} catch (err) {
  console.error('❌ Seeding failed:', err.message)
}

console.log('\n Setup Complete! You can now start the server normally.')
console.log(' e.g.  $ bun run dev')
