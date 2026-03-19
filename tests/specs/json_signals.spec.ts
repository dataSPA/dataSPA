import { test, expect } from '../base-fixture'
import {
  jsonSignalsBasicFixture,
  jsonSignalsTerseFixture,
  jsonSignalsIncludeFilterFixture,
  jsonSignalsExcludeFilterFixture,
} from '../fixtures/json_signals'

test.describe('data-json-signals', () => {
  test(jsonSignalsBasicFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsBasicFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsBasicFixture.expected)
  })

  test(jsonSignalsTerseFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsTerseFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsTerseFixture.expected)
  })

  test(jsonSignalsIncludeFilterFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsIncludeFilterFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsIncludeFilterFixture.expected)
  })

  test(jsonSignalsExcludeFilterFixture.description, async ({ harnessPage }) => {
    await harnessPage.load(jsonSignalsExcludeFilterFixture)
    await expect(harnessPage.result).toHaveText(jsonSignalsExcludeFilterFixture.expected)
  })
})
