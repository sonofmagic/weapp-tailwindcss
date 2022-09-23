import { extractSource } from '@/wxml/utils'
import type { RawSource } from '@/types'
describe('extractSource', () => {
  it('common', () => {
    const sources = extractSource('a b {{c}} d {{e}} f')
    expect(sources.length).toBe(2)
    expect(sources).toEqual<RawSource[]>([
      { start: 4, end: 9, raw: 'c', nextConcatenated: false, prevConcatenated: false },
      { start: 12, end: 17, raw: 'e', nextConcatenated: false, prevConcatenated: false }
    ])
  })

  it('tight', () => {
    const sources = extractSource('a b{{c}}d{{e}}f')
    expect(sources.length).toBe(2)
    expect(sources).toEqual<RawSource[]>([
      { start: 3, end: 8, raw: 'c', nextConcatenated: true, prevConcatenated: true },
      { start: 9, end: 14, raw: 'e', nextConcatenated: true, prevConcatenated: true }
    ])
  })
})
