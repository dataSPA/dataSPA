#!/usr/bin/env node
/**
 * Reproduces: @jsep-plugin/arrow mis-parses ternary operators inside arrow bodies
 *
 * Setup and run:
 *
 *   npm install
 *   node reproduce.js
 */

'use strict'

// CJS interop: pnpm/npm CJS builds may export as { default: jsep, ... }
const jsepMod = require('jsep')
const jsep = jsepMod.default || jsepMod

const arrowMod = require('@jsep-plugin/arrow')
const arrowPlugin = arrowMod.default || arrowMod

const assignmentMod = require('@jsep-plugin/assignment')
const assignmentPlugin = assignmentMod.default || assignmentMod

jsep.plugins.register(assignmentPlugin, arrowPlugin)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0
let failed = 0

function check(label, expr, getActual, expected) {
  const ast = jsep(expr)
  const actual = getActual(ast)
  const ok = actual === expected
  const mark = ok ? '✓' : '✗'
  console.log(`  ${mark}  ${label}`)
  console.log(`       expr:     ${expr}`)
  console.log(`       actual:   ${actual}`)
  console.log(`       expected: ${expected}`)
  if (!ok) {
    const arg = getAstArg(ast)
    console.log(`       AST arg:  ${JSON.stringify(arg, null, 2).split('\n').join('\n       ')}`)
  }
  console.log()
  if (ok) passed++; else failed++
}

function getAstArg(ast) {
  const node = ast.type === 'Compound' ? ast.body[ast.body.length - 1] : ast
  return node.arguments ? node.arguments[0] : node
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

console.log('=== @jsep-plugin/arrow: ternary-in-arrow-body bug ===\n')

console.log('--- Zero-arg arrows  (() => ...)  ---\n')

// NOTE: @jsep-plugin/assignment is NOT required to trigger this bug.
// A ternary-only body fails with just arrowPlugin registered.

check(
  'zero-arg: ternary only',
  'f(() => a ? 1 : 0)',
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

check(
  'zero-arg: assignment then ternary',
  'f(() => x = a ? 1 : 0)',
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

check(
  'zero-arg: member-expression assignment then ternary',
  "f(() => obj['key'] = a ? 1 : 0)",
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

check(
  'zero-arg: assignment with logical-AND test',
  'f(() => x = a && b ? 1 : 0)',
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

console.log('--- Single-param arrows  (v => ...)  ---\n')

check(
  'single-param: ternary only',
  'f(v => v ? 1 : 0)',
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

check(
  'single-param: assignment then ternary',
  'f(v => x = v ? 1 : 0)',
  ast => ast.arguments[0].type,
  'ArrowFunctionExpression',
)

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('---')
console.log(`${passed} passed, ${failed} failed`)

if (failed > 0) {
  console.log('\nBug confirmed.')
  process.exit(1)
} else {
  console.log('\nAll assertions passed — bug appears to be fixed.')
  process.exit(0)
}
