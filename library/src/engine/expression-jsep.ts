/**
 * CSP-safe expression evaluator using jsep.
 *
 * Parses a constrained subset of JavaScript expressions into an AST and
 * walks the AST to evaluate them — no `eval` or `new Function` required.
 *
 * Supported syntax:
 *   - Literals: numbers, strings, booleans, null, regex literals (via @jsep-plugin/regex)
 *   - Identifiers: resolved from scope, then window; error if not found
 *   - Member expressions: obj.prop, obj['prop']
 *   - Binary/unary/logical operators
 *   - Ternary (conditional) expressions
 *   - Arrow functions: `() => expr`, `(x) => expr` (via @jsep-plugin/arrow)
 *   - Template literals (via @jsep-plugin/template)
 *   - Call expressions: callee must resolve to a function
 *   - Assignment expressions: = += -= etc. (via @jsep-plugin/assignment)
 *   - Array literals
 *   - Object literals: { key: value, ... } (via @jsep-plugin/object)
 *   - Multi-statement expressions separated by semicolons: $a = 1; $b = 2
 *   - Signal reads/writes via $ prefix  →  __sig['name']
 *   - Action calls via @ prefix         →  __action('name', evt, ...args)
 *   - Helper calls via # prefix         →  __helper('name', ...args)
 *
 * Explicitly unsupported (throws a helpful error):
 *   - Function expressions (`function() {}`)
 *   - new expressions
 *   - Comma sequence operator: (a, b)
 */

import { actions } from '@engine/engine'
import type { ExprEvaluator, ExprFn } from '@engine/expression'
import { callHelper } from '@engine/helpers'
import { root } from '@engine/signals'
import type { HTMLOrSVG } from '@engine/types'
import arrowPlugin, { type ArrowExpression } from '@jsep-plugin/arrow'
import assignmentPlugin, {
  type AssignmentExpression,
  type UpdateExpression,
} from '@jsep-plugin/assignment'
import objectPlugin, {
  type ObjectExpression,
  type Property,
} from '@jsep-plugin/object'
import regexPlugin from '@jsep-plugin/regex'
import templatePlugin, {
  type TemplateElement,
  type TemplateLiteral,
} from '@jsep-plugin/template'
import jsep from 'jsep'

// Register plugins once at module load
jsep.plugins.register(
  assignmentPlugin,
  templatePlugin,
  arrowPlugin,
  objectPlugin,
  regexPlugin,
)

// ---------------------------------------------------------------------------
// Preprocessor: rewrite $, @, # prefixes into stable scope identifiers
// ---------------------------------------------------------------------------

/**
 * Rewrites the three Datastar expression prefixes so that jsep can parse the
 * resulting string as plain JavaScript:
 *
 *   $signal           →  __sig['signal']
 *   $foo.bar          →  __sig['foo']['bar']
 *   @action(args)     →  __action('action', __evt, args)
 *   #helper(args)     →  __helper('helper', args)
 *
 * String/template literals are left untouched.
 */
export const preprocessExpression = (raw: string): string => {
  let expr = raw.trim()

  // ------------------------------------------------------------------
  // Rewrite $signal references → __sig['name']['sub']
  // Must skip content inside string/template literals.
  // ------------------------------------------------------------------
  expr = expr.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\$]|\$(?!\{))*`)|\$\{([^{}]*)\}|\$([a-zA-Z_\d]\w*(?:[.-]\w+)*)/g,
    (match, quoted, interpolationExpr, signalName) => {
      if (quoted) return match
      // Template interpolation: rewrite inner $signals
      if (interpolationExpr !== undefined) {
        const inner = interpolationExpr.replace(
          /\$([a-zA-Z_\d]\w*(?:[.-]\w+)*)/g,
          (_: string, name: string) =>
            name
              .split('.')
              .reduce(
                (acc: string, part: string) => `${acc}['${part}']`,
                '__sig',
              ),
        )
        return `\${${inner}}`
      }
      // Plain $signal reference
      return signalName
        .split('.')
        .reduce((acc: string, part: string) => `${acc}['${part}']`, '__sig')
    },
  )

  // ------------------------------------------------------------------
  // Rewrite @action(args)  →  __action('action', __evt, args)
  // Zero-arg calls (@name()) must not produce a trailing comma.
  // ------------------------------------------------------------------
  // Zero-arg: @name()  →  __action('name', __evt)
  expr = expr.replaceAll(/@([A-Za-z_$][\w$]*)\(\)/g, "__action('$1', __evt)")
  // With-args: @name(  →  __action('name', __evt,   (args follow before the closing paren)
  expr = expr.replaceAll(
    /@([A-Za-z_$][\w$]*)\((?!\))/g,
    "__action('$1', __evt, ",
  )

  // ------------------------------------------------------------------
  // Rewrite #helper(args)  →  __helper('helper', args)
  // Zero-arg calls (#name()) must not produce a trailing comma.
  // ------------------------------------------------------------------
  // Zero-arg: #name()  →  __helper('name')
  expr = expr.replaceAll(/#([A-Za-z_$][\w$]*)\(\)/g, "__helper('$1')")
  // With-args: #name(  →  __helper('name',   (args follow before the closing paren)
  expr = expr.replaceAll(/#([A-Za-z_$][\w$]*)\((?!\))/g, "__helper('$1', ")

  return expr
}

// ---------------------------------------------------------------------------
// AST post-processing
// ---------------------------------------------------------------------------

/**
 * Fixes a parsing ambiguity in @jsep-plugin/arrow:
 *
 * The arrow plugin's empty-arg hook calls `gobbleBinaryExpression()` to parse
 * the arrow body, which does NOT consume ternary (`? :`) operators.  As a
 * result, an expression like
 *
 *   setTimeout(() => $result = cond ? 1 : 0)
 *
 * is mis-parsed as
 *
 *   ConditionalExpression {
 *     test:       ArrowFunctionExpression { body: AssignmentExpression($result = cond) },
 *     consequent: 1,
 *     alternate:  0,
 *   }
 *
 * when the correct tree is
 *
 *   ArrowFunctionExpression {
 *     body: AssignmentExpression {
 *       left:  $result,
 *       right: ConditionalExpression { test: cond, consequent: 1, alternate: 0 },
 *     }
 *   }
 *
 * The fix: walk down the chain of AssignmentExpression nodes in the arrow body
 * to find where the ternary test begins, then graft the ternary there.
 *
 * This function walks the full AST and repairs every such occurrence.
 */
const fixArrowTernaries = (node: AnyExpression): AnyExpression => {
  if (!node || typeof node !== 'object') return node

  // The mis-parse manifests as: ConditionalExpression whose `test` is an
  // ArrowFunctionExpression.  Restructure it so the ternary lives inside the
  // arrow body instead.
  if (
    node.type === 'ConditionalExpression' &&
    node.test &&
    node.test.type === 'ArrowFunctionExpression'
  ) {
    const arrow = node.test as AnyExpression

    // Deep-clone the arrow body so we can mutate it safely
    const newBody: AnyExpression = JSON.parse(
      JSON.stringify(arrow.body),
    ) as AnyExpression

    // Find the deepest AssignmentExpression whose `right` should become the
    // ternary test.  Non-assignment binary nodes (&&, ||, +, …) have higher
    // precedence than ternary, so they stay inside the ternary test rather
    // than being split off.
    const findDeepestAssignment = (n: AnyExpression): AnyExpression | null => {
      if (
        n.type === 'AssignmentExpression' &&
        n.right &&
        n.right.type === 'AssignmentExpression'
      ) {
        return findDeepestAssignment(n.right as AnyExpression)
      }
      if (n.type === 'AssignmentExpression') return n
      return null
    }

    const deepestAssign = findDeepestAssignment(newBody)
    const ternary: AnyExpression = {
      type: 'ConditionalExpression',
      test: deepestAssign ? (deepestAssign.right as AnyExpression) : newBody,
      consequent: node.consequent,
      alternate: node.alternate,
    } as AnyExpression

    let fixedBody: AnyExpression
    if (deepestAssign) {
      deepestAssign.right = ternary
      fixedBody = newBody
    } else {
      fixedBody = ternary
    }

    return {
      type: 'ArrowFunctionExpression',
      params: arrow.params,
      body: fixArrowTernaries(fixedBody),
    } as AnyExpression
  }

  // Recursively fix child nodes
  for (const key of Object.keys(node)) {
    if (key === 'type') continue
    const child = node[key]
    if (Array.isArray(child)) {
      node[key] = child.map((c: any) =>
        c && typeof c === 'object' && c.type ? fixArrowTernaries(c) : c,
      )
    } else if (child && typeof child === 'object' && child.type) {
      node[key] = fixArrowTernaries(child as AnyExpression)
    }
  }
  return node
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

/** Resolve a bare identifier from the evaluator scope, falling back to window */
const resolveIdentifier = (name: string, scope: Record<string, any>): any => {
  if (name in scope) return scope[name]
  // Fall back to window for globals like Math, Object, parseInt, etc.
  const global = globalThis as Record<string, any>
  if (name in global) return global[name]
  throw new Error(
    `Unknown identifier "${name}". ` +
      'Use $ for signals, @ for actions, # for helpers, ' +
      'or ensure the identifier exists on window.',
  )
}

// ---------------------------------------------------------------------------
// AST node evaluator
// ---------------------------------------------------------------------------

// Types that come from the jsep plugins
type AnyExpression = jsep.Expression & Record<string, any>

const BINARY_OPS: Record<string, (a: any, b: any) => any> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '%': (a, b) => a % b,
  '**': (a, b) => a ** b,
  '===': (a, b) => a === b,
  '!==': (a, b) => a !== b,
  '==': (a, b) => a == b, // eslint-disable-line eqeqeq
  '!=': (a, b) => a != b, // eslint-disable-line eqeqeq
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '&': (a, b) => a & b,
  '&&': (a, b) => a && b,
  '||': (a, b) => a || b,
  '^': (a, b) => a ^ b,
  '<<': (a, b) => a << b,
  '>>': (a, b) => a >> b,
  '>>>': (a, b) => a >>> b,
  in: (a, b) => a in b,
  instanceof: (a, b) => a instanceof b,
}

const UNARY_OPS: Record<string, (a: any) => any> = {
  '!': (a) => !a,
  '-': (a) => -a,
  '+': (a) => +a,
  '~': (a) => ~a,
  typeof: (a) => typeof a,
  void: (_) => undefined,
}

/**
 * Perform an assignment, writing through to the signal proxy if the target
 * is a member of `__sig`, or updating a plain scope variable otherwise.
 */
const performAssignment = (
  node: AssignmentExpression,
  scope: Record<string, any>,
): any => {
  const op = node.operator

  // Resolve the current value (for compound operators)
  const currentValue = (): any => evaluateNode(node.left, scope)

  // Compute the new value
  const newValue = (): any => {
    const r = evaluateNode(node.right, scope)
    switch (op) {
      case '=':
        return r
      case '+=':
        return currentValue() + r
      case '-=':
        return currentValue() - r
      case '*=':
        return currentValue() * r
      case '/=':
        return currentValue() / r
      case '%=':
        return currentValue() % r
      case '**=':
        return currentValue() ** r
      case '||=':
        return currentValue() || r
      case '&&=':
        return currentValue() && r
      case '??=':
        return currentValue() ?? r
      default:
        throw new Error(`Unsupported assignment operator: ${op}`)
    }
  }

  // Write back
  if (node.left.type === 'MemberExpression') {
    const mem = node.left as jsep.MemberExpression
    const obj = evaluateNode(mem.object, scope)
    const prop = mem.computed
      ? evaluateNode(mem.property, scope)
      : (mem.property as jsep.Identifier).name
    return (obj[prop] = newValue())
  }
  if (node.left.type === 'Identifier') {
    const name = (node.left as jsep.Identifier).name
    const val = newValue()
    if (name in scope) {
      scope[name] = val
    } else {
      ;(globalThis as Record<string, any>)[name] = val
    }
    return val
  }
  throw new Error(`Cannot assign to expression of type ${node.left.type}`)
}

/**
 * Recursively evaluate a jsep AST node against a scope object.
 */
export const evaluateNode = (
  node: AnyExpression,
  scope: Record<string, any>,
): any => {
  switch (node.type) {
    // ------------------------------------------------------------------
    case 'Literal':
      return (node as jsep.Literal).value

    // ------------------------------------------------------------------
    case 'Identifier':
      return resolveIdentifier((node as jsep.Identifier).name, scope)

    // ------------------------------------------------------------------
    case 'MemberExpression': {
      const mem = node as jsep.MemberExpression
      const obj = evaluateNode(mem.object as AnyExpression, scope)
      if (obj == null) {
        if (mem.optional) return undefined
        const objSrc = JSON.stringify(mem.object)
        throw new Error(`Cannot read property of ${obj}: ${objSrc}`)
      }
      const prop = mem.computed
        ? evaluateNode(mem.property as AnyExpression, scope)
        : (mem.property as jsep.Identifier).name
      return obj[prop]
    }

    // ------------------------------------------------------------------
    case 'BinaryExpression': {
      const bin = node as jsep.BinaryExpression
      const op = BINARY_OPS[bin.operator]
      if (!op) throw new Error(`Unsupported binary operator: ${bin.operator}`)
      return op(
        evaluateNode(bin.left as AnyExpression, scope),
        evaluateNode(bin.right as AnyExpression, scope),
      )
    }

    // ------------------------------------------------------------------
    case 'UnaryExpression': {
      const un = node as jsep.UnaryExpression
      const op = UNARY_OPS[un.operator]
      if (!op) throw new Error(`Unsupported unary operator: ${un.operator}`)
      return op(evaluateNode(un.argument as AnyExpression, scope))
    }

    // ------------------------------------------------------------------
    // LogicalExpression shares the same shape as BinaryExpression in jsep
    // but needs short-circuit evaluation, so handle it explicitly.
    case 'LogicalExpression': {
      const log = node as jsep.BinaryExpression
      const left = evaluateNode(log.left as AnyExpression, scope)
      if (log.operator === '&&')
        return left && evaluateNode(log.right as AnyExpression, scope)
      if (log.operator === '||')
        return left || evaluateNode(log.right as AnyExpression, scope)
      if (log.operator === '??')
        return left ?? evaluateNode(log.right as AnyExpression, scope)
      throw new Error(`Unsupported logical operator: ${log.operator}`)
    }

    // ------------------------------------------------------------------
    case 'ConditionalExpression': {
      const cond = node as jsep.ConditionalExpression
      return evaluateNode(cond.test as AnyExpression, scope)
        ? evaluateNode(cond.consequent as AnyExpression, scope)
        : evaluateNode(cond.alternate as AnyExpression, scope)
    }

    // ------------------------------------------------------------------
    case 'CallExpression': {
      const call = node as jsep.CallExpression
      const args = call.arguments.map((a) =>
        evaluateNode(a as AnyExpression, scope),
      )

      // Resolve callee and (if method call) its `this`
      if (call.callee.type === 'MemberExpression') {
        const mem = call.callee as jsep.MemberExpression
        const thisVal = evaluateNode(mem.object as AnyExpression, scope)
        const prop = mem.computed
          ? evaluateNode(mem.property as AnyExpression, scope)
          : (mem.property as jsep.Identifier).name
        const fn = thisVal[prop]
        if (typeof fn !== 'function') {
          throw new Error(`${prop} is not a function`)
        }
        return fn.apply(thisVal, args)
      }

      const fn = evaluateNode(call.callee as AnyExpression, scope)
      if (typeof fn !== 'function') {
        const name =
          call.callee.type === 'Identifier'
            ? (call.callee as jsep.Identifier).name
            : '<expression>'
        throw new Error(`${name} is not a function`)
      }
      return fn(...args)
    }

    // ------------------------------------------------------------------
    case 'AssignmentExpression':
      return performAssignment(node as unknown as AssignmentExpression, scope)

    // ------------------------------------------------------------------
    case 'UpdateExpression': {
      const upd = node as unknown as UpdateExpression
      const target = upd.argument
      let current: any
      let write: (v: any) => void

      if (target.type === 'MemberExpression') {
        const mem = target as jsep.MemberExpression
        const obj = evaluateNode(mem.object as AnyExpression, scope)
        const prop = mem.computed
          ? evaluateNode(mem.property as AnyExpression, scope)
          : (mem.property as jsep.Identifier).name
        current = obj[prop]
        write = (v) => {
          obj[prop] = v
        }
      } else if (target.type === 'Identifier') {
        const name = (target as jsep.Identifier).name
        current = resolveIdentifier(name, scope)
        write = (v) => {
          if (name in scope) scope[name] = v
          else (globalThis as Record<string, any>)[name] = v
        }
      } else {
        throw new Error(`Cannot update expression of type ${target.type}`)
      }

      const next = upd.operator === '++' ? current + 1 : current - 1
      write(next)
      return upd.prefix ? next : current
    }

    // ------------------------------------------------------------------
    case 'ArrayExpression': {
      const arr = node as jsep.ArrayExpression
      return arr.elements.map((el) =>
        el == null ? undefined : evaluateNode(el as AnyExpression, scope),
      )
    }

    // ------------------------------------------------------------------
    // ObjectExpression: { key: value, shorthand, [computed]: value }
    // Produced by @jsep-plugin/object.
    case 'ObjectExpression': {
      const obj = node as unknown as ObjectExpression
      const result: Record<string, any> = {}
      for (const rawProp of obj.properties) {
        const prop = rawProp as Property
        // Key: identifier (non-computed) uses the name directly to avoid
        // treating it as a scope lookup (e.g. `{ color: ... }` → key "color")
        const key: string = prop.computed
          ? evaluateNode(prop.key as AnyExpression, scope)
          : prop.key.type === 'Identifier'
            ? (prop.key as jsep.Identifier).name
            : String(evaluateNode(prop.key as AnyExpression, scope))
        // Shorthand `{ x }` is equivalent to `{ x: x }` — resolve from scope
        result[key] = prop.shorthand
          ? resolveIdentifier(key, scope)
          : evaluateNode(prop.value as AnyExpression, scope)
      }
      return result
    }

    // ------------------------------------------------------------------
    case 'TemplateLiteral': {
      const tpl = node as unknown as TemplateLiteral
      let result = ''
      for (let i = 0; i < tpl.quasis.length; i++) {
        result += (tpl.quasis[i] as TemplateElement).value.cooked
        if (i < tpl.expressions.length) {
          result += String(
            evaluateNode(tpl.expressions[i] as AnyExpression, scope),
          )
        }
      }
      return result
    }

    // ------------------------------------------------------------------
    case 'Compound': {
      const compound = node as jsep.Compound
      let result: any
      for (const expr of compound.body) {
        result = evaluateNode(expr as AnyExpression, scope)
      }
      return result
    }

    // ------------------------------------------------------------------
    // Explicitly unsupported node types — give actionable error messages
    case 'SequenceExpression':
      throw new Error(
        'Comma sequence operator is not supported in CSP mode. ' +
          'Use semicolons to separate multiple statements instead.',
      )

    // ------------------------------------------------------------------
    case 'ArrowFunctionExpression': {
      const arrow = node as unknown as ArrowExpression
      const params = arrow.params ?? []
      return (...callArgs: any[]): any => {
        const childScope = { ...scope }
        for (let i = 0; i < params.length; i++) {
          childScope[(params[i] as jsep.Identifier).name] = callArgs[i]
        }
        return evaluateNode(arrow.body as AnyExpression, childScope)
      }
    }

    case 'FunctionExpression':
      throw new Error(
        'Function expressions are not supported in CSP mode. ' +
          "Define a helper with registerHelper('name', fn) and call it as #name(...).",
      )

    case 'NewExpression':
      throw new Error('new expressions are not supported in CSP mode.')

    // ------------------------------------------------------------------
    default:
      throw new Error(`Unsupported expression type: ${node.type}`)
  }
}

// ---------------------------------------------------------------------------
// Top-level ExprEvaluator
// ---------------------------------------------------------------------------

/**
 * CSP-safe expression evaluator.
 *
 * Substitutes for the `newFunctionEvaluator` in bundles that need to avoid
 * `unsafe-eval`. Install it by calling `setExpressionEvaluator(jsepEvaluator)`
 * from the bundle entry point before any plugins load.
 *
 * Limitations compared to the default evaluator:
 *   - No arrow functions or function literals in-expression
 *   - More complex logic must be registered as helpers via `registerHelper`
 */
export const jsepEvaluator: ExprEvaluator = (
  value,
  {
    returnsValue: _returnsValue = false,
    argNames = [],
    cleanups = new Map(),
  } = {},
): ExprFn => {
  // Pre-process once per attribute, not per invocation
  const preprocessed = preprocessExpression(value)

  let ast: jsep.Expression
  try {
    ast = fixArrowTernaries(
      jsep(preprocessed) as AnyExpression,
    ) as jsep.Expression
  } catch (e: any) {
    throw new Error(
      `Failed to parse expression "${value}": ${e.message}\n` +
        `(preprocessed: "${preprocessed}")`,
    )
  }

  return <T>(el: HTMLOrSVG, ...args: any[]): T => {
    // Build scope for this invocation
    const actionDispatcher = (
      name: string,
      evt: Event | undefined,
      ...actionArgs: any[]
    ): any => {
      const fn = actions[name]
      if (!fn) throw new Error(`Unknown action: @${name}`)
      return fn(
        { el, evt, error: (msg) => new Error(msg), cleanups },
        ...actionArgs,
      )
    }

    // argNames maps positional args to named scope variables for plugins
    // that pass extra values (e.g. the `on` plugin passes the event)
    const namedArgs: Record<string, any> = {}
    for (let i = 0; i < argNames.length; i++) {
      namedArgs[argNames[i]] = args[i]
    }

    const scope: Record<string, any> = {
      el,
      __sig: root,
      __action: actionDispatcher,
      __helper: callHelper,
      __evt: namedArgs['evt'] ?? args[0],
      ...namedArgs,
    }

    try {
      return evaluateNode(ast as AnyExpression, scope) as T
    } catch (e: any) {
      console.error(e)
      throw new Error(
        `Error evaluating expression "${value}": ${e.message}\n` +
          `(preprocessed: "${preprocessed}")`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Static expression evaluator (no element context, no signals write-back)
// ---------------------------------------------------------------------------

/**
 * Evaluates a static JS expression string using the jsep pipeline with a
 * minimal scope. This is intended for contexts where an expression must be
 * parsed outside of an attribute binding — primarily as the CSP-safe fallback
 * for `jsStrToObject`.
 *
 * Because this runs without a real `el` or event context, action/helper calls
 * inside the expression will throw. Signal reads work (via `root`); signal
 * writes are not meaningful in this context.
 */
export const evaluateStaticExpression = (raw: string): any => {
  const preprocessed = preprocessExpression(raw)

  let ast: jsep.Expression
  try {
    ast = fixArrowTernaries(
      jsep(preprocessed) as AnyExpression,
    ) as jsep.Expression
  } catch (e: any) {
    throw new Error(
      `Failed to parse expression "${raw}": ${e.message}\n` +
        `(preprocessed: "${preprocessed}")`,
    )
  }

  const scope: Record<string, any> = {
    el: null,
    __sig: root,
    __action: () => {
      throw new Error('Actions cannot be called in static expression context')
    },
    __helper: callHelper,
    __evt: undefined,
  }

  return evaluateNode(ast as AnyExpression, scope)
}
