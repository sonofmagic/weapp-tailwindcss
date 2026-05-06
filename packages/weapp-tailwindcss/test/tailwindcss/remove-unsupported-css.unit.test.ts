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
      '.text-red-500,::-webkit-search-decoration{color:red}',
      '.nut-input .weui-input::placeholder{color:#999}',
      '.prose .a{color:inherit}',
    ].join('\n'))

    expect(css).not.toContain('::-webkit-calendar-picker-indicator')
    expect(css).not.toContain('::-webkit-input-placeholder')
    expect(css).not.toContain('::placeholder{opacity:1}')
    expect(css).not.toContain(':-moz-focusring')
    expect(css).not.toContain('[hidden]:where(:not([hidden=\'until-found\']))')
    expect(css).not.toContain('input:where([type=\'button\'], [type=\'reset\'], [type=\'submit\'])')
    expect(css).not.toContain('::-webkit-search-decoration')
    expect(css).toContain('.nut-input .weui-input::placeholder{color:#999}')
    expect(css).toContain('.prose .a{color:inherit}')
    expect(css).toContain('.text-red-500{color:red}')
  })
})
