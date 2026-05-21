import { describe, expect, it } from 'vitest'
import { finalizeMiniProgramCss } from '@/bundlers/shared/css-cleanup'
import { pruneMiniProgramGeneratedCss } from '@/tailwindcss/miniprogram'

describe('tailwindcss/remove unsupported css', () => {
  it('removes cascade layer declarations and unwraps layer blocks in final mini-program css', () => {
    const css = finalizeMiniProgramCss([
      '@layer theme, base, components, utilities;',
      '@layer utilities {',
      '.text-red-500{color:red}',
      '}',
      '@media (min-width: 768px) {',
      '@layer utilities {',
      '.md\\:block{display:block}',
      '}',
      '}',
    ].join('\n'))

    expect(css).not.toContain('@layer')
    expect(css).toContain('.text-red-500{color:red}')
    expect(css).toContain('@media (min-width: 768px)')
    expect(css).toContain('.md\\:block{display:block}')
  })

  it('unwraps Tailwind source media markers in final mini-program css', () => {
    const css = finalizeMiniProgramCss([
      '@media source(none) {',
      'view,text,:after,:before{box-sizing:border-box}',
      '}',
      '@media (min-width: 768px) {',
      '.md\\:block{display:block}',
      '}',
    ].join('\n'))

    expect(css).not.toContain('@media source(none)')
    expect(css).toContain('view,text,:after,:before{box-sizing:border-box}')
    expect(css).toContain('@media (min-width: 768px)')
    expect(css).toContain('.md\\:block{display:block}')
  })

  it('does not synthesize the Tailwind v3 pseudo content init in final mini-program css', () => {
    const css = finalizeMiniProgramCss([
      ':host,page,.tw-root,wx-root-portal-content {',
      '  --color-red-500: red;',
      '}',
      '.bg-red-500 {',
      '  background-color: var(--color-red-500);',
      '}',
    ].join('\n'))

    expect(css).not.toContain('--tw-content')
    expect(css).toContain(':host,page,.tw-root,wx-root-portal-content')
    expect(css).toContain('background-color: var(--color-red-500)')
  })

  it('keeps Tailwind v4 content init when content variable is used', () => {
    const css = finalizeMiniProgramCss([
      '::before,::after{--tw-content:""}',
      ':host,page,.tw-root,wx-root-portal-content {',
      '  --tw-content: "";',
      '  --color-red-500: red;',
      '}',
      '.before\\:content-\\[\\\"x\\\"\\]::before {',
      '  --tw-content: "x";',
      '  content: var(--tw-content);',
      '}',
    ].join('\n'))

    expect(css).not.toContain('::before,::after{--tw-content:""}')
    expect(css).toMatch(/--tw-content:\s*(?:""|''|''|')\s*(?:;|\})/)
    expect(css).toContain('--tw-content: "x"')
    expect(css).toContain('content: var(--tw-content)')
    expect(css).toContain('--color-red-500: red')
  })

  it('removes Tailwind v4 content init when content variable is unused', () => {
    const css = finalizeMiniProgramCss([
      ':host,page,.tw-root,wx-root-portal-content {',
      '  --tw-content: "";',
      '  --color-red-500: red;',
      '}',
      '.bg-red-500 { background-color: var(--color-red-500); }',
    ].join('\n'))

    expect(css).not.toContain('--tw-content')
    expect(css).toContain('--color-red-500: red')
    expect(css).toContain('background-color: var(--color-red-500)')
  })

  it('synthesizes configured mini-program preflight when generator css misses base reset', () => {
    const css = finalizeMiniProgramCss([
      '.divide-x-4>view+view{border-left-width:4px}',
      '.divide-double>view+view{border-style:double}',
    ].join('\n'), {
      cssPreflight: {
        'box-sizing': 'border-box',
        margin: '0',
        padding: '0',
        border: '0 solid',
      },
    })

    expect(css).toContain('view,text,:after,:before')
    expect(css).toContain('box-sizing:border-box')
    expect(css).toContain('margin:0')
    expect(css).toContain('padding:0')
    expect(css).toContain('border:0 solid')
    expect(css).toContain('.divide-double>view+view{border-style:double}')
  })

  it('does not synthesize mini-program preflight when cssPreflight is disabled', () => {
    const css = finalizeMiniProgramCss('.divide-double>view+view{border-style:double}', {
      cssPreflight: false,
    })

    expect(css).not.toContain('view,text,:after,:before')
    expect(css).not.toContain('border:0 solid')
    expect(css).toContain('.divide-double>view+view{border-style:double}')
  })

  it('keeps generated utilities when pruning layer-wrapped mini-program css', () => {
    const css = pruneMiniProgramGeneratedCss([
      '@layer theme, base, components, utilities;',
      '@layer theme {',
      ':root{--color-red-500:red}',
      '}',
      '@layer utilities {',
      '.text-red-500{color:var(--color-red-500)}',
      '}',
    ].join('\n'))

    expect(css).not.toContain('@layer')
    expect(css).toContain('page,.tw-root,wx-root-portal-content,:host{--color-red-500:red}')
    expect(css).toContain('.text-red-500{color:var(--color-red-500)}')
  })

  it('removes specificity placeholder selectors from final generator css', () => {
    const css = finalizeMiniProgramCss([
      '.bg-red-500:not(#\\#):not(#\\#){color:red}',
      '.space-y-4:not(#n):not(#\\#)>view+text{margin-top:1rem}',
    ].join('\n'))

    expect(css).not.toContain(':not(#\\#)')
    expect(css).not.toContain(':not(#n)')
    expect(css).toContain('.bg-red-500{color:red}')
    expect(css).toContain('.space-y-4>view+text{margin-top:1rem}')
  })

  it('removes browser-only pseudo selectors from final generator css', () => {
    const css = finalizeMiniProgramCss([
      '::-webkit-calendar-picker-indicator{display:none}',
      '::placeholder,::-webkit-input-placeholder{opacity:1}',
      ':-moz-focusring{outline:auto}',
      '[hidden]:where(:not([hidden=\'until-found\'])){display:none}',
      'a,button,input:where([type=\'button\'], [type=\'reset\'], [type=\'submit\']){font:inherit}',
      'ul,textarea,video{display:block}',
      '.text-red-500,::-webkit-search-decoration{color:red}',
      '.nut-input .weui-input::placeholder{color:#999}',
      '.nut-video video{width:100%}',
      '.prose .a{color:inherit}',
    ].join('\n'))

    expect(css).not.toContain('::-webkit-calendar-picker-indicator')
    expect(css).not.toContain('::-webkit-input-placeholder')
    expect(css).not.toContain('::placeholder{opacity:1}')
    expect(css).not.toContain(':-moz-focusring')
    expect(css).not.toContain('[hidden]:where(:not([hidden=\'until-found\']))')
    expect(css).not.toContain('input:where([type=\'button\'], [type=\'reset\'], [type=\'submit\'])')
    expect(css).not.toContain('ul{display:block}')
    expect(css).not.toContain('textarea{display:block}')
    expect(css).not.toContain('video{display:block}')
    expect(css).not.toContain('::-webkit-search-decoration')
    expect(css).toContain('.nut-input .weui-input::placeholder{color:#999}')
    expect(css).toContain('.nut-video video{width:100%}')
    expect(css).toContain('.prose .a{color:inherit}')
    expect(css).toContain('.text-red-500{color:red}')
  })
})
