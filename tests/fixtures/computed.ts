import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-computed fixtures
// ---------------------------------------------------------------------------

export const computedBasicFixture: TestFixture = {
  name: 'computed_basic',
  description: 'data-computed creates a derived signal from other signals',
  html: `
    <div data-signals:a="1" data-signals:b="1">
      <span data-computed:sum="$a + $b"></span>
      <code id="result" data-text="$sum == 2 ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const computedReactiveFixture: TestFixture = {
  name: 'computed_reactive',
  description: 'data-computed updates when its dependencies change',
  html: `
    <div data-signals:x="0">
      <span data-computed:doubled="$x * 2"></span>
      <code id="result"
            data-init="$x = 5"
            data-text="$doubled == 10 ? 1 : 0">
      </code>
    </div>
  `,
  expected: '1',
}

export const computedObjectFixture: TestFixture = {
  name: 'computed_object',
  description: 'data-computed with object notation registers multiple computed signals at once',
  html: `
    <div data-signals:p="3" data-signals:q="4">
      <span data-computed="{ sumPQ: () => $p + $q, productPQ: () => $p * $q }"></span>
      <code id="result" data-text="$sumPQ == 7 && $productPQ == 12 ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}
