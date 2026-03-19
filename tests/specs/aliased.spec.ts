import { test, expect } from '../base-fixture'
import {
  aliasedTextFixture,
  aliasedSignalsFixture,
  aliasedInitFixture,
} from '../fixtures/aliased'

test.describe('aliased attributes (data-star-*)', () => {
  test.beforeEach(async ({ isAliasedBundle }, testInfo) => {
    if (!isAliasedBundle) {
      testInfo.skip(true, 'requires datastar-aliased bundle (BUNDLE=datastar-aliased)')
    }
  })

  test(aliasedTextFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(aliasedTextFixture)
    await expect(harnessPage.result).toHaveText(aliasedTextFixture.expected)
  })

  test(aliasedSignalsFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(aliasedSignalsFixture)
    await expect(harnessPage.result).toHaveText(aliasedSignalsFixture.expected)
  })

  test(aliasedInitFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(aliasedInitFixture)
    await expect(harnessPage.result).toHaveText(aliasedInitFixture.expected)
  })
})
