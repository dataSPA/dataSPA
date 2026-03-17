import { DSP, DSS } from '@engine/consts'
import { actions } from '@engine/engine'
import type { ExprEvaluator, ExprFn } from '@engine/expression'
import { root } from '@engine/signals'
import type { HTMLOrSVG } from '@engine/types'
import { snake } from '@utils/text'

const url = 'https://data-star.dev/errors'

const error = (
  ctx: Record<string, any>,
  reason: string,
  metadata: Record<string, any> = {},
) => {
  Object.assign(metadata, ctx)
  const e = new Error()
  const r = snake(reason)
  const q = new URLSearchParams({
    metadata: JSON.stringify(metadata),
  }).toString()
  const c = JSON.stringify(metadata, null, 2)
  e.message = `${reason}\nMore info: ${url}/${r}?${q}\nContext: ${c}`
  return e
}

/**
 * The original expression evaluator using `new Function`.
 * Requires `unsafe-eval` in a Content Security Policy.
 */
export const newFunctionEvaluator: ExprEvaluator = (
  value,
  { returnsValue = false, argNames = [], cleanups = new Map() } = {},
): ExprFn => {
  let expr = ''
  if (returnsValue) {
    // This regex allows Datastar expressions to support nested
    // regex and strings that contain ; without breaking.
    //
    // Each of these regex defines a block type we want to match
    // (importantly we ignore the content within these blocks):
    //
    // regex            \/(\\\/|[^\/])*\/
    // double quotes      "(\\"|[^\"])*"
    // single quotes      '(\\'|[^'])*'
    // ticks              `(\\`|[^`])*`
    // iife               \(\s*((function)\s*\(\s*\)|(\(\s*\))\s*=>)\s*(?:\{[\s\S]*?\}|[^;)\{]*)\s*\)\s*\(\s*\)
    //
    // The iife support is (intentionally) limited. It only supports
    // function and arrow syntax with no arguments, and no nested IIFEs.
    //
    // We also want to match the non delimiter part of statements
    // note we only support ; statement delimiters:
    //
    // [^;]
    //
    const statementRe =
      /(\/(\\\/|[^/])*\/|"(\\"|[^"])*"|'(\\'|[^'])*'|`(\\`|[^`])*`|\(\s*((function)\s*\(\s*\)|(\(\s*\))\s*=>)\s*(?:\{[\s\S]*?\}|[^;){]*)\s*\)\s*\(\s*\)|[^;])+/gm
    const statements = value.trim().match(statementRe)
    if (statements) {
      const lastIdx = statements.length - 1
      const last = statements[lastIdx].trim()
      if (!last.startsWith('return')) {
        statements[lastIdx] = `return (${last});`
      }
      expr = statements.join(';\n')
    }
  } else {
    expr = value.trim()
  }

  // Ignore any escaped values
  const escaped = new Map<string, string>()
  const escapeRe = RegExp(`(?:${DSP})(.*?)(?:${DSS})`, 'gm')
  let counter = 0
  for (const match of expr.matchAll(escapeRe)) {
    const k = match[1]
    const v = `__escaped${counter++}`
    escaped.set(v, k)
    expr = expr.replace(DSP + k + DSS, v)
  }

  // Replace signal references with bracket notation
  expr = expr.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\$]|\$(?!\{))*`)|\$\{([^{}]*)\}|\$([a-zA-Z_\d]\w*(?:[.-]\w+)*)/g,
    (match, quoted, interpolationExpr, signalName) => {
      if (quoted) return match
      if (interpolationExpr !== undefined) {
        return `\${${interpolationExpr.replace(
          /\$([a-zA-Z_\d]\w*(?:[.-]\w+)*)/g,
          (_: string, innerSignalName: string) =>
            innerSignalName
              .split('.')
              .reduce((acc: string, part: string) => `${acc}['${part}']`, '$'),
        )}}`
      }
      return signalName
        .split('.')
        .reduce((acc: string, part: string) => `${acc}['${part}']`, '$')
    },
  )

  expr = expr.replaceAll(/@([A-Za-z_$][\w$]*)\(/g, '__action("$1",evt,')

  // Replace any escaped values
  for (const [k, v] of escaped) {
    expr = expr.replace(k, v)
  }

  try {
    const fn = Function('el', '$', '__action', 'evt', ...argNames, expr)
    return (el: HTMLOrSVG, ...args: any[]) => {
      const action = (name: string, evt: Event | undefined, ...args: any[]) => {
        const err = error.bind(0, {
          plugin: { type: 'action', name },
          element: { id: el.id, tag: el.tagName },
          expression: {
            fnContent: expr,
            value,
          },
        })
        const fn = actions[name]
        if (fn) {
          return fn(
            {
              el,
              evt,
              error: err,
              cleanups,
            },
            ...args,
          )
        }
        throw err('UndefinedAction')
      }
      try {
        return fn(el, root, action, undefined, ...args)
      } catch (e: any) {
        console.error(e)
        throw error(
          {
            element: { id: el.id, tag: el.tagName },
            expression: {
              fnContent: expr,
              value,
            },
            error: e.message,
          },
          'ExecuteExpression',
        )
      }
    }
  } catch (e: any) {
    console.error(e)
    throw error(
      {
        expression: {
          fnContent: expr,
          value,
        },
        error: e.message,
      },
      'GenerateExpression',
    )
  }
}
