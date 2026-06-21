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

  it('transforms arbitrary literal aliases only by exact classNameSet hits', () => {
    expect(transformLiteralText('bg-[#f50505] text-[100rpx] w-[112px]', {
      classNameSet: new Set(['bg-[#f50505]', 'text-[100rpx]', 'w-[112px]']),
    })).toBe('bg-_b_hf50505_B text-_b100rpx_B w-_b112px_B')

    expect(transformLiteralText('bg-[#f50505] text-[100rpx] w-[112px]', {
      classNameSet: new Set(['bg-[#f50505]']),
    })).toBe('bg-_b_hf50505_B text-[100rpx] w-[112px]')
  })

  it('keeps inline style string values untouched without classNameSet hits', () => {
    expect(transformLiteralText('1px solid #0f172a 6px 56px 112px 100vh 32px 24px', {
      classNameSet: new Set(['bg-[#f50505]', 'text-[100rpx]', 'w-[112px]']),
    })).toBeUndefined()
  })
})
