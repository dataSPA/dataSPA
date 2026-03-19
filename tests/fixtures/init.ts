import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-init / data-signals fixtures
// ---------------------------------------------------------------------------

export const initFixture: TestFixture = {
  name: 'init',
  description: 'data-init runs once on initialisation',
  html: `
    <div data-signals:result="false" data-init="$result = true">
      <code id="result" data-text="$result ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const initDelayFixture: TestFixture = {
  name: 'init_delay',
  description: 'data-init with a setTimeout still fires',
  html: `
    <div data-signals:result="false"
         data-init="setTimeout(() => $result = true, 50)">
      <code id="result" data-text="$result ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const initMultipleFixture: TestFixture = {
  name: 'init_multiple',
  description: 'multiple data-init attributes on different elements all run',
  html: `
    <div data-signals:a="false" data-signals:b="false">
      <span data-init="$a = true"></span>
      <span data-init="$b = true"></span>
      <code id="result" data-text="$a && $b ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const signalsExpressionFixture: TestFixture = {
  name: 'signals_expression',
  description: 'data-signals with an expression sets the signal value',
  html: `
    <div data-signals:result="1 + 1">
      <code id="result" data-text="$result == 2 ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const signalsIfMissingFixture: TestFixture = {
  name: 'signals_if_missing',
  description: 'data-signals with :ifmissing modifier does not overwrite existing signal',
  html: `
      <div data-signals:result="99">
        <div data-signals:result__ifmissing="0">
          <code id="result" data-text="$result == 99 ? 1 : 0"></code>
        </div>
      </div>
  `,
  expected: '1',
}

export const signalsObjectFixture: TestFixture = {
  name: 'signals_object',
  description: 'data-signals with object notation sets multiple signals at once',
  html: `
    <div data-signals="{ a: 1, b: 2 }">
      <code id="result" data-text="$a + $b == 3 ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}
