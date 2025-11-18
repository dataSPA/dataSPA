# Bug: `@jsep-plugin/arrow` mis-parses ternary operators inside arrow function bodies

**Package:** `@jsep-plugin/arrow` v1.0.6  
**Repo:** `EricSmekens/jsep` → `packages/arrow`

---

## Summary

When an arrow function body contains a ternary (`?:`) operator, the plugin parses the ternary as belonging to the **outer** expression rather than to the arrow body. The result is a structurally incorrect AST.

---

## Steps to reproduce

```js
import jsep from 'jsep'
import arrowPlugin from '@jsep-plugin/arrow'

jsep.plugins.register(arrowPlugin)

// Case 1: ternary only in arrow body — no other plugins needed
const ast1 = jsep('f(() => a ? 1 : 0)')
console.log(ast1.arguments[0].type)
// Actual:   "ConditionalExpression"  ← wrong
// Expected: "ArrowFunctionExpression"
```

A self-contained reproduction project is included in the `arrow-ternary-bug/` directory:

```
cd arrow-ternary-bug
npm install
node reproduce.js
```

`@jsep-plugin/assignment` is included as an optional dependency in the repro to demonstrate the combined assignment + ternary case, but it is **not required** to trigger the bug — a ternary-only body fails with just `arrowPlugin` registered.

---

## Actual vs expected AST

For `f(() => x = a ? 1 : 0)`:

**Actual (wrong):**
```
CallExpression {
  callee: f,
  arguments: [
    ConditionalExpression {          ← ternary escaped the arrow
      test: ArrowFunctionExpression {
        params: null,
        body: AssignmentExpression { left: x, right: a }
      },
      consequent: 1,
      alternate: 0
    }
  ]
}
```

**Expected (correct):**
```
CallExpression {
  callee: f,
  arguments: [
    ArrowFunctionExpression {
      params: null,
      body: AssignmentExpression {
        left: x,
        right: ConditionalExpression { test: a, consequent: 1, alternate: 0 }
      }
    }
  ]
}
```

---

## Root cause

The `gobble-expression` hook for zero-arg arrows (`() => ...`) calls `this.gobbleBinaryExpression()` to parse the body:

```js
// packages/arrow/src/index.js
jsep.hooks.add('gobble-expression', function gobbleEmptyArrowArg(env) {
  // ...detects () =>...
  const body = this.gobbleBinaryExpression()  // ← does not consume ?:
  env.node = { type: ARROW_EXP, params: null, body }
})
```

`gobbleBinaryExpression()` processes all registered binary operators (including `=` from the assignment plugin) but does **not** consume ternary expressions — those are handled one level up by `gobbleExpression()`. So for `() => x = a ? 1 : 0`:

1. `gobbleBinaryExpression()` consumes `x = a` and returns an `AssignmentExpression`
2. The hook sets the arrow body to that `AssignmentExpression`
3. Control returns to the outer expression parser, which sees `? 1 : 0` still in the input and wraps the entire arrow in a `ConditionalExpression`

The same issue affects single-param arrows handled by the `after-expression` hook, for the same reason (the `=>` binary op's right-hand side is also produced by `gobbleBinaryExpression()`).

---

## Suggested fix

Replace `gobbleBinaryExpression()` with `gobbleExpression()` in the `gobble-expression` hook so that the full arrow body — including any trailing ternary — is consumed before the hook returns:

```js
jsep.hooks.add('gobble-expression', function gobbleEmptyArrowArg(env) {
  this.gobbleSpaces()
  if (this.code === jsep.OPAREN_CODE) {
    const backupIndex = this.index
    this.index++
    this.gobbleSpaces()
    if (this.code === jsep.CPAREN_CODE) {
      this.index++
      const biop = this.gobbleBinaryOp()
      if (biop === '=>') {
        const body = this.gobbleExpression()  // ← was gobbleBinaryExpression()
        if (!body) this.throwError('Expected expression after ' + biop)
        env.node = { type: ARROW_EXP, params: null, body }
        return
      }
    }
    this.index = backupIndex
  }
})
```

A similar change may be needed in the `after-expression`/`updateBinariesToArrows` path for single-param arrows.

---

## Workaround

As a consumer workaround (when the plugin cannot be patched), walk the parsed AST and restructure any `ConditionalExpression` node whose `test` is an `ArrowFunctionExpression` — grafting the ternary back into the arrow body at the correct position.
