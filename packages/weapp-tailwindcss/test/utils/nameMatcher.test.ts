import { describe, expect, it } from 'vitest'
import { createNameMatcher } from '@/utils/nameMatcher'

const GLOBAL_FOO_REGEXP = /fo{2,}/g
const EXACT_STYLED_REGEXP = /^styled$/

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

  it('matches a single exact string through the dedicated fast path', () => {
    const matcher = createNameMatcher(['weappTwIgnore'], { exact: true })
    expect(matcher('weappTwIgnore')).toBe(true)
    expect(matcher('weappTwIgnorex')).toBe(false)
  })

  it('performs fuzzy matches while escaping special characters', () => {
    const matcher = createNameMatcher(['foo.bar', 'baz'])
    expect(matcher('wrapped foo.bar value')).toBe(true)
    expect(matcher('prefix-baz-suffix')).toBe(true)
    expect(matcher('no-hit')).toBe(false)
  })

  it('handles regular expressions with global flag safely', () => {
    const matcher = createNameMatcher([GLOBAL_FOO_REGEXP])
    expect(matcher('foo foo')).toBe(true)
    // call twice to ensure no lastIndex leakage
    expect(matcher('foo foo')).toBe(true)
  })

  it('supports exact mode with regex-only input', () => {
    const matcher = createNameMatcher([EXACT_STYLED_REGEXP], { exact: true })
    expect(matcher('styled')).toBe(true)
    expect(matcher('styled.div')).toBe(false)
  })
})
