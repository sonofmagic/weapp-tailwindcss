import { describe, expect, it } from 'vitest'
import { isValidSelector, splitCode } from '@/extractors'

describe('splitCode extractor', () => {
  it('splits on whitespace and drops empty selectors', () => {
    expect(splitCode('  foo   bar  ')).toEqual(['foo', 'bar'])
    expect(splitCode('"   "')).toEqual([])
  })

  it('normalises escaped whitespace in minified template literals', () => {
    const code = 'border-b-[rgba(0,0,0,0.1)]\\ntext-base\\tfont-bold\\rtext-sm'
    expect(splitCode(code)).toEqual([
      'border-b-[rgba(0,0,0,0.1)]',
      'text-base',
      'font-bold',
      'text-sm',
    ])
  })

  it('controls whether double quotes are treated as splitters', () => {
    const snippet = 'class="foo bar" data-test="baz"'
    expect(splitCode(snippet)).toEqual(['class=', 'foo', 'bar', 'data-test=', 'baz'])
    expect(splitCode(snippet, true)).toEqual(['class="foo', 'bar"', 'data-test="baz"'])
  })
})

describe('isValidSelector', () => {
  it('accepts selectors containing unicode and alphanumeric characters', () => {
    expect(isValidSelector('边界')).toBe(true)
    expect(isValidSelector('text-sm')).toBe(true)
  })

  it('rejects empty or punctuation-only inputs', () => {
    expect(isValidSelector('')).toBe(false)
    expect(isValidSelector('   ')).toBe(false)
    expect(isValidSelector('""')).toBe(false)
  })
})
