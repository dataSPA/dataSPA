import { test, expect } from '../base-fixture'
import {
  initFixture,
  initDelayFixture,
  initMultipleFixture,
  signalsExpressionFixture,
  signalsIfMissingFixture,
  signalsObjectFixture,
} from '../fixtures/init'

test.describe('init / signals', () => {
  test(initFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(initFixture)
    await expect(harnessPage.result).toHaveText(initFixture.expected)
  })

  test(initDelayFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(initDelayFixture)
    await expect(harnessPage.result).toHaveText(initDelayFixture.expected)
  })

  test(initMultipleFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(initMultipleFixture)
    await expect(harnessPage.result).toHaveText(initMultipleFixture.expected)
  })

  test(signalsExpressionFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(signalsExpressionFixture)
    await expect(harnessPage.result).toHaveText(signalsExpressionFixture.expected)
  })

  test(signalsIfMissingFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(signalsIfMissingFixture)
    await expect(harnessPage.result).toHaveText(signalsIfMissingFixture.expected)
  })

  test(signalsObjectFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(signalsObjectFixture)
    await expect(harnessPage.result).toHaveText(signalsObjectFixture.expected)
  })
})
