import { describe, expect, it } from 'vitest'
import {
  cleanUrl,
  defuOverrideArray,
  ensurePosix,
  groupBy,
  isHttp,
  isMap,
  isRegexp,
  noop,
  normalizeRelativeImport,
  normalizeRoot,
  regExpTest,
  removeExt,
  toArray,
} from '@/index'

const ABC_RE = /abc/
const PARAMATER_ARR_RE = /paramater 'arr'/i
const BAR_GLOBAL_RE = /bar/g
const QUX_RE = /qux/
const EXPECTED_ARRAY_RE = /expected an array/i
const EXPECTED_FUNCTION_RE = /expected a function/i
const FOO_GLOBAL_RE = /foo/g

describe('shared utils', () => {
  it('isRegexp correctly detects regular expressions', () => {
    expect(isRegexp(ABC_RE)).toBe(true)
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
    expect(() => regExpTest(null as unknown as [], 'test')).toThrowError(PARAMATER_ARR_RE)

    expect(regExpTest(['foo'], 'prefix-foo-suffix')).toBe(true)
    expect(regExpTest(['foo'], 'prefix-foo-suffix', { exact: true })).toBe(false)
    expect(regExpTest(['foo'], 'foo', { exact: true })).toBe(true)

    BAR_GLOBAL_RE.lastIndex = 0
    const regex = BAR_GLOBAL_RE
    regex.lastIndex = 5
    expect(regExpTest([regex], 'bar')).toBe(true)

    expect(regExpTest(['baz', QUX_RE], 'ends-with-qux')).toBe(true)
    expect(regExpTest(['baz', QUX_RE], 'no-match')).toBe(false)
  })

  it('removeExt strips only the final extension', () => {
    expect(removeExt('file.js')).toBe('file')
    expect(removeExt('archive.tar.gz')).toBe('archive.tar')
    expect(removeExt('noext')).toBe('noext')
    expect(removeExt('')).toBe('')
    expect(removeExt('file.')).toBe('file')
    expect(removeExt('.hidden/file')).toBe('.hidden/file')
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

    const mixedTypes = defuOverrideArray({ include: '**/*.swan' } as any, defaults)
    expect(mixedTypes.include).toBe('**/*.swan')
  })

  it('groupBy validates inputs', () => {
    expect(() => groupBy(null as unknown as string[], () => 'a')).toThrowError(EXPECTED_ARRAY_RE)
    expect(() => groupBy([], null as any)).toThrowError(EXPECTED_FUNCTION_RE)
  })

  it('regExpTest resets regex lastIndex and ignores unsupported entries', () => {
    FOO_GLOBAL_RE.lastIndex = 0
    const regex = FOO_GLOBAL_RE
    regex.lastIndex = 12
    expect(regExpTest([regex], 'foo')).toBe(true)
    expect(regex.lastIndex).not.toBe(12)

    expect(regExpTest([123 as any, {} as any], 'foo')).toBe(false)
  })

  it('noop returns undefined without side effects', () => {
    expect(noop()).toBeUndefined()
  })

  it('toArray normalizes values to arrays', () => {
    expect(toArray(null)).toEqual([])
    expect(toArray('a')).toEqual(['a'])
    expect(toArray(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('ensurePosix normalizes windows separators', () => {
    expect(ensurePosix('C:\\Users\\file.css')).toBe('C:/Users/file.css')
  })

  it('normalizeRoot trims and normalizes root paths', () => {
    expect(normalizeRoot('./src/')).toBe('src')
    expect(normalizeRoot(' /src/app ')).toBe('src/app')
  })

  it('normalizeRelativeImport prepends dot for bare paths', () => {
    expect(normalizeRelativeImport('styles/index.css')).toBe('./styles/index.css')
    expect(normalizeRelativeImport('./styles/index.css')).toBe('./styles/index.css')
    expect(normalizeRelativeImport('/styles/index.css')).toBe('/styles/index.css')
  })

  it('cleanUrl strips query and hash', () => {
    expect(cleanUrl('style.css?inline#hash')).toBe('style.css')
  })

  it('isHttp detects http/https urls', () => {
    expect(isHttp('http://example.com')).toBe(true)
    expect(isHttp('https://example.com')).toBe(true)
    expect(isHttp('ftp://example.com')).toBe(false)
  })
})
