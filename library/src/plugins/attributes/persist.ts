import { attribute } from '@engine'
import { DATASTAR } from '@engine/consts'
import { effect, filtered, mergePatch } from '@engine/signals'
import type { SignalFilterOptions } from '@engine/types'

attribute({
  name: 'persist',
  requirement: {
    key: 'denied',
  },
  apply({ key, mods, rx }) {
    const persistKey = key ?? DATASTAR

    const storage = mods.has('session') ? sessionStorage : localStorage

    const data = storage.getItem(persistKey)
    if (data) {
      try {
        const storedSignals = JSON.parse(data)
        mergePatch(storedSignals)
        storage.setItem(persistKey, '{}')
      } catch (error) {
        console.error('Error parsing persisted data:', error)
      }
    }

    return effect(() => {
      const value = rx?.() as SignalFilterOptions
      const filteredValue = filtered(value)
      const stringified = JSON.stringify(filteredValue)
      storage.setItem(persistKey, stringified)
    })
  },
})
