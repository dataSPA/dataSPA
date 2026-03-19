import { defineConfig, devices } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// ---------------------------------------------------------------------------
// Bundle selection
//
// Set the BUNDLE env var to the basename (without .js) of the bundle file
// inside the top-level bundles/ directory.
//
// Examples:
//   BUNDLE=datastar             (default) → bundles/datastar.js
//   BUNDLE=datastar-aliased     → bundles/datastar-aliased.js
//   BUNDLE=datastar-core        → bundles/datastar-core.js
//
// The resolved absolute path is passed to every test worker via the
// BUNDLE_PATH env var, and to the Go server process via its --bundle flag.
// ---------------------------------------------------------------------------

const bundleName = process.env.BUNDLE ?? 'datastar'
const bundlePath = path.resolve(__dirname, '..', 'bundles', `${bundleName}.js`)

if (!fs.existsSync(bundlePath)) {
  console.error(
    `\n[playwright.config] ERROR: Bundle not found: ${bundlePath}\n` +
      `Run the build first:\n  task library\n` +
      `Or set BUNDLE to one of the files inside the bundles/ directory.\n`
  )
  process.exit(1)
}

console.log(`[playwright.config] Using bundle: ${bundlePath}`)

// Expose to all test workers via process.env (Playwright forks workers with
// the same environment that was set here in the config process).
process.env.BUNDLE_PATH = bundlePath
process.env.BUNDLE_NAME = bundleName

const SERVER_PORT = 7331

export default defineConfig({
  testDir: './specs',
  timeout: 10_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: `http://localhost:${SERVER_PORT}`,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // The Go server handles SSE/fetch tests. It is started once before all
  // tests and torn down after. Client-only tests use page.setContent() and
  // do not hit this server.
  webServer: {
    command: `go run . --bundle "${bundlePath}" --port ${SERVER_PORT}`,
    cwd: path.resolve(__dirname, 'server'),
    port: SERVER_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
    // Show server stdout/stderr in the terminal
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
