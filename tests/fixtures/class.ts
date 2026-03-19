import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-class fixtures
// ---------------------------------------------------------------------------

export const classFixture: TestFixture = {
  name: 'class',
  description: 'data-class conditionally adds a CSS class',
  html: `
    <div data-signals:result="0" data-signals:foo="false">
      <code id="result"
            data-class:foo="$foo"
            data-text="$result"
            data-init="$foo = true; setTimeout(() => $result = el.classList.contains('foo') ? 1 : 0)">
      </code>
    </div>
  `,
  expected: '1',
}

export const classAddedFixture: TestFixture = {
  name: 'class_added',
  description: 'data-class adds a class that was not present initially',
  html: `
    <div data-signals:active="false">
      <span id="sut" data-class:active="$active"></span>
      <code id="result"
            data-init="$active = true; setTimeout(() => $result = sut.classList.contains('active') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const classMultipleFixture: TestFixture = {
  name: 'class_multiple',
  description: 'multiple data-class bindings on the same element',
  html: `
    <div data-signals:a="false" data-signals:b="false" data-signals:result="0">
      <span id="sut" data-class:a="$a" data-class:b="$b"></span>
      <code id="result"
            data-init="$a = true; $b = true; setTimeout(() => $result = (sut.classList.contains('a') && sut.classList.contains('b')) ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const classEmptyFixture: TestFixture = {
  name: 'class_empty',
  description: 'data-class removes a class when the expression is false',
  html: `
    <div data-signals:active="true" data-signals:result="0">
      <span id="sut" class="active" data-class:active="$active"></span>
      <code id="result"
            data-init="$active = false; setTimeout(() => $result = sut.classList.contains('active') ? 0 : 1)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const classCleanupFixture: TestFixture = {
  name: 'class_cleanup',
  description: 'data-class preserves unrelated classes on the element',
  html: `
    <div data-signals:active="false" data-signals:result="0">
      <span id="sut" class="existing" data-class:active="$active"></span>
      <code id="result"
            data-init="$active = true; setTimeout(() => $result = sut.classList.contains('existing') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
