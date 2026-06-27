import { describe, expect, it } from 'vitest'
import {
  containsCssAfterMinify,
  filterExistingCssRules,
  mergeCoveredCssRuleDeclarations,
  mergeMiniProgramPreflightRuleDeclarations,
  mergeMiniProgramThemeScopeRuleDeclarations,
} from '../src/vite-css-rules'

describe('vite css rule helpers', () => {
  it('detects css containment before and after minification', () => {
    expect(containsCssAfterMinify('.card{display:flex}', '.card{display:flex}')).toBe(true)
    expect(containsCssAfterMinify('.card { display: flex; }', '.card{display:flex}')).toBe(true)
    expect(containsCssAfterMinify('.a{color:red}.b{color:blue}', '.b { color: blue; }')).toBe(true)
    expect(containsCssAfterMinify('@media (any-hover: hover){.card:hover{opacity:.8}}', '@media(any-hover:hover){.card:hover{opacity:.8}}')).toBe(true)
    expect(containsCssAfterMinify('.card{display:flex}', '.missing{display:flex}')).toBe(false)
  })

  it('normalizes comments and pseudo-element spelling for containment checks', () => {
    const baseCss = 'view,text,:before,:after{box-sizing:border-box}'
    const css = '/* tailwind */ view, text, ::before, ::after { box-sizing: border-box; }'

    expect(containsCssAfterMinify(baseCss, css)).toBe(true)
  })

  it('returns false for malformed containment candidates that cannot match', () => {
    expect(containsCssAfterMinify('.card{display:flex}', '.card{display:grid')).toBe(false)
  })

  it('merges mini-program preflight declarations into the existing base rule', () => {
    const result = mergeMiniProgramPreflightRuleDeclarations(
      '@media (min-width:0){text, view,::before,::after{box-sizing:border-box}}',
      '@media (min-width:0){::after,view,text,::before{border-width:0;box-sizing:border-box}}',
    )

    expect(result.changed).toBe(true)
    expect(result.baseCss).toContain('box-sizing:border-box;border-width:0')
    expect(result.css).toBe('')
  })

  it('does not merge preflight declarations without a matching base selector set', () => {
    const baseCss = 'view{text-align:left}'
    const css = 'view,text,::before,::after{box-sizing:border-box}'

    expect(mergeMiniProgramPreflightRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('leaves preflight css unchanged when parsing fails', () => {
    const baseCss = 'view,text,::before,::after{box-sizing:border-box'
    const css = 'view,text,::before,::after{border-width:0}'

    expect(mergeMiniProgramPreflightRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('merges mini-program theme scope custom properties when they are non-conflicting', () => {
    const result = mergeMiniProgramThemeScopeRuleDeclarations(
      ':host,page,.tw-root,wx-root-portal-content{--tw-space-y-reverse:0}',
      'page,.tw-root,wx-root-portal-content,:host{--tw-divide-y-reverse:0;--tw-space-y-reverse:0}',
    )

    expect(result.changed).toBe(true)
    expect(result.baseCss).toContain('--tw-space-y-reverse:0;--tw-divide-y-reverse:0')
    expect(result.css).toBe('')
  })

  it('keeps mini-program theme scope rules when an incoming custom property conflicts', () => {
    const baseCss = ':host,page,.tw-root,wx-root-portal-content{--tw-space-y-reverse:0}'
    const css = 'page,.tw-root,wx-root-portal-content,:host{--tw-space-y-reverse:1}'

    expect(mergeMiniProgramThemeScopeRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('does not remove empty theme scope rules', () => {
    const baseCss = ':host,page,.tw-root,wx-root-portal-content{--tw-space-y-reverse:0}'
    const css = ':host,page,.tw-root,wx-root-portal-content{}'

    expect(mergeMiniProgramThemeScopeRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('leaves theme scope css unchanged when parsing fails', () => {
    const baseCss = ':host,page,.tw-root,wx-root-portal-content{--tw-space-y-reverse:0'
    const css = ':host,page,.tw-root,wx-root-portal-content{--tw-divide-y-reverse:0}'

    expect(mergeMiniProgramThemeScopeRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('removes covered css rules and drops empty wrapper at-rules', () => {
    const result = mergeCoveredCssRuleDeclarations(
      '@media (hover:hover){.btn{display:flex;color:red}}',
      '@media (hover:hover){.btn{display:flex;color:red}}',
    )

    expect(result).toEqual({
      baseCss: '@media (hover:hover){.btn{display:flex;color:red}}',
      css: '',
      changed: true,
    })
  })

  it('merges partially covered non-conflicting declarations into the base rule', () => {
    const result = mergeCoveredCssRuleDeclarations(
      '.btn{display:flex}',
      '.btn{display:flex;gap:12px}',
    )

    expect(result.changed).toBe(true)
    expect(result.baseCss).toBe('.btn{display:flex;gap:12px}')
    expect(result.css).toBe('')
  })

  it('keeps partially covered rules when missing declarations conflict by property', () => {
    const baseCss = '.btn{display:flex;color:red}'
    const css = '.btn{display:flex;color:blue}'

    expect(mergeCoveredCssRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('keeps rules that have no covered declarations', () => {
    const baseCss = '.btn{display:flex}'
    const css = '.btn{color:blue}'

    expect(mergeCoveredCssRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('ignores empty and unmatched covered css rules', () => {
    const baseCss = '.btn{display:flex}'

    expect(mergeCoveredCssRuleDeclarations(baseCss, '.btn{}')).toEqual({
      baseCss,
      css: '.btn{}',
      changed: false,
    })
    expect(mergeCoveredCssRuleDeclarations(baseCss, '@media (min-width:640px){.btn{display:flex}}')).toEqual({
      baseCss,
      css: '@media (min-width:640px){.btn{display:flex}}',
      changed: false,
    })
  })

  it('keeps preflight and theme rules when selector sets are duplicated or incomplete', () => {
    const preflightBase = 'view,text,::before,::after{box-sizing:border-box}'
    const duplicatedPreflight = 'view,view,text,::before,::after{border-width:0}'
    expect(mergeMiniProgramPreflightRuleDeclarations(preflightBase, duplicatedPreflight)).toEqual({
      baseCss: preflightBase,
      css: duplicatedPreflight,
      changed: false,
    })

    const themeBase = ':host,page,.tw-root,wx-root-portal-content{--tw-space-y-reverse:0}'
    const incompleteTheme = ':host,page,.tw-root{--tw-divide-y-reverse:0}'
    expect(mergeMiniProgramThemeScopeRuleDeclarations(themeBase, incompleteTheme)).toEqual({
      baseCss: themeBase,
      css: incompleteTheme,
      changed: false,
    })
  })

  it('leaves covered css unchanged when parsing fails', () => {
    const baseCss = '.btn{display:flex'
    const css = '.btn{display:flex}'

    expect(mergeCoveredCssRuleDeclarations(baseCss, css)).toEqual({
      baseCss,
      css,
      changed: false,
    })
  })

  it('filters exact duplicate rules and removes empty at-rules', () => {
    const baseCss = '@media (min-width: 640px){.card{display:flex}}'
    const css = '@media (min-width: 640px){.card{display:flex}}'

    expect(filterExistingCssRules(baseCss, css)).toBe('')
  })

  it('treats var fallback declarations as covered by the fallback value', () => {
    const baseCss = '.card{color:#175e75;color:var(--card-color,#175e75);display:inline-flex}'
    const css = '.card{color:var(--card-color,#175e75);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe('')
  })

  it('treats generated fallback declarations as covered by the original var fallback', () => {
    const baseCss = '.card{color:var(--card-color,#175e75);display:inline-flex}'
    const css = '.card{color:#175e75;color:var(--card-color,#175e75);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe('')
  })

  it('keeps var fallback declarations when the fallback value differs', () => {
    const baseCss = '.card{color:#175e75;display:inline-flex}'
    const css = '.card{color:var(--card-color,#0f172a);display:inline-flex}'

    expect(filterExistingCssRules(baseCss, css)).toBe(css)
  })

  it('returns original css when no existing rules can be collected from the base css', () => {
    const css = '.card{display:flex}'

    expect(filterExistingCssRules('/* empty */', css)).toBe(css)
  })

  it('returns original css when existing rules do not cover candidate rules', () => {
    const css = '.card{display:grid}'

    expect(filterExistingCssRules('.card{display:flex}', css)).toBe(css)
  })

  it('returns original css when the candidate css cannot be parsed', () => {
    const css = '.card{display:flex'

    expect(filterExistingCssRules('.card{display:flex}', css)).toBe(css)
  })

  it('returns false for malformed containment css that cannot match', () => {
    expect(containsCssAfterMinify('.card{display:flex}', '@media{')).toBe(false)
  })
})
