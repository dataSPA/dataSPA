import { test, expect } from '../base-fixture'
import {
  onClickFixture,
  onClickToggleFixture,
  onClickMultipleFixture,
} from '../fixtures/on_click'

test.describe('data-on:click', () => {
  test(onClickFixture.description, async ({ harnessPage, page }) => {
    await harnessPage.load(onClickFixture)
    await page.click('#btn')
    await expect(harnessPage.result).toHaveText(onClickFixture.expected)
  })

  test(onClickToggleFixture.description, async ({ harnessPage, page }) => {
    await harnessPage.load(onClickToggleFixture)
    await page.click('#btn')
    await expect(harnessPage.result).toHaveText(onClickToggleFixture.expected)
  })

  test(onClickMultipleFixture.description, async ({ harnessPage, page }) => {
    await harnessPage.load(onClickMultipleFixture)
    await page.click('#btn1')
    await page.click('#btn2')
    await expect(harnessPage.result).toHaveText(onClickMultipleFixture.expected)
  })
})
