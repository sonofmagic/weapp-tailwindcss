import { describe, expect, it } from 'vitest'
import { decodeUnicode, decodeUnicode2 } from '@/utils/decode'

describe('decode utils', () => {
  it('decodes unicode escape sequences', () => {
    expect(decodeUnicode('\\u4f60\\u597d')).toBe('你好')
  })

  it('leaves invalid escapes untouched', () => {
    expect(decodeUnicode('\\uZZZZ-test')).toBe('\\uZZZZ-test')
  })

  it('decodes mixed escape characters via JSON parser fallback', () => {
    expect(decodeUnicode2('\\u4f60\\u597d\\nworld')).toBe('你好\nworld')
  })

  it('falls back gracefully when JSON parsing fails', () => {
    expect(decodeUnicode2('\\u4f60\\u597d\\uZZZZ')).toBe('你好\\uZZZZ')
  })
})
