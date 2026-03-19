import { test, expect } from '../base-fixture'
import { patchElementFixture } from '../fixtures/patch_element'

test.describe('patch_element (SSE)', () => {
  test(patchElementFixture.description, async ({ harnessPage, page }) => {
    // SSE-based test: navigate to the Go server page
    await page.goto(patchElementFixture.serverPath!)
    await expect(page.locator('#result')).toHaveText(patchElementFixture.expected)
  })
})
