import type { HTMLOrSVG } from '@engine/types'

export type ExprEvaluatorOptions = {
  returnsValue?: boolean
  argNames?: string[]
  cleanups?: Map<string, () => void>
}

export type ExprFn = <T>(el: HTMLOrSVG, ...args: any[]) => T

/**
 * A function that takes a raw expression string and returns a compiled
 * function ready to be called with a DOM element and any additional args.
 *
 * Two implementations exist:
 *   - newFunctionEvaluator: uses `new Function` (default, requires unsafe-eval)
 *   - jsepEvaluator: uses jsep AST walking (CSP-safe, limited syntax)
 */
export type ExprEvaluator = (
  value: string,
  options: ExprEvaluatorOptions,
) => ExprFn
