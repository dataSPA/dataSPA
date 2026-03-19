import { test, expect } from '../base-fixture'
import {
  styleFixture,
  styleConditionalFixture,
  styleCleanupFixture,
  styleObjectFixture,
} from '../fixtures/style'

test.describe('data-style', () => {
  test(styleFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(styleFixture)
    await expect(harnessPage.result).toHaveText(styleFixture.expected)
  })

  test(styleConditionalFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(styleConditionalFixture)
    await expect(harnessPage.result).toHaveText(styleConditionalFixture.expected)
  })

  test(styleCleanupFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(styleCleanupFixture)
    await expect(harnessPage.result).toHaveText(styleCleanupFixture.expected)
  })

  test(styleObjectFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(styleObjectFixture)
    await expect(harnessPage.result).toHaveText(styleObjectFixture.expected)
  })
})
