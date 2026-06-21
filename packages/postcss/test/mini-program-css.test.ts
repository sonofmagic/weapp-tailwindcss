import { describe, expect, it } from 'vitest'
import {
  finalizeMiniProgramCss,
  pruneMiniProgramGeneratedCss,
  removeUnsupportedCascadeLayers,
  removeUnsupportedMiniProgramAtRules,
} from '../src'
import postcss from 'postcss'

describe('mini-program css cleanup', () => {
  it('unwraps unsupported cascade layer blocks', () => {
    const root = postcss.parse([
      '@layer utilities {',
      '.text-red-500{color:red}',
      '}',
    ].join('\n'))

    removeUnsupportedCascadeLayers(root)

    expect(root.toString()).not.toContain('@layer')
    expect(root.toString()).toContain('.text-red-500{color:red}')
  })

  it('removes unsupported at-rules with a parser fallback', () => {
    const css = removeUnsupportedMiniProgramAtRules([
      '@supports (display:grid){.grid{display:grid}}',
      '@property --x { syntax: "<number>"; inherits: false; initial-value: 0; }',
      '.block{display:block}',
    ].join('\n'))

    expect(css).not.toContain('@supports')
    expect(css).not.toContain('@property')
    expect(css).toContain('.block{display:block}')
  })

  it('finalizes generated css for mini-program runtime constraints', () => {
    const css = finalizeMiniProgramCss([
      '@layer utilities {',
      '.bg-blue-500:not(#\\#){color:oklch(62.3% 0.214 259.815)}',
      '.icon-\\[mdi--home\\]:not(#n){display:inline-block}',
      '}',
      ':host,page,.tw-root,wx-root-portal-content{--tw-content:"";--color-p3:color(display-p3 0.26642 0.49122 0.98862)}',
      '::-webkit-calendar-picker-indicator{display:none}',
    ].join('\n'))

    expect(css).not.toContain('@layer')
    expect(css).not.toContain(':not(#\\#)')
    expect(css).not.toContain(':not(#n)')
    expect(css).not.toContain('--tw-content')
    expect(css).not.toContain('display-p3')
    expect(css).not.toContain('::-webkit-calendar-picker-indicator')
    expect(css).toContain('.bg-blue-500{color:rgb(50, 128, 255)}')
    expect(css).toContain('.icon-\\[mdi--home\\]{display:inline-block}')
    expect(css).toContain('--color-p3:rgb(50, 128, 255)')
  })

  it('removes cascade layer specificity placeholders when pruning generated css', () => {
    const css = pruneMiniProgramGeneratedCss([
      '@layer utilities {',
      '.navbar__items:not(#\\#):not(#\\#){gap:.75rem}',
      '.icon-\\[mdi--home\\]:not(#n){display:inline-block}',
      '}',
    ].join('\n'))

    expect(css).not.toContain('@layer')
    expect(css).not.toContain(':not(#\\#)')
    expect(css).not.toContain(':not(#n)')
    expect(css).toContain('.navbar__items{gap:.75rem}')
    expect(css).toContain('.icon-\\[mdi--home\\]{display:inline-block}')
  })

  it('removes specificity placeholders even when final css parsing fails', () => {
    const css = finalizeMiniProgramCss([
      '.bg-red-500:not(#\\#):not(#n){color:red',
      '.text-red-500:not(#\\#){color:red}',
    ].join('\n'))

    expect(css).not.toContain(':not(#\\#)')
    expect(css).not.toContain(':not(#n)')
  })

  it('removes root specificity placeholders from finalized css without touching user selectors', () => {
    const css = finalizeMiniProgramCss([
      'page:not(.does-not-exist),.tw-root,wx-root-portal-content:not(.does-not-exist){--nut-icon-height:32rpx}',
      '.btn:not(.does-not-exist){color:red}',
    ].join('\n'))

    expect(css).toContain('page,.tw-root,wx-root-portal-content{--nut-icon-height:32rpx}')
    expect(css).toContain('.btn:not(.does-not-exist){color:red}')
    expect(css).not.toContain('page:not(.does-not-exist)')
    expect(css).not.toContain('wx-root-portal-content:not(.does-not-exist)')
  })

  it('normalizes Tailwind v4 rounded-full infinity radius for mini-program output', () => {
    const css = finalizeMiniProgramCss([
      '/*! tailwindcss v4.2.4 */',
      '.rounded-full{border-radius:calc(infinity * 1px)}',
      '.rounded-t-full{border-top-left-radius:calc(infinity * 1px);border-top-right-radius:calc(infinity * 1px)}',
    ].join('\n'))

    expect(css).toContain('.rounded-full{border-radius:9999px}')
    expect(css).toContain('border-top-left-radius:9999px')
    expect(css).toContain('border-top-right-radius:9999px')
    expect(css).not.toContain('infinity')
  })
})
