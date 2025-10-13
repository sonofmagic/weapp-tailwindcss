import { describe, expect, it } from 'vitest'
import { createNameMatcher } from '@/utils/nameMatcher'

describe('utils/createNameMatcher', () => {
  it('returns false when matcher is empty', () => {
    const matcher = createNameMatcher(undefined)
    expect(matcher('anything')).toBe(false)
  })

  it('matches exact strings when exact flag is set', () => {
    const matcher = createNameMatcher(['keep-me', 'skip-me'], { exact: true })
    expect(matcher('keep-me')).toBe(true)
    expect(matcher('not-me')).toBe(false)
  })

  it('performs fuzzy matches while escaping special characters', () => {
    const matcher = createNameMatcher(['foo.bar', 'baz'])
    expect(matcher('wrapped foo.bar value')).toBe(true)
    expect(matcher('prefix-baz-suffix')).toBe(true)
    expect(matcher('no-hit')).toBe(false)
  })

  it('handles regular expressions with global flag safely', () => {
    const matcher = createNameMatcher([/fo{2,}/g])
    expect(matcher('foo foo')).toBe(true)
    // call twice to ensure no lastIndex leakage
    expect(matcher('foo foo')).toBe(true)
  })
})
