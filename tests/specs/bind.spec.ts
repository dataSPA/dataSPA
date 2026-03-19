import { test, expect } from '../base-fixture'
import {
  bindTextInputFixture,
  bindCheckboxFixture,
  bindReactiveFixture,
} from '../fixtures/bind'

test.describe('data-bind', () => {
  test(bindTextInputFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(bindTextInputFixture)
    await expect(harnessPage.result).toHaveText(bindTextInputFixture.expected)
  })

  test(bindCheckboxFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(bindCheckboxFixture)
    await expect(harnessPage.result).toHaveText(bindCheckboxFixture.expected)
  })

  test(bindReactiveFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(bindReactiveFixture)
    await expect(harnessPage.result).toHaveText(bindReactiveFixture.expected)
  })
})
