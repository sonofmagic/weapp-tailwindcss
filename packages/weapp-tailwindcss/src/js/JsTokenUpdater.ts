import type MagicString from 'magic-string'
import type { JsToken } from './types'

export class JsTokenUpdater {
  value: JsToken[]
  constructor(value?: JsToken[]) {
    this.value = value ?? []
  }

  add(token?: JsToken) {
    if (token) {
      this.value.push(token)
    }
  }

  updateMagicString(ms: MagicString) {
    for (const { start, end, value } of this.value) {
      ms.update(start, end, value)
    }
    return ms
  }
}
