import { attribute } from '@engine'
import { effect } from '@engine/signals'

attribute({
  name: 'replaceUrl',
  requirement: {
    key: 'denied',
    value: 'must',
  },
  returnsValue: true,
  apply({ rx }) {
    return effect(() => {
      const url = rx() as string
      const baseUrl = window.location.href
      const fullUrl = new URL(url, baseUrl).toString()
      window.history.replaceState({}, '', fullUrl)
    })
  },
})
