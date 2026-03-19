import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-on:click fixtures
// ---------------------------------------------------------------------------

export const onClickFixture: TestFixture = {
  name: 'on_click',
  description: 'data-on:click runs an expression when the element is clicked',
  html: `
    <div data-signals:result="0">
      <button id="btn" data-on:click="$result = 1">Click me</button>
      <code id="result" data-text="$result"></code>
    </div>
  `,
  expected: '1',
}

export const onClickToggleFixture: TestFixture = {
  name: 'on_click_toggle',
  description: 'data-on:click toggles a boolean signal',
  html: `
    <div data-signals:open="false">
      <button id="btn" data-on:click="$open = !$open">Toggle</button>
      <code id="result" data-text="$open ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}

export const onClickMultipleFixture: TestFixture = {
  name: 'on_click_multiple',
  description: 'multiple data-on:click handlers on different elements',
  html: `
    <div data-signals:a="false" data-signals:b="false">
      <button id="btn1" data-on:click="$a = true">A</button>
      <button id="btn2" data-on:click="$b = true">B</button>
      <code id="result" data-text="$a && $b ? 1 : 0"></code>
    </div>
  `,
  expected: '1',
}
