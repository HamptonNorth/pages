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
