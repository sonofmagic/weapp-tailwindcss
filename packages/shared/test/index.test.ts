import { describe, expect, it } from 'vitest'
import { groupBy, isMap, isRegexp } from '@/index'

describe('shared utils', () => {
  it('isRegexp correctly detects regular expressions', () => {
    expect(isRegexp(/abc/)).toBe(true)
    expect(isRegexp('abc')).toBe(false)
    expect(isRegexp(null)).toBe(false)
  })

  it('isMap correctly detects Map instances', () => {
    expect(isMap(new Map())).toBe(true)
    expect(isMap(new Map([[1, 'a']]))).toBe(true)
    expect(isMap({})).toBe(false)
  })

  it('groupBy groups values and returns an object without prototype pollution', () => {
    const items = ['ant', 'bear', 'bat']
    const grouped = groupBy(items, value => value[0])

    expect(grouped).toEqual({
      a: ['ant'],
      b: ['bear', 'bat'],
    })
    expect(Object.getPrototypeOf(grouped)).toBeNull()
  })
})
