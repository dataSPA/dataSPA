import { test, expect } from '../base-fixture'
import {
  classFixture,
  classAddedFixture,
  classMultipleFixture,
  classEmptyFixture,
  classCleanupFixture,
} from '../fixtures/class'

test.describe('data-class', () => {
  test(classFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(classFixture)
    await expect(harnessPage.result).toHaveText(classFixture.expected)
  })

  test(classAddedFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(classAddedFixture)
    await expect(harnessPage.result).toHaveText(classAddedFixture.expected)
  })

  test(classMultipleFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(classMultipleFixture)
    await expect(harnessPage.result).toHaveText(classMultipleFixture.expected)
  })

  test(classEmptyFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(classEmptyFixture)
    await expect(harnessPage.result).toHaveText(classEmptyFixture.expected)
  })

  test(classCleanupFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(classCleanupFixture)
    await expect(harnessPage.result).toHaveText(classCleanupFixture.expected)
  })
})
