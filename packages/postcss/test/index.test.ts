import { generateCss4 } from '@weapp-tailwindcss/test-helper'
import path from 'pathe'
import { createStyleHandler, unitConversionComposeRules, unitConversionPresets } from '@/index'

function generateCss(css: string, base: string) {
  return generateCss4(base, { css })
}

describe('index', () => {
  it('exports unit conversion helpers', () => {
    expect(unitConversionComposeRules(unitConversionPresets.pxToRpx())).toEqual([
      expect.objectContaining({
        from: 'px',
        to: 'rpx',
      }),
    ])
  })

  it('keeps :host in transformed root scope for main chunk', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(':root{--x:1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('page,.tw-root,wx-root-portal-content,:host{--x:1;}')
  })

  it('keeps :host in transformed root scope for uni-app x main chunk', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const { css } = await styleHandler(':root{--x:1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('page,.tw-root,wx-root-portal-content,:host{--x:1;}')
  })

  it('transforms current and likely Tailwind :where selectors to mini-program-safe CSS', async () => {
    const styleHandler = createStyleHandler({
      cssChildCombinatorReplaceValue: ['view', 'text'],
      cssRemoveHoverPseudoClass: true,
      isMainChunk: true,
    })
    const { css } = await styleHandler(`
.dark\\:bg-black:where(.dark, .dark *){color:red;}
.dark\\:bg-black:where([data-mode="dark"], [data-mode="dark"] *){color:red;}
:where(.space-y-2 > :not(:last-child)){margin-top:1px;margin-bottom:2px;}
:where(.divide-x-4 > :not(:last-child)){border-left-width:4px;}
.group-hover\\:opacity-100:is(:where(.group):hover *){opacity:1;}
.group-\\[\\.destructive\\]\\:border-muted\\/40:is(:where(.group).destructive *){border-color:red;}
.peer-disabled\\:opacity-70:is(:where(.peer):disabled ~ *){opacity:.7;}
button,input:where([type="button"], [type="reset"], [type="submit"]){appearance:button;}
:where(select:is([multiple], [size])) optgroup{font-weight:700;}
:where(select:is([multiple], [size])) optgroup option{padding-inline-start:20px;}
:where(.child\\:ring-white) > :where(:not(.not-child)){box-shadow:0 0 #fff;}
`)

    expect(css).toContain('.dark_cbg-black.dark')
    expect(css).toContain('.space-y-2>view+view')
    expect(css).toContain('.divide-x-4>view+view')
    expect(css).toContain('input[type="button"]')
    expect(css).toContain('select[multiple] optgroup')
    expect(css).toContain('select[size] optgroup option')
    expect(css).not.toMatch(/:where\([^)]*,/)
    expect(css).not.toContain(':is(')
    expect(css).not.toContain('*')
    expect(css).not.toContain(':hover')
  })

  it('only utilities', async () => {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/calc-keyword
    const code = await generateCss('@import "tailwindcss";', path.resolve(__dirname, './fixtures/main'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
