import { describe, expect, it } from 'vitest'
import { createAuthorSelectorMatcher } from '../src/compat/author-selector'

describe('author selector variant ownership', () => {
  it('preserves expanded variants of exact author classes', () => {
    const matches = createAuthorSelectorMatcher(['.local', '#probe', '.author > .child', '.scoped[data-v-123]'])
    expect(matches('.theme-dark .local')).toBe(true)
    expect(matches('.local.theme-dark')).toBe(true)
    expect(matches('.local:hover')).toBe(true)
    expect(matches('#probe:focus')).toBe(true)
    expect(matches('.author > .child')).toBe(true)
    expect(matches('.scoped[data-v-123].theme-dark')).toBe(true)
    expect(matches('.theme-dark .scoped[data-v-123]')).toBe(true)
    expect(matches('.scoped[data-v-456]')).toBe(false)
    expect(matches('.local-other')).toBe(false)
    expect(matches(':not(.local)')).toBe(false)
    expect(matches('.generated')).toBe(false)
    expect(matches('.local .generated')).toBe(false)
    expect(matches('.local, .generated')).toBe(false)
  })
})
