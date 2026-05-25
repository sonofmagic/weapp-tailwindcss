import { describe, expect, it } from 'vitest'
import {
  finalizeMiniProgramCss,
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
      '}',
      ':host,page,.tw-root,wx-root-portal-content{--tw-content:"";--color-p3:color(display-p3 0.26642 0.49122 0.98862)}',
      '::-webkit-calendar-picker-indicator{display:none}',
    ].join('\n'))

    expect(css).not.toContain('@layer')
    expect(css).not.toContain(':not(#\\#)')
    expect(css).not.toContain('--tw-content')
    expect(css).not.toContain('display-p3')
    expect(css).not.toContain('::-webkit-calendar-picker-indicator')
    expect(css).toContain('.bg-blue-500{color:rgb(50, 128, 255)}')
    expect(css).toContain('--color-p3:rgb(50, 128, 255)')
  })
})
