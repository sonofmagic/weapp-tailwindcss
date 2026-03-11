import { MappingChars2String } from '@weapp-core/escape'
import { describe, expect, it, vi } from 'vitest'
import * as classNameTransform from '@/shared/classname-transform'
import * as wxmlShared from '@/wxml/shared'

describe('classname transform caching', () => {
  it('reuses escaped candidate results for repeated lookups', () => {
    const spy = vi.spyOn(wxmlShared, 'replaceWxml')
    const classNameSet = new Set(['bg-_b_h123456_B'])

    const first = classNameTransform.resolveClassNameTransformWithResult('bg-[#123456]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })
    const second = classNameTransform.resolveClassNameTransformWithResult('bg-[#123456]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })

    expect(first).toEqual({
      decision: 'escaped',
      escapedValue: 'bg-_b_h123456_B',
    })
    expect(second).toEqual(first)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('keeps escaped candidate caching stable for multiple candidates sharing one escape map', () => {
    const spy = vi.spyOn(wxmlShared, 'replaceWxml')
    spy.mockClear()
    const classNameSet = new Set(['w-_b100px_B', 'h-_b37px_B'])

    const firstWidth = classNameTransform.resolveClassNameTransformWithResult('w-[100px]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })
    const firstHeight = classNameTransform.resolveClassNameTransformWithResult('h-[37px]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })
    const secondWidth = classNameTransform.resolveClassNameTransformWithResult('w-[100px]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })
    const secondHeight = classNameTransform.resolveClassNameTransformWithResult('h-[37px]', {
      classNameSet,
      escapeMap: MappingChars2String,
    })

    expect(firstWidth).toEqual({
      decision: 'escaped',
      escapedValue: 'w-_b100px_B',
    })
    expect(firstHeight).toEqual({
      decision: 'escaped',
      escapedValue: 'h-_b37px_B',
    })
    expect(secondWidth).toEqual(firstWidth)
    expect(secondHeight).toEqual(firstHeight)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('keeps whitespace-wrapped arbitrary candidates eligible for controlled fallback', () => {
    const result = classNameTransform.resolveClassNameTransformWithResult('  bg-[length:200rpx_100rpx]  ', {
      classContext: true,
      jsArbitraryValueFallback: true,
    })

    expect(result).toEqual({
      decision: 'fallback',
    })
  })

  it('keeps whitespace-wrapped url-like arbitrary fragments excluded from fallback', () => {
    const result = classNameTransform.resolveClassNameTransformWithResult('  https://foo-bar.com/assets/[token]  ', {
      classContext: true,
      jsArbitraryValueFallback: true,
    })

    expect(result).toEqual({
      decision: 'skip',
    })
  })

  it('skips arbitrary candidates in class context when fallback is explicitly disabled', () => {
    const result = classNameTransform.resolveClassNameTransformWithResult('bg-[length:200rpx_100rpx]', {
      classContext: true,
      jsArbitraryValueFallback: false,
    })

    expect(result).toEqual({
      decision: 'skip',
    })
  })

  it('enables auto fallback for tailwindcss v4 when the runtime set is empty', () => {
    expect(classNameTransform.shouldEnableArbitraryValueFallback({
      tailwindcssMajorVersion: 4,
      classNameSet: new Set<string>(),
    })).toBe(true)

    expect(classNameTransform.shouldEnableArbitraryValueFallback({
      tailwindcssMajorVersion: 4,
      classNameSet: new Set(['bg-red-500']),
    })).toBe(false)
  })
})
