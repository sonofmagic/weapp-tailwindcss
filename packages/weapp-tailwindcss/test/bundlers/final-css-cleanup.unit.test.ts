import { describe, expect, it } from 'vitest'
import { finalizeMiniProgramCssStructure, hasEmptyAtRuleBlockCandidate } from '@/bundlers/shared/final-css-cleanup'

describe('final mini-program css cleanup', () => {
  it('detects empty block at-rules with a linear precheck', () => {
    expect(hasEmptyAtRuleBlockCandidate('@media screen { /* token */ .keep {} }')).toBe(false)
    expect(hasEmptyAtRuleBlockCandidate('@media screen { @supports (display: grid) { /* removed */ } }')).toBe(true)
    expect(hasEmptyAtRuleBlockCandidate('@supports (background: url(data:image/svg+xml;utf8,test)) {}')).toBe(true)
    expect(hasEmptyAtRuleBlockCandidate('@custom "value;{}"; .keep {}')).toBe(false)
  })

  it('recursively removes empty and comment-only block at-rules', () => {
    const source = [
      '@media (prefers-color-scheme: light) {}',
      '@media screen { @supports (display: grid) { /* removed declarations */ } }',
      '@supports (display: flex) { /* removed declarations */ }',
      '.keep { color: red; }',
    ].join('\n')

    expect(finalizeMiniProgramCssStructure(source)).toBe('.keep { color: red; }')
  })

  it('preserves valid dark media and statement at-rules', () => {
    const source = [
      '@charset "UTF-8";',
      '@import "./theme.wxss";',
      '@media (prefers-color-scheme: dark) { .theme { background-color: #232323; } }',
    ].join('\n')

    expect(finalizeMiniProgramCssStructure(source)).toBe(source)
  })

  it('removes a trailing unclosed Tailwind source media marker', () => {
    const source = '.keep { color: red; }\n@media source(none) {\n'

    expect(finalizeMiniProgramCssStructure(source)).toBe('.keep { color: red; }')
  })

  it('returns css without candidates before parsing', () => {
    const source = `${'/* generated token */'.repeat(25)}\n.keep { color: red; }`
    const startedAt = performance.now()

    expect(finalizeMiniProgramCssStructure(source)).toBe(source)
    expect(performance.now() - startedAt).toBeLessThan(1000)
  })

  it('returns malformed css unchanged when parsing fails', () => {
    const source = '@media (prefers-color-scheme: dark) {}\n.broken {'

    expect(finalizeMiniProgramCssStructure(source)).toBe(source)
  })
})
