import { describe, expect, it } from 'vitest'
import { isTailwindRuntimePropertyRule, postcss, retainUniAppXAuthorApplyCss, transformWebCssCompat } from '../src'

describe('uni-app x author runtime initialization', () => {
  it.each(['*', '*, ::before, ::after, ::backdrop', '*[data-v-test], [data-v-test]::before', '[data-v-test]'])('recognizes runtime scope %s', (selector) => {
    const rule = postcss.rule({ selector, nodes: [postcss.decl({ prop: '--tw-shadow', value: '0 0 #0000' })] })
    expect(isTailwindRuntimePropertyRule(rule)).toBe(true)
    rule.append(postcss.decl({ prop: 'box-sizing', value: 'border-box' }))
    expect(isTailwindRuntimePropertyRule(rule)).toBe(false)
  })

  it.each(['.shadow', 'view', ':root', ':hover', '* > *'])('rejects utility, theme and element scope %s', (selector) => {
    const rule = postcss.rule({ selector, nodes: [postcss.decl({ prop: '--tw-shadow', value: 'red' })] })
    expect(isTailwindRuntimePropertyRule(rule)).toBe(false)
  })

  const author = '.local { @apply shadow-md; }'
  const generated = `
    @property --tw-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }
    @property --tw-inset-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }
    @property --tw-unused { syntax: "*"; inherits: false; initial-value: 1; }
    * { box-sizing: border-box; }
    :root { --color-red: red; }
    .unrelated { color: red; }
    .local { --tw-shadow: 0 4px red; box-shadow: var(--tw-inset-shadow), var(--tw-shadow); }
  `

  it.each([true, false])('retains only used runtime properties, with webCompat=%s', (webCompat) => {
    const css = transformWebCssCompat(generated, webCompat)
    const result = retainUniAppXAuthorApplyCss(css, author, { preserveRuntimeProperties: true })
    expect(result).toContain('--tw-inset-shadow')
    expect(result).not.toContain('--tw-unused')
    expect(result).not.toContain(':root')
    expect(result).not.toContain('box-sizing')
    expect(result).not.toContain('.unrelated')
    expect(result).toContain('var(--tw-inset-shadow), var(--tw-shadow)')
    expect(retainUniAppXAuthorApplyCss(result, author, { preserveRuntimeProperties: true })).toBe(result)
    if (webCompat) {
      expect(result.indexOf('--tw-inset-shadow: 0 0 #0000')).toBeLessThan(result.indexOf('.local'))
    }
    else {
      expect(result).toContain('@property --tw-inset-shadow')
    }
  })

  it('preserves existing native pruning by default', () => {
    const result = retainUniAppXAuthorApplyCss(generated, author)
    expect(result).not.toContain('@property')
    expect(result).not.toContain('box-sizing')
    expect(result).toContain('.local')
  })
})
