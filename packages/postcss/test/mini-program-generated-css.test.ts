import { describe, expect, it } from 'vitest'
import { finalizeMiniProgramCss, pruneMiniProgramGeneratedCss } from '../src'

describe('mini-program generated css cleanup', () => {
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

  it('keeps Tailwind v4 property defaults after removing @property rules', () => {
    const css = finalizeMiniProgramCss([
      '/*! tailwindcss v4.1.10 | MIT License | https://tailwindcss.com */',
      '.border{border-style:var(--tw-border-style);border-width:1px}',
      '@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}',
    ].join(''))

    expect(css).toContain('view,text,:after,:before{--tw-border-style:solid}')
    expect(css).toContain('.border{border-style:var(--tw-border-style);border-width:1px}')
    expect(css).not.toContain('@property')
  })

  it('merges mini-program preflight reset with Tailwind v4 property defaults', () => {
    const css = finalizeMiniProgramCss([
      '/*! tailwindcss v4.1.10 | MIT License | https://tailwindcss.com */',
      '.border{border-style:var(--tw-border-style);border-width:1px}',
      '@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}',
    ].join(''), {
      cssPreflight: {
        'box-sizing': 'border-box',
        margin: '0',
        padding: '0',
        border: '0 solid',
      },
    })

    expect(css.match(/view,text,:after,:before\{/g)).toHaveLength(1)
    expect(css).toContain('border:0 solid;--tw-border-style:solid')
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

  it('preserves conditional compilation comments when pruning generated css', () => {
    const css = pruneMiniProgramGeneratedCss([
      '/* #ifdef MP-WEIXIN */',
      '.bg-blue-500{color:blue}',
      '/* #endif */',
      '/* normal comment */',
    ].join('\n'), {
      preserveConditionalComments: true,
    })

    expect(css).toContain('#ifdef MP-WEIXIN')
    expect(css).toContain('#endif')
    expect(css).toContain('.bg-blue-500{color:blue}')
    expect(css).not.toContain('normal comment')
  })

  it('scopes Tailwind v4 gradient runtime defaults to mini-program elements only', () => {
    const css = pruneMiniProgramGeneratedCss([
      ':root,:host{',
      '--tw-gradient-position:initial;',
      '--tw-gradient-from:rgba(0,0,0,0);',
      '--tw-gradient-to:rgba(0,0,0,0);',
      '--tw-gradient-from-position:0%;',
      '--tw-gradient-to-position:100%;',
      '--color-amber-200:#fde68a;',
      '--color-orange-200:#fed7aa;',
      '}',
      '.bg-linear-to-r{background-image:linear-gradient(var(--tw-gradient-stops))}',
    ].join(''))

    expect(css).toContain('view,text,:after,:before{--tw-gradient-position:initial')
    expect(css).toContain('--tw-gradient-from:rgba(0,0,0,0)')
    expect(css).toContain('--tw-gradient-to:rgba(0,0,0,0)')
    expect(css).toContain('--tw-gradient-from-position:0%')
    expect(css).toContain('--tw-gradient-to-position:100%')
    expect(css).toContain('page,.tw-root,wx-root-portal-content,:host{')
    expect(css).toContain('--color-amber-200:#fde68a')
    expect(css).toContain('--color-orange-200:#fed7aa')
    expect(css).toContain('.bg-linear-to-r{background-image:linear-gradient(var(--tw-gradient-stops))}')
  })

  it('keeps only mini-program useful webkit prefixes in generated css pruning', () => {
    const css = pruneMiniProgramGeneratedCss([
      '.underline{-webkit-text-decoration-line:underline;text-decoration-line:underline}',
      '.backdrop-blur-lg{-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}',
      '.transition{transition-property:transform,-webkit-transform}',
      '.clip{-webkit-background-clip:text;background-clip:text}',
      '.icon{-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}',
      '.line-clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
      '.stroke{-webkit-text-fill-color:transparent;-webkit-text-stroke-color:red}',
      '.scroll{-webkit-overflow-scrolling:touch}',
    ].join('\n'))

    expect(css).not.toContain('-webkit-text-decoration-line')
    expect(css).not.toContain('-webkit-backdrop-filter')
    expect(css).not.toContain('-webkit-transform')
    expect(css).toContain('transition-property:transform')
    expect(css).toContain('-webkit-background-clip:text')
    expect(css).toContain('-webkit-mask-repeat:no-repeat')
    expect(css).toContain('display:-webkit-box')
    expect(css).toContain('-webkit-box-orient:vertical')
    expect(css).toContain('-webkit-line-clamp:2')
    expect(css).toContain('-webkit-text-fill-color:transparent')
    expect(css).toContain('-webkit-text-stroke-color:red')
    expect(css).toContain('-webkit-overflow-scrolling:touch')
  })

  it('normalizes modern color functions out of final mini-program css', () => {
    const css = finalizeMiniProgramCss([
      ':host,page,.tw-root,wx-root-portal-content{',
      '--color-blue-500:oklch(62.3% 0.214 259.815);',
      '--color-p3:color(display-p3 0.26642 0.49122 0.98862);',
      '--color-unknown:color-mix(in oklab, var(--missing) 50%, transparent);',
      '}',
      '.text-blue-500{color:var(--color-blue-500)}',
      '.text-p3{color:color(display-p3 0.26642 0.49122 0.98862)}',
      '.bg-lab{background-color:lab(50% 40 59.5)}',
      '.bg-mix{background-color:color-mix(in oklab, var(--color-blue-500) 50%, transparent)}',
      '.bg-unknown{background-color:color-mix(in oklab, var(--missing) 50%, transparent)}',
      '@media (color-gamut: p3){.p3-only{color:color(display-p3 1 0 0)}}',
    ].join('\n'))

    expect(css).toContain('--color-blue-500:rgb(50, 128, 255)')
    expect(css).toContain('--color-p3:rgb(50, 128, 255)')
    expect(css).toContain('color:rgb(50, 128, 255)')
    expect(css).toContain('background-color:rgb(191, 87, 0)')
    expect(css).toContain('background-color:rgba(50, 128, 255, 0.5)')
    expect(css).toContain('--color-unknown:var(--missing)')
    expect(css).toContain('.bg-unknown{background-color:var(--missing)}')
    expect(css).not.toContain('color-mix')
    expect(css).not.toContain('oklab')
    expect(css).not.toContain('oklch')
    expect(css).not.toContain('lab(')
    expect(css).not.toContain('display-p3')
    expect(css).not.toContain('color-gamut')
  })
})
