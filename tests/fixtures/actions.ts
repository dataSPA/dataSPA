import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// Action fixtures — @setAll / @toggleAll
// ---------------------------------------------------------------------------

export const setAllPathFixture: TestFixture = {
  name: 'set_all_path',
  description: '@setAll sets every signal matching a path prefix to a value',
  html: `
    <div data-signals:foo="false" data-signals:bar="false">
      <span data-init="@setAll(true)"></span>
      <code id="result"
            data-init="setTimeout(() => $result = $foo && $bar ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const toggleAllPathFixture: TestFixture = {
  name: 'toggle_all_path',
  description: '@toggleAll toggles every signal matching a path prefix',
  html: `
    <div data-signals:open="false">
      <span data-init="@toggleAll()"></span>
      <code id="result"
            data-init="setTimeout(() => $result = $open ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
