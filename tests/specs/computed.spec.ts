import { test, expect } from '../base-fixture'
import {
  computedBasicFixture,
  computedReactiveFixture,
  computedObjectFixture,
} from '../fixtures/computed'

test.describe('data-computed', () => {
  test(computedBasicFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(computedBasicFixture)
    await expect(harnessPage.result).toHaveText(computedBasicFixture.expected)
  })

  test(computedReactiveFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(computedReactiveFixture)
    await expect(harnessPage.result).toHaveText(computedReactiveFixture.expected)
  })

  test(computedObjectFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(computedObjectFixture)
    await expect(harnessPage.result).toHaveText(computedObjectFixture.expected)
  })
})
