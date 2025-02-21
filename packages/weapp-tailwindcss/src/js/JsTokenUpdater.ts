import type MagicString from 'magic-string'
import type { JsToken } from './types'

export class JsTokenUpdater {
  public value: JsToken[]

  constructor(
    { value }:
    { value?: JsToken[] } = {},
  ) {
    this.value = value ?? []
  }

  addToken(token?: JsToken) {
    if (token) {
      this.value.push(token)
    }
  }

  push(...args: JsToken[]) {
    this.value.push(...args)
    return this
  }

  map(callbackfn: (value: JsToken, index: number, array: JsToken[]) => JsToken) {
    this.value = this.value.map(callbackfn)
    return this
  }

  filter(callbackfn: (value: JsToken, index: number, array: JsToken[]) => unknown) {
    this.value = this.value.filter(callbackfn)
    return this
  }

  updateMagicString(ms: MagicString) {
    for (const { start, end, value } of this.value) {
      ms.update(start, end, value)
    }
    return ms
  }
}
