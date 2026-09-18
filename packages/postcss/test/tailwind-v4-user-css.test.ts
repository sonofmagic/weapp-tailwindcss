import { afterEach, describe, expect, it, vi } from 'vitest'
import { filterTailwindV4ApplyOnlyGeneratedCss } from '../src/compat/tailwindcss-v4/user-css/apply-only'
import { preferScopedGeneratedCssRules, preferScopedGeneratedCssRulesRoot } from '../src/compat/tailwindcss-v4/user-css/scoped-rules'
import { analyzeApplyOnlySource } from '../src/compat/tailwindcss-v4/user-css/user-layers'
import { postcss } from '../src/postcss-runtime'

describe('Tailwind v4 user CSS ownership and AST reuse', () => {
  afterEach(() => vi.restoreAllMocks())

  it('analyzes mixed, nested, empty and malformed apply sources in one parse', () => {
    const parse = vi.spyOn(postcss, 'parse')
    const source = '@media screen {.card,.button{@apply flex}}'
    expect(analyzeApplyOnlySource(source)).toEqual({ selectors: new Set(['.card', '.button']), onlyApply: true })
    expect(parse).toHaveBeenCalledTimes(1)
    expect(analyzeApplyOnlySource(source + '.plain{color:red}').onlyApply).toBe(false)
    expect(analyzeApplyOnlySource('')).toEqual({ selectors: new Set(), onlyApply: false })
    expect(analyzeApplyOnlySource('.card{@apply flex')).toEqual({ selectors: new Set(), onlyApply: false })
  })

  it('filters apply output and prefers scoped copies without reparsing generated CSS', () => {
    const parse = vi.spyOn(postcss, 'parse')
    const output = filterTailwindV4ApplyOnlyGeneratedCss(
      '.card{display:flex}.card[data-v-a]{display:flex}.unrelated{display:block}',
      '.card{@apply flex}',
      { preferScopedRules: true },
    )
    expect(output).toBe('.card[data-v-a]{display:flex}')
    expect(parse).toHaveBeenCalledTimes(2)
  })

  it('requires the same context, declarations and complete selector coverage', () => {
    const source = [
      '.a,.b{margin:0.5rem}',
      '.a[data-v-a],.b[data-v-a]{margin:.5rem}',
      '.partial,.other{color:red}',
      '.partial[data-v-a]{color:red}',
      '@media screen {.a{margin:0.5rem}}',
      '.important{color:red!important}.important[data-v-a]{color:red}',
      '.quoted{content:"0.5"}.quoted[data-v-a]{content:".5"}',
    ].join('')
    const output = preferScopedGeneratedCssRules(source)
    expect(output).not.toContain('.a,.b{')
    expect(output).toContain('.partial,.other{color:red}')
    expect(output).toContain('@media screen {.a{margin:0.5rem}}')
    expect(output).toContain('.important{color:red!important}')
    expect(output).toContain('.quoted{content:"0.5"}')
  })

  it('rebuilds coverage after mutations and handles large selector groups', () => {
    const selectors = Array.from({ length: 500 }, (_, index) => '.item-' + index)
    const plain = selectors.join(',')
    const scoped = selectors.map(selector => selector + '[data-v-a]').join(',')
    const root = postcss.parse(plain + '{color:red}' + scoped + '{color:blue}')
    preferScopedGeneratedCssRulesRoot(root)
    expect(root.nodes).toHaveLength(2)
    root.walkDecls(decl => { decl.value = 'red' })
    preferScopedGeneratedCssRulesRoot(root)
    expect(root.nodes).toHaveLength(1)
    expect(root.first?.type === 'rule' && root.first.selector).toBe(scoped)
    expect(preferScopedGeneratedCssRules('.a[data-v-a]{')).toBe('.a[data-v-a]{')
  })
})
