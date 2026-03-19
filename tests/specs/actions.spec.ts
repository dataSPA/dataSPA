import { test, expect } from '../base-fixture'
import { setAllPathFixture, toggleAllPathFixture } from '../fixtures/actions'

test.describe('actions (@setAll / @toggleAll)', () => {
  test(setAllPathFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(setAllPathFixture)
    await expect(harnessPage.result).toHaveText(setAllPathFixture.expected)
  })

  test(toggleAllPathFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(toggleAllPathFixture)
    await expect(harnessPage.result).toHaveText(toggleAllPathFixture.expected)
  })
})
