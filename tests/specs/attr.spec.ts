import { test, expect } from '../base-fixture'
import {
  attrTrueFixture,
  attrFalseFixture,
  attrNullFixture,
  attrStringFixture,
} from '../fixtures/attr'

test.describe('data-attr', () => {
  test(attrTrueFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(attrTrueFixture)
    await expect(harnessPage.result).toHaveText(attrTrueFixture.expected)
  })

  test(attrFalseFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(attrFalseFixture)
    await expect(harnessPage.result).toHaveText(attrFalseFixture.expected)
  })

  test(attrNullFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(attrNullFixture)
    await expect(harnessPage.result).toHaveText(attrNullFixture.expected)
  })

  test(attrStringFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(attrStringFixture)
    await expect(harnessPage.result).toHaveText(attrStringFixture.expected)
  })
})
