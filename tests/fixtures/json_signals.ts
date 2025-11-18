import type { TestFixture } from './types'

// ---------------------------------------------------------------------------
// data-json-signals fixtures
// ---------------------------------------------------------------------------

export const jsonSignalsBasicFixture: TestFixture = {
  name: 'json_signals_basic',
  description: 'data-json-signals outputs a pretty-printed JSON snapshot of all signals',
  html: `
    <div data-signals:count="42">
      <pre id="output" data-json-signals></pre>
      <code id="result"
            data-init="setTimeout(() => {
              try {
                const parsed = JSON.parse(output.textContent)
                $result = parsed.count === 42 ? 1 : 0
              } catch { $result = 0 }
            })"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsTerseFixture: TestFixture = {
  name: 'json_signals_terse',
  description: 'data-json-signals with __terse modifier outputs compact JSON (no indentation)',
  html: `
    <div data-signals:val="7">
      <pre id="output" data-json-signals__terse></pre>
      <code id="result"
            data-init="setTimeout(() => {
              const text = output.textContent
              try {
                const parsed = JSON.parse(text)
                $result = parsed.val === 7 && !text.includes('\\n') ? 1 : 0
              } catch { $result = 0 }
            })"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsIncludeFilterFixture: TestFixture = {
  name: 'json_signals_include_filter',
  description: 'data-json-signals include filter only outputs matching signals',
  html: `
    <div data-signals:foo="1" data-signals:bar="2">
      <pre id="output" data-json-signals="{ include: /^foo$/ }"></pre>
      <code id="result"
            data-init="setTimeout(() => {
              try {
                const parsed = JSON.parse(output.textContent)
                $result = ('foo' in parsed) && !('bar' in parsed) ? 1 : 0
              } catch { $result = 0 }
            })"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsExcludeFilterFixture: TestFixture = {
  name: 'json_signals_exclude_filter',
  description: 'data-json-signals exclude filter omits matching signals from the output',
  html: `
    <div data-signals:keep="10" data-signals:drop="20">
      <pre id="output" data-json-signals="{ exclude: /^drop$/ }"></pre>
      <code id="result"
            data-init="setTimeout(() => {
              try {
                const parsed = JSON.parse(output.textContent)
                $result = ('keep' in parsed) && !('drop' in parsed) ? 1 : 0
              } catch { $result = 0 }
            })"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

// ---------------------------------------------------------------------------
// CSP-safe variants — use #safeParseJSON / #hasKey helpers instead of
// try/catch and const declarations, which are unsupported by the jsep evaluator.
// ---------------------------------------------------------------------------

export const jsonSignalsBasicCspFixture: TestFixture = {
  name: 'json_signals_basic_csp',
  description: 'data-json-signals outputs a pretty-printed JSON snapshot of all signals',
  html: `
    <div data-signals:count="42">
      <pre id="output" data-json-signals></pre>
      <code id="result"
            data-init="setTimeout(() => $result = #safeParseJSON(output.textContent)?.count === 42 ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsTerseCspFixture: TestFixture = {
  name: 'json_signals_terse_csp',
  description: 'data-json-signals with __terse modifier outputs compact JSON (no indentation)',
  html: `
    <div data-signals:val="7">
      <pre id="output" data-json-signals__terse></pre>
      <code id="result"
            data-init="setTimeout(() => $result = #safeParseJSON(output.textContent)?.val === 7 && !output.textContent.includes('\\n') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsIncludeFilterCspFixture: TestFixture = {
  name: 'json_signals_include_filter_csp',
  description: 'data-json-signals include filter only outputs matching signals',
  html: `
    <div data-signals:foo="1" data-signals:bar="2">
      <pre id="output" data-json-signals="{ include: /^foo$/ }"></pre>
      <code id="result"
            data-init="setTimeout(() => $result = #hasKey(#safeParseJSON(output.textContent), 'foo') && !#hasKey(#safeParseJSON(output.textContent), 'bar') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}

export const jsonSignalsExcludeFilterCspFixture: TestFixture = {
  name: 'json_signals_exclude_filter_csp',
  description: 'data-json-signals exclude filter omits matching signals from the output',
  html: `
    <div data-signals:keep="10" data-signals:drop="20">
      <pre id="output" data-json-signals="{ exclude: /^drop$/ }"></pre>
      <code id="result"
            data-init="setTimeout(() => $result = #hasKey(#safeParseJSON(output.textContent), 'keep') && !#hasKey(#safeParseJSON(output.textContent), 'drop') ? 1 : 0)"
            data-text="$result">
      </code>
    </div>
  `,
  expected: '1',
}
