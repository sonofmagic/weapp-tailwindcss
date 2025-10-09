import { describe, expect, it } from 'vitest'
import { defuOverrideArray, groupBy, isMap, isRegexp, regExpTest, removeExt } from '@/index'

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

  it('regExpTest supports exact matching and mixed values', () => {
    expect(() => regExpTest(null as unknown as [], 'test')).toThrowError(/paramater 'arr'/i)

    expect(regExpTest(['foo'], 'prefix-foo-suffix')).toBe(true)
    expect(regExpTest(['foo'], 'prefix-foo-suffix', { exact: true })).toBe(false)
    expect(regExpTest(['foo'], 'foo', { exact: true })).toBe(true)

    const regex = /bar/g
    regex.lastIndex = 5
    expect(regExpTest([regex], 'bar')).toBe(true)

    expect(regExpTest(['baz', /qux/], 'ends-with-qux')).toBe(true)
    expect(regExpTest(['baz', /qux/], 'no-match')).toBe(false)
  })

  it('removeExt strips only the final extension', () => {
    expect(removeExt('file.js')).toBe('file')
    expect(removeExt('archive.tar.gz')).toBe('archive.tar')
    expect(removeExt('noext')).toBe('noext')
    expect(removeExt('')).toBe('')
  })

  it('defuOverrideArray replaces array values instead of merging them', () => {
    const defaults = {
      include: ['**/*.wxml', '**/*.wxss'],
      nested: {
        matchers: ['**/*.js'],
      },
    }
    const options = {
      include: ['**/*.axml'],
      nested: {
        matchers: ['**/*.ts'],
      },
    }

    const merged = defuOverrideArray(options, defaults)

    expect(merged.include).toEqual(['**/*.axml'])
    expect(merged.nested.matchers).toEqual(['**/*.ts'])

    const withFallback = defuOverrideArray({ flag: true }, defaults)
    expect(withFallback.include).toEqual(['**/*.wxml', '**/*.wxss'])
    expect(withFallback.nested.matchers).toEqual(['**/*.js'])
    expect(withFallback.flag).toBe(true)
  })
})
