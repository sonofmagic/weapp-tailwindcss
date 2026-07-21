import { describe, expect, it } from 'vitest'
import { removeCommentOnlyAtRules, removeEmptyCssAtRules } from '@/bundlers/vite/processed-css-assets/cleanup'

describe('vite processed css cleanup', () => {
  it('cleans empty at-rules without backtracking on comment-rich css', () => {
    const source = [
      '@media screen {',
      '/* generated token */'.repeat(25),
      '.keep { color: red; }',
      '}',
      '@supports (display: grid) {}',
    ].join('\n')
    const startedAt = performance.now()

    const css = removeEmptyCssAtRules(source)

    expect(performance.now() - startedAt).toBeLessThan(1000)
    expect(css).toContain('@media screen')
    expect(css).toContain('.keep { color: red; }')
    expect(css).not.toContain('@supports')
  })

  it('cleans comment-only at-rules without backtracking on comment-rich css', () => {
    const source = [
      '@media screen {',
      '/* generated token */'.repeat(25),
      '.keep { color: red; }',
      '}',
      '@supports (display: grid) { /* removed declarations */ }',
    ].join('\n')
    const startedAt = performance.now()

    const css = removeCommentOnlyAtRules(source)

    expect(performance.now() - startedAt).toBeLessThan(1000)
    expect(css).toContain('@media screen')
    expect(css).toContain('.keep { color: red; }')
    expect(css).not.toContain('@supports')
  })
})
