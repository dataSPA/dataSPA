import { test as base, expect, type Locator, type Page } from '@playwright/test'
import type { TestFixture } from './fixtures/types'

const BUNDLE_URL = 'http://localhost:7331/bundle.js'
const HARNESS_URL = 'http://localhost:7331/harness'

// ---------------------------------------------------------------------------
// The bundle name is injected by playwright.config.ts via process.env.
// ---------------------------------------------------------------------------
function getBundleName(): string {
  return process.env.BUNDLE_NAME ?? 'datastar'
}

// ---------------------------------------------------------------------------
// Build the minimal harness HTML page that loads datastar and renders the
// fixture HTML. The bundle is always served by the Go test server at
// /bundle.js, so module scripts load correctly (http:// origin).
// ---------------------------------------------------------------------------
function buildHarnessHtml(fixtureHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="importmap">{"imports":{"datastar":"${BUNDLE_URL}"}}</script>
  <script type="module">
    import { registerHelper } from 'datastar'
    registerHelper('safeParseJSON', (str) => {
      try { return JSON.parse(str) } catch { return null }
    })
    registerHelper('hasKey', (obj, key) => obj !== null && key in Object(obj))
  </script>
  <script type="module" src="${BUNDLE_URL}"></script>
</head>
<body>
  ${fixtureHtml}
</body>
</html>`
}

// ---------------------------------------------------------------------------
// HarnessPage — the object exposed to every test via the harnessPage fixture.
// ---------------------------------------------------------------------------
export interface HarnessPage {
  /** Load a client-only fixture by navigating to an intercepted harness URL */
  load(fixture: TestFixture): Promise<void>
  /** The #result element (shorthand for page.locator('#result')) */
  result: Locator
  /** The underlying Playwright Page */
  page: Page
}

// ---------------------------------------------------------------------------
// Custom test fixture
// ---------------------------------------------------------------------------
type TestFixtures = {
  harnessPage: HarnessPage
  /** Whether the current bundle is the aliased variant */
  isAliasedBundle: boolean
  /** Whether the current bundle is a CSP variant */
  isCspBundle: boolean
  /** The bundle name (e.g. 'datastar', 'datastar-aliased') */
  bundleName: string
}

export const test = base.extend<TestFixtures>({
  bundleName: async ({}, use) => {
    await use(getBundleName())
  },

  isAliasedBundle: async ({ bundleName }, use) => {
    await use(bundleName.includes('aliased'))
  },

  isCspBundle: async ({ bundleName }, use) => {
    await use(bundleName.includes('csp'))
  },

  harnessPage: async ({ page }, use) => {
    const harnessPage: HarnessPage = {
      page,
      result: page.locator('#result'),

      async load(fixture: TestFixture) {
        const html = buildHarnessHtml(fixture.html)

        // Intercept a synthetic harness URL so the page gets an http:// origin,
        // which is required for <script type="module"> to execute cross-origin.
        await page.route(HARNESS_URL, (route) => {
          route.fulfill({
            contentType: 'text/html',
            body: html,
          })
        })

        await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded' })

        // Unregister the route so it doesn't interfere with subsequent loads.
        await page.unroute(HARNESS_URL)
      },
    }

    await use(harnessPage)
  },
})

export { expect }
