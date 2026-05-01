import { describe, expect, it } from 'vitest'
import { isAllWhitespace, isWhitespace } from '@/wxml/whitespace'

describe('wxml whitespace utilities', () => {
  it('detects supported whitespace characters', () => {
    expect(isWhitespace('')).toBe(false)
    expect(isWhitespace(' ')).toBe(true)
    expect(isWhitespace('\t')).toBe(true)
    expect(isWhitespace('\n')).toBe(true)
    expect(isWhitespace('\u00A0')).toBe(true)
    expect(isWhitespace('\uFEFF')).toBe(true)
    expect(isWhitespace('a')).toBe(false)
  })

  it('checks whether a full string only contains whitespace', () => {
    expect(isAllWhitespace('')).toBe(true)
    expect(isAllWhitespace(' \t\n\u00A0')).toBe(true)
    expect(isAllWhitespace(' \nvalue')).toBe(false)
  })
})
