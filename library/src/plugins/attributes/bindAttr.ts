// Slug: Creates a signal with two-way data binding to an attribute
// Description: Creates a signal (if one doesn’t already exist) and sets up two-way data binding between it and an element’s attribute.

import { attribute } from '@engine'
import { effect, getPath, mergePaths } from '@engine/signals'
import { modifyCasing } from '@utils/text'

const empty = Symbol('empty')

attribute({
  name: 'bind-attr',
  requirement: 'must',
  apply({ el, key, mods, value }) {
    const attributeName = modifyCasing(key, mods)

    const get = (el: any, type: string) =>
      type === 'number'
        ? +el.getAttribute(attributeName)
        : el.getAttribute(attributeName)

    const signalName = value
    const initialValue = getPath(signalName) ?? ''

    mergePaths([[signalName, initialValue]], {
      ifMissing: true,
    })

    const syncSignal = () => {
      const signalValue = getPath(signalName)
      if (signalValue != null) {
        const value = get(el, typeof signalValue)
        if (value !== empty) {
          mergePaths([[signalName, value]])
        }
      }
    }

    const syncAttr = () => {
      const val = getPath(signalName)
      if (val === '' || val === true) {
        el.setAttribute(attributeName, '')
      } else if (val === false || val == null) {
        el.removeAttribute(attributeName)
      } else if (typeof val === 'string') {
        el.setAttribute(attributeName, val)
      } else {
        el.setAttribute(attributeName, JSON.stringify(val))
      }
    }

    const update = () => {
      observer.disconnect()
      syncSignal()
      observer.observe(el, {
        attributeFilter: [attributeName],
      })
    }

    const observer = new MutationObserver(update)
    observer.observe(el, {
      attributeFilter: [attributeName],
    })
    const cleanup = effect(syncAttr)

    return () => {
      observer.disconnect()
      cleanup()
    }
  },
})
