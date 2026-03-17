import { test, expect } from '../base-fixture'
import {
  jsonSignalsBasicFixture,
  jsonSignalsTerseFixture,
  jsonSignalsIncludeFilterFixture,
  jsonSignalsExcludeFilterFixture,
  jsonSignalsBasicCspFixture,
  jsonSignalsTerseCspFixture,
  jsonSignalsIncludeFilterCspFixture,
  jsonSignalsExcludeFilterCspFixture,
} from '../fixtures/json_signals'

test.describe('data-json-signals', () => {
  test(jsonSignalsBasicFixture.description, async ({ harnessPage, isCspBundle }, testInfo) => {
    if (isCspBundle) testInfo.skip(true, 'use CSP variant for CSP bundles')
    await harnessPage.load(jsonSignalsBasicFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsBasicFixture.expected)
  })

  test(jsonSignalsTerseFixture.description, async ({ harnessPage, isCspBundle }, testInfo) => {
    if (isCspBundle) testInfo.skip(true, 'use CSP variant for CSP bundles')
    await harnessPage.load(jsonSignalsTerseFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsTerseFixture.expected)
  })

  test(jsonSignalsIncludeFilterFixture.description, async ({ harnessPage, isCspBundle }, testInfo) => {
    if (isCspBundle) testInfo.skip(true, 'use CSP variant for CSP bundles')
    await harnessPage.load(jsonSignalsIncludeFilterFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsIncludeFilterFixture.expected)
  })

  test(jsonSignalsExcludeFilterFixture.description, async ({ harnessPage, isCspBundle }, testInfo) => {
    if (isCspBundle) testInfo.skip(true, 'use CSP variant for CSP bundles')
    await harnessPage.load(jsonSignalsExcludeFilterFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsExcludeFilterFixture.expected)
  })
})

test.describe('data-json-signals (CSP)', () => {
  test.beforeEach(async ({ isCspBundle }, testInfo) => {
    if (!isCspBundle) {
      testInfo.skip(true, 'requires a CSP bundle (BUNDLE=datastar-csp)')
    }
  })

  test(jsonSignalsBasicCspFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsBasicCspFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsBasicCspFixture.expected)
  })

  test(jsonSignalsTerseCspFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsTerseCspFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsTerseCspFixture.expected)
  })

  test(jsonSignalsIncludeFilterCspFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsIncludeFilterCspFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsIncludeFilterCspFixture.expected)
  })

  test(jsonSignalsExcludeFilterCspFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsExcludeFilterCspFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsExcludeFilterCspFixture.expected)
  })
})
