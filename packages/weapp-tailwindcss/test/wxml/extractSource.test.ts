import type { RawSource } from '@/types'
import { variableRegExp } from '@weapp-core/regex'
/**
 * @internal
 */
function extract(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = reg.lastIndex
    sources.push({
      start,
      end,
      raw: match[1],
    })

    match = reg.exec(original)
  }
  return sources
}

export function extractSource(original: string) {
  return extract(original, variableRegExp)
}

describe('extractSource', () => {
  it('common', () => {
    const sources = extractSource('a b {{c}} d {{e}} f')
    expect(sources.length).toBe(2)
    expect(sources).toEqual<RawSource[]>([
      { start: 4, end: 9, raw: 'c' }, // nextConcatenated: false, prevConcatenated: false },
      { start: 12, end: 17, raw: 'e' }, // , nextConcatenated: false, prevConcatenated: false }
    ])
  })

  it('tight', () => {
    const sources = extractSource('a b{{c}}d{{e}}f')
    expect(sources.length).toBe(2)
    expect(sources).toEqual<RawSource[]>([
      { start: 3, end: 8, raw: 'c' }, // , nextConcatenated: true, prevConcatenated: true },
      { start: 9, end: 14, raw: 'e' }, // , nextConcatenated: true, prevConcatenated: true }
    ])
  })
})
