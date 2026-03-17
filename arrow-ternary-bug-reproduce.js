#!/usr/bin/env node
/**
 * Reproduces: @jsep-plugin/arrow mis-parses ternary operators inside arrow bodies
 *
 * Run from a directory that has jsep and @jsep-plugin/arrow installed:
 *
 *   npm install jsep @jsep-plugin/arrow @jsep-plugin/assignment
 *   node reproduce.js
 */

'use strict'

const { default: jsep } = require('jsep')
const { default: arrowPlugin } = require('@jsep-plugin/arrow')
const { default: assignmentPlugin } = require('@jsep-plugin/assignment')

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
    console.log(`       AST arg:  ${JSON.stringify(getAstArg(ast), null, 2).split('\n').join('\n       ')}`)
  }
  console.log()
  if (ok) passed++; else failed++
}

function getAstArg(ast) {
  // For compound expressions, take the last statement
  const node = ast.type === 'Compound' ? ast.body[ast.body.length - 1] : ast
  return node.arguments ? node.arguments[0] : node
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

console.log('=== @jsep-plugin/arrow: ternary-in-arrow-body bug ===\n')

console.log('--- Zero-arg arrows  (() => ...)  ---\n')

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
  // When the arrow itself is lost, the argument becomes the body directly
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
