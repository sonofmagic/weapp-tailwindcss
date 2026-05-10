import { describe, expect, it } from 'vitest'
import { transformLiteralText } from '@/js'

describe('js literal transform helper', () => {
  it('keeps JS transform decisions bound to classNameSet unless alwaysEscape is enabled', () => {
    expect(transformLiteralText('text-[#123456]', {
      classNameSet: new Set(),
    })).toBeUndefined()

    expect(transformLiteralText('text-[#123456]', {
      classNameSet: new Set(['text-[#123456]']),
    })).toBe('text-_b_h123456_B')

    expect(transformLiteralText('text-[#654321]', {
      classNameSet: new Set(['text-[#123456]']),
    })).toBeUndefined()

    expect(transformLiteralText('text-[#654321]', {
      alwaysEscape: true,
      classNameSet: new Set(['text-[#123456]']),
    })).toBe('text-_b_h654321_B')
  })

  it('handles unicode escape and multiple allowed candidates', () => {
    expect(transformLiteralText('text-\\u005b#123456\\u005d', {
      unescapeUnicode: true,
      classNameSet: new Set(['text-[#123456]']),
    })).toBe('text-_b_h123456_B')

    expect(transformLiteralText('text-[#123456] bg-[#654321]', {
      classNameSet: new Set(['text-[#123456]', 'bg-[#654321]']),
    })).toBe('text-_b_h123456_B bg-_b_h654321_B')
  })

  it('keeps UnoCSS numeric unit values bound to classNameSet', () => {
    expect(transformLiteralText('p-10% p-2.5px m-4rem', {
      classNameSet: new Set(['p-10%', 'p-2.5px', 'm-4rem']),
    })).toBe('p-10_v p-2_d5px m-4rem')

    expect(transformLiteralText('p-10% p-2.5px', {})).toBeUndefined()
  })
})
