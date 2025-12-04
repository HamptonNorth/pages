// create in project root
// dev.js v1.0 - Claude Sonnet 4.5
// Development script that runs server and Tailwind CSS watcher in parallel
// Handles graceful shutdown of both processes

import { spawn } from "bun";

console.log("🚀 Starting development environment...\n");

// Start Tailwind CSS watcher
console.log("🎨 Starting Tailwind CSS watcher...");
const tailwindProcess = spawn({
  cmd: [
    "bunx",
    "@tailwindcss/cli",
    "-i",
    "./public/styles/input.css",
    "-o",
    "./public/styles/output.css",
    "--watch",
  ],
  stdout: "inherit",
  stderr: "inherit",
});

// Give Tailwind a moment to initialize
await new Promise((resolve) => setTimeout(resolve, 1000));

// Start Bun server with watch mode
console.log("🔨 Starting Bun server with hot reload...");
const serverProcess = spawn({
  cmd: ["bun", "--watch", "src/server.js"],
  stdout: "inherit",
  stderr: "inherit",
});

console.log("\n✅ Development environment ready!");
console.log("   Server: http://localhost:3000");
console.log("   Tailwind: Watching for CSS changes");
console.log("\n   Press Ctrl+C to stop both processes\n");

// Handle graceful shutdown
function cleanup() {
  console.log("\n\n🛑 Shutting down...");
  tailwindProcess.kill();
  serverProcess.kill();
  process.exit(0);
}

// Listen for shutdown signals
process.on("SIGINT", cleanup); // Ctrl+C
process.on("SIGTERM", cleanup); // Kill command

// Keep the script running
await Promise.all([tailwindProcess.exited, serverProcess.exited]);
