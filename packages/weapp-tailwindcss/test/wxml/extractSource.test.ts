import { variableRegExp } from '@weapp-core/regex'

interface ExtractSourceToken {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
  // prevConcatenated: boolean
  // nextConcatenated: boolean
}
/**
 * @internal
 */
function extract(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: ExtractSourceToken[] = []

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
    expect(sources).toEqual<ExtractSourceToken[]>([
      { start: 4, end: 9, raw: 'c' },
      { start: 12, end: 17, raw: 'e' },
    ])
  })

  it('tight', () => {
    const sources = extractSource('a b{{c}}d{{e}}f')
    expect(sources.length).toBe(2)
    expect(sources).toEqual<ExtractSourceToken[]>([
      { start: 3, end: 8, raw: 'c' },
      { start: 9, end: 14, raw: 'e' },
    ])
  })
})
