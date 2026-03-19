import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-bind fixtures
// ---------------------------------------------------------------------------

export const bindTextInputFixture: TestFixture = {
  name: 'bind_text_input',
  description: 'data-bind syncs an input value to a signal',
  html: `
    <div data-signals:name="'hello'">
      <input id="inp" type="text" data-bind:name>
      <code id="result"
            data-init="setTimeout(() => $result = inp.value === 'hello' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const bindCheckboxFixture: TestFixture = {
  name: 'bind_checkbox',
  description: 'data-bind syncs a checkbox checked state to a boolean signal',
  html: `
    <div data-signals:checked="true">
      <input id="chk" type="checkbox" data-bind:checked>
      <code id="result"
            data-init="setTimeout(() => $result = chk.checked ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const bindReactiveFixture: TestFixture = {
  name: 'bind_reactive',
  description: 'data-bind reflects signal changes back to the input',
  html: `
    <div data-signals:val="'before'">
      <input id="inp" type="text" data-bind:val>
      <code id="result"
            data-init="$val = 'after'; setTimeout(() => $result = inp.value === 'after' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
