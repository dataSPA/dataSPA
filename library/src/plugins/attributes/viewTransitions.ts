import { attribute } from '@engine'
import { effect } from '@engine/signals'
import { supportsViewTransitions } from '../../utils/view-transitions'

attribute({
  name: 'viewTransition',
  requirement: {
    key: 'denied',
    value: 'must',
  },
  returnsValue: true,
  apply({ el, rx }) {
    if (!supportsViewTransitions) {
      console.error('Browser does not support view transitions')
      return
    }
    return effect(() => {
      const name = rx?.() as string
      if (!name?.length) return
      const elVTASTyle = el.style as CSSStyleDeclaration
      elVTASTyle.viewTransitionName = name
    })
  },
})
