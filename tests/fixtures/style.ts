import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-style fixtures
// ---------------------------------------------------------------------------

export const styleFixture: TestFixture = {
  name: 'style',
  description: 'data-style sets an inline style property',
  html: `
    <div data-signals:color="'red'">
      <span id="sut" data-style:color="$color"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.style.color === 'red' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const styleConditionalFixture: TestFixture = {
  name: 'style_conditional',
  description: 'data-style reactively updates when the signal changes',
  html: `
    <div data-signals:visible="false" data-signals:result="0">
      <span id="sut" data-style:display="$visible ? 'block' : 'none'"></span>
      <code id="result"
            data-init="$visible = true; setTimeout(() => $result = sut.style.display === 'block' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const styleCleanupFixture: TestFixture = {
  name: 'style_cleanup',
  description: 'data-style removes a style property when the value is empty/null',
  html: `
    <div data-signals:color="'red'" data-signals:result="0">
      <span id="sut" data-style:color="$color"></span>
      <code id="result"
            data-init="$color = ''; setTimeout(() => $result = sut.style.color === '' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const styleObjectFixture: TestFixture = {
  name: 'style_object',
  description: 'data-style with object notation sets multiple style properties at once',
  html: `
    <div data-signals:result="0">
      <span id="sut" data-style="{ color: 'blue', fontWeight: 'bold' }"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.style.color === 'blue' && sut.style.fontWeight === 'bold' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
