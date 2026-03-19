import { test, expect } from '../base-fixture'
import { refFixture, refKeyFixture } from '../fixtures/ref'

test.describe('data-ref', () => {
  test(refFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(refFixture)
    await expect(harnessPage.result).toHaveText(refFixture.expected)
  })

  test(refKeyFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(refKeyFixture)
    await expect(harnessPage.result).toHaveText(refKeyFixture.expected)
  })
})
