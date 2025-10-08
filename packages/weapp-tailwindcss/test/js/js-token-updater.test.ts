import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'

describe('JsTokenUpdater', () => {
  it('supports chained mutations before applying updates', () => {
    const fakePath = {} as any
    const seed = { start: 0, end: 1, value: 'A', path: fakePath }
    const ms = new MagicString('wxyz')
    const updater = new JsTokenUpdater({ value: [seed] })

    const pushResult = updater.push(
      { start: 1, end: 2, value: 'B', path: fakePath },
      { start: 2, end: 3, value: 'C', path: fakePath },
      { start: 3, end: 4, value: 'D', path: fakePath },
    )
    expect(pushResult).toBe(updater)

    updater.addToken(undefined)
    updater.addToken({ start: 2, end: 3, value: 'c', path: fakePath })

    const mapResult = updater.map(token => ({
      ...token,
      value: token.value.toLowerCase(),
    }))
    expect(mapResult).toBe(updater)

    const filterResult = updater.filter(token => token.value !== 'c')
    expect(filterResult).toBe(updater)

    const result = updater.updateMagicString(ms)
    expect(result).toBe(ms)
    expect(result.toString()).toBe('abyd')
  })
})
