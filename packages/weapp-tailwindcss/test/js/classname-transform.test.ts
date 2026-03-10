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
})
