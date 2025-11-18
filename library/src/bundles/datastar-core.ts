// Core build: install the new Function evaluator
import { setExpressionEvaluator } from '@engine'
import { newFunctionEvaluator } from '@engine/expression-new-function'
setExpressionEvaluator(newFunctionEvaluator)

export { action, actions, attribute, watcher, setExpressionEvaluator } from '@engine'
export { registerHelper } from '@engine/helpers'
export {
  beginBatch,
  computed,
  effect,
  endBatch,
  filtered,
  getPath,
  mergePatch,
  mergePaths,
  root,
  signal,
  startPeeking,
  stopPeeking,
} from '@engine/signals'
export { modifyCasing } from '@utils/text'
