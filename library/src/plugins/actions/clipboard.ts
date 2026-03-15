// Slug: clipboard
// Description: Copies the provided text to the clipboard

import { action } from '@engine'

action({
  name: 'clip',
  apply({ error }, value, base64 = false) {
    if (!navigator.clipboard) {
      throw error('Clipboard API not supported')
    }
    if (base64) {
      navigator.clipboard.writeText(atob(value))
    } else {
      navigator.clipboard.writeText(value)
    }
  },
})
