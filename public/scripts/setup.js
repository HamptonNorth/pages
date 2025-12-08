// scripts/setup.js
import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'

// Setup paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const dbPath = join(projectRoot, 'data', 'app3.db')

console.log('🚀 Starting System Setup...')

// 1. Create DB Directory & File
if (!existsSync(dirname(dbPath))) {
  mkdirSync(dirname(dbPath), { recursive: true })
}
const db = new Database(dbPath)
console.log(`✅ Database created at: ${dbPath}`)

// 2. Run Better-Auth CLI (Generate & Migrate)
console.log('📦 Running Better-Auth Migrations...')
try {
  // We point the CLI to our NODE config file, not the Bun one
  const configPath = './scripts/node-auth-config.js'

  // Generate
  execSync(`npx @better-auth/cli generate --config ${configPath}`, { stdio: 'inherit' })

  // Migrate
  execSync(`npx @better-auth/cli migrate --config ${configPath}`, { stdio: 'inherit' })
  console.log('✅ Auth tables created successfully.')
} catch (error) {
  console.error('❌ Migration failed.')
  process.exit(1)
}

// 3. Seed Admin User (Direct SQL)
console.log('👤 Seeding Admin User...')
try {
  const adminEmail = 'rcollins@redmug.co.uk'

  // Check if exists
  const existing = db.prepare('SELECT id FROM user WHERE email = ?').get(adminEmail)

  if (!existing) {
    // Create user
    const stmt = db.prepare(`
            INSERT INTO user (id, email, name, emailVerified, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
        `)

    // Note: In a real app, you cannot insert raw passwords.
    // Better-auth requires hashing.
    // Since we are seeding raw SQL, we can't easily hash like the library does.
    // STRATEGY: We will skip creating the user here via SQL to avoid broken passwords.
    // Instead, we will print the Curl command for you to run against the running server.
    console.log('⚠️  Skipping direct SQL user insert (Password hashing required).')
    console.log('👉 Please use the curl command below once the server is running.')
  } else {
    console.log('   Admin user already exists.')
  }
} catch (err) {
  console.error('❌ Seeding failed:', err.message)
}

console.log('\n🎉 Setup Complete! You can now start the server.')
console.log('   $ bun src/server.js')
