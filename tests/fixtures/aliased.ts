import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-star-* aliased attribute fixtures (requires datastar-aliased bundle)
// ---------------------------------------------------------------------------

export const aliasedTextFixture: TestFixture = {
  name: 'aliased_text',
  description: 'data-star-text works as an alias for data-text',
  html: `
    <div data-signals:result="1">
      <code id="result" data-star-text="$result"></code>
    </div>
  `,
  expected: '1',
}

export const aliasedSignalsFixture: TestFixture = {
  name: 'aliased_signals',
  description: 'data-star-signals works as an alias for data-signals',
  html: `
    <div data-star-signals:result="1">
      <code id="result" data-text="$result"></code>
    </div>
  `,
  expected: '1',
}

export const aliasedInitFixture: TestFixture = {
  name: 'aliased_init',
  description: 'data-star-init works as an alias for data-init',
  html: `
    <div data-signals:result="0">
      <code id="result"
            data-star-init="$result = 1"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
