import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-attr fixtures
// ---------------------------------------------------------------------------

export const attrTrueFixture: TestFixture = {
  name: 'attr_true',
  description: 'data-attr sets an attribute (boolean true sets empty-string presence)',
  html: `
    <div data-signals:flag="true">
      <span id="sut" data-attr:aria-checked="$flag"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.hasAttribute('aria-checked') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const attrFalseFixture: TestFixture = {
  name: 'attr_false',
  description: 'data-attr removes the attribute when the value is false',
  html: `
    <div data-signals:flag="false">
      <span id="sut" aria-checked="true" data-attr:aria-checked="$flag ? 'true' : null"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.hasAttribute('aria-checked') ? 0 : 1)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const attrNullFixture: TestFixture = {
  name: 'attr_null',
  description: 'data-attr with false removes the attribute',
  html: `
    <div data-signals:val="false">
      <span id="sut" data-attr:data-foo="$val"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.hasAttribute('data-foo') ? 0 : 1)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const attrStringFixture: TestFixture = {
  name: 'attr_string',
  description: 'data-attr sets a string attribute value',
  html: `
    <div data-signals:label="'hello'">
      <span id="sut" data-attr:aria-label="$label"></span>
      <code id="result"
            data-init="setTimeout(() => $result = sut.getAttribute('aria-label') === 'hello' ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
