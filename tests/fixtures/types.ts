// ---------------------------------------------------------------------------
// TestFixture — describes a single test case.
//
// Client-only fixtures (no server interaction) set `html` and `expected`.
// SSE/fetch fixtures additionally set `serverPath` so the test navigates to
// the Go server rather than using page.setContent().
// ---------------------------------------------------------------------------
export interface TestFixture {
  /** Human-readable name, mirrors the datastar test name */
  name: string
  /** Short description of what is being tested */
  description: string
  /**
   * The HTML fragment injected into the minimal harness page.
   * Not used when serverPath is set (the Go server owns the full page).
   */
  html: string
  /** Expected text content of the #result element after the page settles */
  expected: string
  /**
   * If set, the test navigates to this path on the Go test server instead of
   * using page.setContent(). Used for SSE/fetch tests.
   * Example: '/tests/patch_element'
   */
  serverPath?: string
}
