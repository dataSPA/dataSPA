/**
 * Registry of helper functions that can be called from CSP-safe expressions
 * using the `#` prefix.
 *
 * Example usage in HTML:
 *   data-text="#format($price)"
 *
 * Registration from a module:
 *   import { registerHelper } from 'datastar-csp'
 *   registerHelper('format', (value: number) => value.toFixed(2))
 */
const helperRegistry = new Map<string, (...args: any[]) => any>()

/**
 * Register a helper function that can be invoked from a Datastar expression
 * using the `#name(...)` syntax.
 *
 * Helper functions are plain functions — they receive only the arguments
 * written in the expression, with no implicit Datastar context.
 *
 * @param name - The name used to call the helper in expressions (without `#`)
 * @param fn   - The function to register
 */
export const registerHelper = (
  name: string,
  fn: (...args: any[]) => any,
): void => {
  helperRegistry.set(name, fn)
}

/**
 * Invoke a registered helper by name. Called internally by the jsep evaluator.
 *
 * @throws if no helper with the given name has been registered
 */
export const callHelper = (name: string, ...args: any[]): any => {
  const fn = helperRegistry.get(name)
  if (!fn) {
    throw new Error(
      `Unknown helper: #${name}. Did you forget to call registerHelper('${name}', ...)?`,
    )
  }
  return fn(...args)
}
