import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// patch_element — SSE-based fixture
//
// The page navigates to the Go server which:
//   1. Serves a harness HTML page with data-init="@get('/tests/patch_element/data')"
//   2. The SSE endpoint streams a datastar-patch-elements event that replaces
//      <code id="result">0</code> with <code id="result">1</code>
// ---------------------------------------------------------------------------

export const patchElementFixture: TestFixture = {
  name: 'patch_element',
  description: 'datastar-patch-elements SSE event patches the DOM',
  html: '',           // not used — the server renders the harness
  expected: '1',
  serverPath: '/tests/patch_element',
}
