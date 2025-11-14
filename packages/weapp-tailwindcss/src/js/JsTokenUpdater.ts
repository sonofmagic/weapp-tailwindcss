import type MagicString from 'magic-string'
import type { JsToken } from './types'

/**
 * Lightweight helper that batches updates to {@link MagicString}.
 * It keeps the transformation logic out of the traversal code and makes
 * it easier to reason about the order in which tokens are written back.
 */
export class JsTokenUpdater {
  private tokens: JsToken[]

  constructor({ value }: { value?: JsToken[] } = {}) {
    this.tokens = value ? [...value] : []
  }

  addToken(token?: JsToken) {
    if (token) {
      this.tokens.push(token)
    }
  }

  push(...args: JsToken[]) {
    this.tokens.push(...args)
    return this
  }

  /**
   * 待写入的 token 数量。
   */
  get length() {
    return this.tokens.length
  }

  map(callbackfn: (value: JsToken, index: number, array: JsToken[]) => JsToken) {
    this.tokens = this.tokens.map(callbackfn)
    return this
  }

  filter(callbackfn: (value: JsToken, index: number, array: JsToken[]) => unknown) {
    this.tokens = this.tokens.filter(callbackfn)
    return this
  }

  updateMagicString(ms: MagicString) {
    for (const { start, end, value } of this.tokens) {
      ms.update(start, end, value)
    }
    return ms
  }
}
