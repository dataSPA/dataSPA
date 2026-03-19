import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-ref fixtures
// ---------------------------------------------------------------------------

export const refFixture: TestFixture = {
  name: 'ref',
  description: 'data-ref stores an element reference in a signal',
  html: `
    <div data-signals:result="0">
      <span id="spanref" data-ref:spanref></span>
      <code id="result"
            data-init="setTimeout(() => $result = ($spanref && $spanref.id === 'spanref') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const refKeyFixture: TestFixture = {
  name: 'ref_key',
  description: 'data-ref with a key stores the element under a named signal',
  html: `
    <div data-signals:btn="null" data-signals:result="0">
      <button id="btn" data-ref:btn>Click</button>
      <code id="result"
            data-init="setTimeout(() => $result = ($btn && $btn.id === 'btn') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
